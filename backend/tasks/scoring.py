from datetime import date, timedelta
from typing import Optional

# Simple global weights for "learning" demo
WEIGHTS = {
    "smart_balance": {
        "importance": 1.0,
        "urgency": 0.9,
        "effort": 0.5,
        "dependency": 1.1,
    }
}

# Very simple holiday list (bonus: date intelligence)
KNOWN_HOLIDAYS = set()  # you can add date(2025, 1, 1), etc. if you like


def is_business_day(d: date) -> bool:
    return d.weekday() < 5 and d not in KNOWN_HOLIDAYS


def business_days_until(due_date: date) -> int:
    """
    Count business days (Mon–Fri, excluding holidays) from today until due date.
    Negative => overdue in business days.
    """
    if not due_date:
        return None

    today = date.today()

    if due_date == today:
        return 0

    step = 1 if due_date > today else -1
    days = 0
    current = today

    while current != due_date:
        current += timedelta(days=step)
        if is_business_day(current):
            days += step

    return days


def days_until_due(due_date):
    """
    Fallback: simple calendar days diff.
    """
    if not due_date:
        return None
    today = date.today()
    return (due_date - today).days


def classify_importance(importance: int):
    if importance <= 3:
        return "Low importance", 8
    elif importance <= 6:
        return "Medium importance", 15
    elif importance <= 8:
        return "High importance", 22
    else:
        return "Critical importance", 30


def classify_urgency_biz(due_date):
    biz_days = business_days_until(due_date)
    if biz_days is None:
        return "No due date", 0, None

    if biz_days < 0:
        return "Overdue", 35 + abs(biz_days), biz_days
    if biz_days == 0:
        return "Due today", 30, biz_days
    if biz_days <= 3:
        return "Due very soon", 20, biz_days
    if biz_days <= 7:
        return "Due this week", 10, biz_days
    return "Upcoming deadline", 5, biz_days


def classify_effort(hours):
    if hours is None:
        return "Unknown effort", 0
    if hours <= 2:
        return "Quick win (low effort)", 12
    if hours <= 6:
        return "Moderate effort", 5
    return "Large effort task", -8  # penalty


def classify_priority_band(score: float) -> str:
    if score >= 65:
        return "High"
    if score >= 35:
        return "Medium"
    return "Low"




def eisenhower_quadrant(importance: int, biz_days: Optional[int]) -> str:

    """
    Eisenhower Matrix:
       - Urgent = biz_days <= 2 or overdue
       - Important = importance >= 7
    """
    
    if biz_days is None:
        urgent = False
    else:
        urgent = biz_days <= 2

    important = importance >= 7

    if urgent and important:
        return "Do First (Urgent & Important)"
    if important and not urgent:
        return "Schedule (Not Urgent & Important)"
    if urgent and not important:
        return "Delegate (Urgent & Less Important)"
    return "Eliminate (Not Urgent & Less Important)"


def compute_priority(task, dependency_graph=None, mode="smart_balance"):
    """
    Core scoring logic. Supports multiple modes and basic "learning"
    via global WEIGHTS for smart_balance.
    """
    importance = getattr(task, "importance", 0) or 0
    hours = getattr(task, "estimated_hours", None)
    due = getattr(task, "due_date", None)

    # Importance
    importance_label, importance_score = classify_importance(importance)

    # Urgency using business days (weekend/holiday aware)
    urgency_label, urgency_score, biz_days = classify_urgency_biz(due)

    # Effort
    effort_label, effort_score = classify_effort(hours)

    # Dependencies (how many tasks this one unblocks)
    dependents_count = 0
    if dependency_graph and getattr(task, "id", None) in dependency_graph:
        dependents_count = len(dependency_graph[task.id])

    dependency_score = dependents_count * 6
    dependency_label = f"Unblocks {dependents_count} task(s)" if dependents_count else "No blockers"

    # ---- Mode-specific blending ----
    if mode == "fastest_wins":
        score = (
            effort_score * 2
            + importance_score * 0.7
            + urgency_score * 0.3
            + dependency_score * 0.5
        )
    elif mode == "high_impact":
        score = (
            importance_score * 2.0
            + urgency_score * 1.0
            + dependency_score * 0.8
            + effort_score * 0.2
        )
    elif mode == "deadline_driven":
        score = (
            urgency_score * 2.0
            + importance_score * 1.0
            + dependency_score * 0.7
            + effort_score * 0.3
        )
    else:  # smart_balance (uses WEIGHTS)
        w = WEIGHTS.get("smart_balance", {
            "importance": 1.0,
            "urgency": 0.9,
            "effort": 0.5,
            "dependency": 1.1,
        })
        score = (
            importance_score * w["importance"]
            + urgency_score * w["urgency"]
            + effort_score * w["effort"]
            + dependency_score * w["dependency"]
        )

    score = max(0, round(score, 2))
    priority_band = classify_priority_band(score)
    quadrant = eisenhower_quadrant(importance, biz_days)

    return {
        "score": score,
        "importance_label": importance_label,
        "urgency_label": urgency_label,
        "effort_label": effort_label,
        "dependency_label": dependency_label,
        "priority_band": priority_band,
        "quadrant": quadrant,
    }


def detect_cycles(tasks):
    """
    Detect circular dependencies between tasks.
    Returns a set of IDs that participate in any cycle.
    """
    graph = {t["id"]: t.get("dependencies", []) for t in tasks}
    visited = set()
    stack = set()
    cycles = set()

    def dfs(node):
        if node in stack:
            cycles.add(node)
            return
        if node in visited:
            return

        visited.add(node)
        stack.add(node)

        for child in graph.get(node, []):
            if child in graph:  # only traverse known tasks
                dfs(child)

        stack.remove(node)

    for node in graph:
        dfs(node)

    return cycles


def build_dependency_graph(tasks):
    """
    Reverse graph: id -> list of tasks that depend on it.
    """
    dep_graph = {}
    for t in tasks:
        for dep in t.get("dependencies", []):
            dep_graph.setdefault(dep, []).append(t["id"])
    return dep_graph


def build_explanation(task_dict, score_info, in_cycle: bool, unblocks_count: int):
    """
    Human readable explanation string.
    """
    reasons = []

    importance_label = score_info["importance_label"]
    urgency_label = score_info["urgency_label"]
    effort_label = score_info["effort_label"]
    dependency_label = score_info["dependency_label"]
    quadrant = score_info["quadrant"]

    reasons.append(importance_label)
    reasons.append(urgency_label)
    reasons.append(effort_label)
    reasons.append(dependency_label)

    if in_cycle:
        reasons.append("⚠ Part of a circular dependency chain")

    if unblocks_count:
        reasons.append(f"Unblocks {unblocks_count} downstream task(s)")

    reasons.append(f"Eisenhower zone: {quadrant}")
    reasons.append(f"Final score: {score_info['score']}")

    return "; ".join(reasons)
