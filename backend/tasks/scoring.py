from datetime import date


# ---------------------------------------------------------
# DAYS UNTIL DUE
# ---------------------------------------------------------
def days_until_due(due_date):
    if not due_date:
        return None
    today = date.today()
    return (due_date - today).days


# ---------------------------------------------------------
# PRIORITY SCORING ENGINE
# ---------------------------------------------------------
def compute_priority(task, dependency_graph=None, mode="smart_balance"):
    importance = getattr(task, "importance", 0) or 0
    hours = getattr(task, "estimated_hours", 0) or 0
    due = getattr(task, "due_date", None)

    # ---------------- Urgency ----------------
    days = days_until_due(due)

    if days is None:
        urgency_score = 0
    elif days < 0:
        urgency_score = 30 + (-days)
    elif days == 0:
        urgency_score = 25
    elif days <= 3:
        urgency_score = 20
    elif days <= 7:
        urgency_score = 10
    else:
        urgency_score = 5

    # ---------------- Effort ----------------
    if hours == 0:
        effort_score = 0
    elif hours <= 2:
        effort_score = 15
    elif hours <= 4:
        effort_score = 8
    else:
        effort_score = 2

    # ---------------- Importance ----------------
    importance_score = importance * 3

    # ---------------- Dependencies ----------------
    dependents_count = 0
    if dependency_graph and getattr(task, "id", None) in dependency_graph:
        dependents_count = len(dependency_graph[task.id])

    dependency_score = dependents_count * 5

    # -------------------------------------------------
    # MODE-BASED WEIGHTING
    # -------------------------------------------------
    if mode == "fastest_wins":
        score = effort_score * 2 + importance_score * 0.5

    elif mode == "high_impact":
        score = importance_score * 2 + urgency_score * 0.5

    elif mode == "deadline_driven":
        score = urgency_score * 2 + importance_score * 0.5

    else:  # smart_balance
        score = (
            urgency_score * 0.8
            + importance_score * 1.0
            + effort_score * 0.6
            + dependency_score * 1.2
        )

    return round(score, 2)


# ---------------------------------------------------------
# CYCLE DETECTION
# ---------------------------------------------------------
def detect_cycles(tasks):
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
            dfs(child)

        stack.remove(node)

    for node in graph:
        dfs(node)

    return list(cycles)


# ---------------------------------------------------------
# BUILD DEPENDENCY GRAPH (reverse)
# ---------------------------------------------------------
def build_dependency_graph(tasks):
    dep_graph = {}
    for t in tasks:
        for dep in t.get("dependencies", []):
            dep_graph.setdefault(dep, []).append(t["id"])
    return dep_graph


# ---------------------------------------------------------
# EXPLANATION BUILDER
# ---------------------------------------------------------
def build_explanation(task_dict, score, cycles, dep_graph):
    reasons = []

    importance = task_dict.get("importance", 0) or 0
    hours = task_dict.get("estimated_hours", None)
    due = task_dict.get("due_date", None)
    deps = task_dict.get("dependencies", [])

    # Importance reasoning
    if importance >= 8:
        reasons.append("High importance")
    elif importance >= 5:
        reasons.append("Medium importance")
    else:
        reasons.append("Low importance")

    # Effort reasoning
    if hours is not None:
        if hours <= 2:
            reasons.append("Quick win (low effort)")
        elif hours >= 6:
            reasons.append("Large effort task")

    # Urgency reasoning
    from datetime import date
    d = days_until_due(due)

    if d is not None:
        if d < 0:
            reasons.append("Overdue task")
        elif d == 0:
            reasons.append("Due today")
        elif d <= 3:
            reasons.append("Due very soon")
        elif d <= 7:
            reasons.append("Due this week")

    # Dependencies
    if deps:
        reasons.append(f"Depends on {len(deps)} task(s)")

    unblocks = len(dep_graph.get(task_dict["id"], []))
    if unblocks > 0:
        reasons.append(f"Unblocks {unblocks} task(s)")

    if task_dict["id"] in cycles:
        reasons.append("Part of a circular dependency")

    reasons.append(f"Final score: {score}")

    return "; ".join(reasons)
