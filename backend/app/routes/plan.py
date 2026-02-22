import asyncio
from fastapi import APIRouter, HTTPException
from app.models import PlanRequest, PlanResponse, InterventionRequest, InterventionResponse
from app.database import get_supabase

router = APIRouter()

@router.post("/generate", response_model=PlanResponse)
async def generate_plan(request: PlanRequest):
    """Generate a daily plan using the CrewAI planning agent."""
    from app.agents.planning_agent import run_planning
    result = await asyncio.to_thread(
        run_planning, request.userId, request.brainState, request.tasks
    )
    if "error" in result:
        raise HTTPException(status_code=500, detail=result.get("raw", "Planning failed"))
    return PlanResponse(
        planId=result.get("planId", ""),
        tasks=result.get("tasks", []),
        overallRationale=result.get("overallRationale", ""),
    )

@router.post("/intervene", response_model=InterventionResponse)
async def intervene(request: InterventionRequest):
    """Handle an 'I'm stuck' intervention using the CrewAI intervention agent."""
    from app.agents.intervention_agent import run_intervention
    result = await asyncio.to_thread(
        run_intervention,
        request.userId,
        request.planId,
        request.stuckTaskIndex,
        request.userMessage,
    )
    if "error" in result:
        raise HTTPException(status_code=500, detail=result.get("raw", "Intervention failed"))
    return InterventionResponse(
        interventionId=result.get("interventionId", ""),
        acknowledgment=result.get("acknowledgment", ""),
        restructuredTasks=result.get("restructuredTasks", []),
        agentReasoning=result.get("agentReasoning", ""),
        followupHint=result.get("followupHint"),
    )
