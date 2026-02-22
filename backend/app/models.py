from pydantic import BaseModel
from typing import Optional


# ── Auth ──
class GuestLoginResponse(BaseModel):
    userId: str
    name: str
    isGuest: bool
    hasProfile: bool


# ── ASRS Screening ──
class ASRSAnswer(BaseModel):
    questionIndex: int
    questionText: str
    score: int


class ScreeningRequest(BaseModel):
    userId: str
    answers: list[ASRSAnswer]


class RadarDimension(BaseModel):
    key: str
    label: str
    value: int
    insight: str


class ScreeningResponse(BaseModel):
    profileId: str
    dimensions: list[RadarDimension]
    profileTags: list[str]
    summary: str
    asrsTotalScore: int
    isPositiveScreen: bool


# ── Cognitive Profile ──
class ProfileResponse(BaseModel):
    dimensions: list[RadarDimension]
    profileTags: list[str]
    summary: str


# ── Daily Plan ──
class Task(BaseModel):
    index: int
    title: str
    description: str
    duration_minutes: int
    time_slot: str
    category: str
    rationale: str
    priority: str
    status: str = "pending"


class PlanRequest(BaseModel):
    userId: str
    brainState: str
    tasks: Optional[list[str]] = None


class PlanResponse(BaseModel):
    planId: str
    tasks: list[Task]
    overallRationale: str


# ── Intervention ──
class InterventionRequest(BaseModel):
    userId: str
    planId: str
    stuckTaskIndex: int
    userMessage: Optional[str] = None


class InterventionResponse(BaseModel):
    interventionId: str
    acknowledgment: str
    restructuredTasks: list[Task]
    agentReasoning: str
    followupHint: Optional[str] = None


# ── Dashboard ──
class TrendDataPoint(BaseModel):
    date: str
    dayNumber: int
    moodScore: int
    completionRate: float
    brainState: str
    tasksCompleted: int
    tasksTotal: int


class HypothesisCard(BaseModel):
    id: str
    patternDetected: str
    prediction: str
    confidence: str
    status: str
    supportingEvidence: list[dict]
    createdAt: str


class AgentAnnotation(BaseModel):
    dayNumber: int
    text: str
    type: str


class DashboardResponse(BaseModel):
    trendData: list[TrendDataPoint]
    momentumScore: int
    momentumDelta: int
    hypothesisCards: list[HypothesisCard]
    agentAnnotations: list[AgentAnnotation]
