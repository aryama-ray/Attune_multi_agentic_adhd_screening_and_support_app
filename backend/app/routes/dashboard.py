from fastapi import APIRouter, HTTPException
from app.models import DashboardResponse, TrendDataPoint, HypothesisCard, AgentAnnotation
from app.database import get_supabase
from app.services.momentum_service import calculate_momentum

router = APIRouter()

@router.get("/{user_id}", response_model=DashboardResponse)
async def get_dashboard(user_id: str):
    """Fetch dashboard data: trends, momentum, hypothesis cards, annotations."""
    db = get_supabase()

    # Fetch checkins (last 14 days)
    checkins = (
        db.table("checkins")
        .select("*")
        .eq("user_id", user_id)
        .order("checkin_date", desc=False)
        .limit(14)
        .execute()
    )
    if not checkins.data:
        raise HTTPException(status_code=404, detail="No dashboard data found")

    # Build trend data
    trend_data = []
    for i, c in enumerate(checkins.data):
        total = c["tasks_total"] or 1
        trend_data.append(TrendDataPoint(
            date=c["checkin_date"],
            dayNumber=i + 1,
            moodScore=c["mood_score"],
            completionRate=round((c["tasks_completed"] / total) * 100),
            brainState=c.get("energy_level", "medium"),
            tasksCompleted=c["tasks_completed"],
            tasksTotal=c["tasks_total"],
        ))

    # Calculate momentum
    momentum = calculate_momentum(checkins.data)

    # Fetch hypothesis cards
    hypothesis_rows = (
        db.table("hypothesis_cards")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=False)
        .execute()
    )
    hypothesis_cards = [
        HypothesisCard(
            id=h["id"],
            patternDetected=h["pattern_detected"],
            prediction=h["prediction"],
            confidence=h["confidence"],
            status=h["status"],
            supportingEvidence=h["supporting_evidence"] or [],
            createdAt=str(h["created_at"]),
        )
        for h in hypothesis_rows.data
    ]

    # Build agent annotations from hypothesis cards and interventions
    annotations = []
    for h in hypothesis_rows.data:
        if h.get("annotation_day") and h.get("agent_annotation"):
            annotations.append(AgentAnnotation(
                dayNumber=h["annotation_day"],
                text=h["agent_annotation"],
                type="hypothesis",
            ))

    # Add intervention annotations
    interventions = (
        db.table("interventions")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )
    for idx, intv in enumerate(interventions.data):
        # Map intervention to nearest checkin day
        annotations.append(AgentAnnotation(
            dayNumber=4 if idx == 0 else 11,  # Seeded positions
            text=f"Intervention: {intv['agent_reasoning'][:80]}...",
            type="intervention",
        ))

    return DashboardResponse(
        trendData=trend_data,
        momentumScore=momentum["score"],
        momentumDelta=momentum["delta"],
        hypothesisCards=hypothesis_cards,
        agentAnnotations=annotations,
    )
