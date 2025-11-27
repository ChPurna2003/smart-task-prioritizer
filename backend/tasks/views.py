from types import SimpleNamespace

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import TaskInputSerializer
from .scoring import (
    compute_priority,
    detect_cycles,
    build_dependency_graph,
    build_explanation,
    WEIGHTS,
)


class AnalyzeTasksView(APIView):
    """
    POST /api/tasks/analyze/?mode=smart_balance
    Body: [ {task}, {task}, ... ]
    Returns: scored + sorted tasks
    """

    def post(self, request):
        serializer = TaskInputSerializer(data=request.data, many=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        tasks = serializer.validated_data
        if not tasks:
            return Response([], status=status.HTTP_200_OK)

        mode = request.query_params.get("mode", "smart_balance")

        cycles = detect_cycles(tasks)
        dep_graph = build_dependency_graph(tasks)

        scored = []
        for t in tasks:
            t_obj = SimpleNamespace(**t)
            score_info = compute_priority(t_obj, dep_graph, mode=mode)
            unblocks = len(dep_graph.get(t["id"], []))
            explanation = build_explanation(
                t,
                score_info,
                in_cycle=t["id"] in cycles,
                unblocks_count=unblocks,
            )

            scored.append({
                **t,
                "score": score_info["score"],
                "priority_band": score_info["priority_band"],
                "quadrant": score_info["quadrant"],
                "importance_label": score_info["importance_label"],
                "urgency_label": score_info["urgency_label"],
                "effort_label": score_info["effort_label"],
                "dependency_label": score_info["dependency_label"],
                "in_cycle": t["id"] in cycles,
                "explanation": explanation,
            })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return Response(scored, status=status.HTTP_200_OK)


class SuggestTasksView(APIView):
    """
    POST /api/tasks/suggest/
    Body: same as /analyze
    Returns: top 3 tasks for "today".
    (Just uses smart_balance under the hood)
    """

    def post(self, request):
        serializer = TaskInputSerializer(data=request.data, many=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        tasks = serializer.validated_data
        if not tasks:
            return Response([], status=status.HTTP_200_OK)

        cycles = detect_cycles(tasks)
        dep_graph = build_dependency_graph(tasks)

        scored = []
        for t in tasks:
            t_obj = SimpleNamespace(**t)
            score_info = compute_priority(t_obj, dep_graph, mode="smart_balance")
            unblocks = len(dep_graph.get(t["id"], []))
            explanation = build_explanation(
                t,
                score_info,
                in_cycle=t["id"] in cycles,
                unblocks_count=unblocks,
            )
            scored.append({
                **t,
                "score": score_info["score"],
                "priority_band": score_info["priority_band"],
                "quadrant": score_info["quadrant"],
                "in_cycle": t["id"] in cycles,
                "explanation": explanation,
            })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return Response(scored[:3], status=status.HTTP_200_OK)


class FeedbackView(APIView):
    """
    POST /api/tasks/feedback/
    Body:
    {
      "mode": "smart_balance",
      "feedback": [
        {"id": "login", "helpful": true},
        {"id": "report", "helpful": false}
      ]
    }

    Very simple demo: adjusts global WEIGHTS slightly.
    """

    def post(self, request):
        mode = request.data.get("mode", "smart_balance")
        feedback = request.data.get("feedback", [])

        helpful_count = sum(1 for f in feedback if f.get("helpful") is True)
        not_helpful = sum(1 for f in feedback if f.get("helpful") is False)

        if mode != "smart_balance" or not feedback:
            return Response(
                {"detail": "Feedback recorded (no changes or unsupported mode)."},
                status=status.HTTP_200_OK,
            )

        if helpful_count > not_helpful:
            # User liked suggestions → slightly increase importance weight
            WEIGHTS["smart_balance"]["importance"] = round(
                WEIGHTS["smart_balance"]["importance"] + 0.05, 2
            )
        elif not_helpful > helpful_count:
            # Reduce importance a bit, boost urgency
            WEIGHTS["smart_balance"]["importance"] = round(
                WEIGHTS["smart_balance"]["importance"] - 0.05, 2
            )
            WEIGHTS["smart_balance"]["urgency"] = round(
                WEIGHTS["smart_balance"]["urgency"] + 0.05, 2
            )

        return Response(
            {
                "detail": "Feedback applied.",
                "weights": WEIGHTS["smart_balance"],
            },
            status=status.HTTP_200_OK,
        )
