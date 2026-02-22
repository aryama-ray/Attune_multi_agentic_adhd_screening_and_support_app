def calculate_momentum(checkins: list[dict]) -> dict:
    """Calculate momentum score from checkin history.
    Uses weighted average of mood + completion with exponential recency."""
    if not checkins:
        return {"score": 0, "delta": 0}

    scores = []
    for c in checkins:
        total = c["tasks_total"] or 1
        completion = (c["tasks_completed"] / total) * 100
        # Composite: 60% mood (scaled to 100) + 40% completion
        composite = (c["mood_score"] * 10) * 0.6 + completion * 0.4
        scores.append(composite)

    # Weighted: last 3 days count 2x
    n = len(scores)
    weights = [2.0 if i >= n - 3 else 1.0 for i in range(n)]
    total_weight = sum(weights)
    weighted_score = sum(s * w for s, w in zip(scores, weights)) / total_weight

    # Delta: compare last 3 days avg vs first 3 days avg
    if n >= 6:
        early = sum(scores[:3]) / 3
        recent = sum(scores[-3:]) / 3
        delta = round(recent - early)
    else:
        delta = 0

    return {"score": round(weighted_score), "delta": delta}
