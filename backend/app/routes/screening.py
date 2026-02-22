import asyncio
from fastapi import APIRouter, HTTPException
from app.models import ScreeningRequest, ScreeningResponse
from app.database import get_supabase

router = APIRouter()

@router.post("/evaluate", response_model=ScreeningResponse)
async def evaluate_screening(request: ScreeningRequest):
    """Run ASRS screening through the CrewAI screening agent."""
    db = get_supabase()
    # Save ASRS answers to DB
    for answer in request.answers:
        db.table("asrs_responses").insert({
            "user_id": request.userId,
            "question_index": answer.questionIndex,
            "question_text": answer.questionText,
            "answer_label": ["Never", "Rarely", "Sometimes", "Often", "Very Often"][answer.score],
            "score": answer.score,
        }).execute()

    # Run the screening crew
    from app.agents.screening_agent import run_screening
    answers_data = [{"questionIndex": a.questionIndex, "questionText": a.questionText, "score": a.score} for a in request.answers]
    result = await asyncio.to_thread(run_screening, request.userId, answers_data)

    if "error" in result:
        raise HTTPException(status_code=500, detail=result.get("raw", "Screening failed"))

    total = sum(a.score for a in request.answers)
    return ScreeningResponse(
        profileId=result.get("profileId", ""),
        dimensions=result.get("dimensions", []),
        profileTags=result.get("profileTags", []),
        summary=result.get("summary", ""),
        asrsTotalScore=result.get("asrsTotalScore", total),
        isPositiveScreen=result.get("isPositiveScreen", total >= 14),
    )
