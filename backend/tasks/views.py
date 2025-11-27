from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import TaskInputSerializer
from .scoring import (
    compute_priority,
    detect_cycles,
    build_dependency_graph,
    build_explanation
)


class AnalyzeTasksView(APIView):
    """
    POST /api/tasks/analyze/?mode=smart_balance
    Takes a list of tasks and returns them sorted by score.
    """

    def post(self, request):
        serializer = TaskInputSerializer(data=request.data, many=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        tasks = serializer.validated_data
        if not tasks:
            return Response([], status=status.HTTP_200_OK)

        # Build dependency data
        cycles = detect_cycles(tasks)
        dep_graph = build_dependency_graph(tasks)

        mode = request.query_params.get("mode", "smart_balance")

        # Convert dict → object
        class TaskObj:
            def __init__(self, data):
                for k, v in data.items():
                    setattr(self, k, v)

        scored = []
        for t in tasks:
            t_obj = TaskObj(t)
            score = compute_priority(t_obj, dep_graph, mode)
            explanation = build_explanation(t, score, cycles, dep_graph)

            scored.append({
                **t,
                "score": score,
                "explanation": explanation
            })

        scored.sort(key=lambda x: x["score"], reverse=True)

        return Response(scored, status=status.HTTP_200_OK)


class SuggestTasksView(APIView):
    """
    POST /api/tasks/suggest/
    Returns the top 3 highest priority tasks.
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

        class TaskObj:
            def __init__(self, data):
                for k, v in data.items():
                    setattr(self, k, v)

        scored = []
        for t in tasks:
            obj = TaskObj(t)
            score = compute_priority(obj, dep_graph, mode="smart_balance")
            explanation = build_explanation(t, score, cycles, dep_graph)

            scored.append({
                **t,
                "score": score,
                "explanation": explanation
            })

        scored.sort(key=lambda x: x["score"], reverse=True)

        return Response(scored[:3], status=status.HTTP_200_OK)
