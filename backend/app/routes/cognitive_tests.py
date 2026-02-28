from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Any
from app.database import get_supabase_admin
from app.middleware.auth import get_current_user

router = APIRouter()


class SaveTestRequest(BaseModel):
    userId: str
    testType: str   # 'asrs' | 'time_perception' | 'reaction_time'
    score: int
    rawData: dict[str, Any]
    metrics: dict[str, Any]
    label: str
    interpretation: str


@router.post("/save")
async def save_test_result(
    request: SaveTestRequest,
    user_id: str = Depends(get_current_user),
):
    """Save a cognitive test result (ASRS, time perception, or reaction time)."""
    # Ensure users can only save their own results
    if request.userId != user_id:
        raise HTTPException(status_code=403, detail="Can only save your own test results")

    db = get_supabase_admin()
    result = db.table("cognitive_tests").insert({
        "user_id": user_id,
        "test_type": request.testType,
        "score": request.score,
        "raw_data": request.rawData,
        "metrics": request.metrics,
        "label": request.label,
        "interpretation": request.interpretation,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save test result")

    return {"testId": result.data[0]["id"], "status": "saved"}


@router.get("/{user_id}")
async def get_test_results(
    user_id: str,
    current_user: str = Depends(get_current_user),
):
    """Get the most recent result for each test type for a user."""
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Can only view your own test results")

    db = get_supabase_admin()
    results = (
        db.table("cognitive_tests")
        .select("*")
        .eq("user_id", user_id)
        .order("completed_at", desc=True)
        .execute()
    )

    # Keep only the most recent per test_type
    seen: dict[str, Any] = {}
    for row in results.data:
        t = row["test_type"]
        if t not in seen:
            seen[t] = row

    return {"tests": list(seen.values())}
