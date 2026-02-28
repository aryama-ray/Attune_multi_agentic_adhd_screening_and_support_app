from pydantic import BaseModel, Field
from typing import Literal, Optional


# ── Auth ──
class GuestLoginResponse(BaseModel):
    userId: str
    name: str
    isGuest: bool
    hasProfile: bool
    accessToken: Optional[str] = None


class SignupRequest(BaseModel):
    email: str
    password: str
    name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    userId: str
    name: str
    isGuest: bool
    hasProfile: bool
    accessToken: str


# ── ASRS Screening ──
class ASRSAnswer(BaseModel):
    questionIndex: int
    questionText: str
    score: int = Field(ge=0, le=4)


class ScreeningRequest(BaseModel):
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
    brainState: Literal["foggy", "focused", "wired"]
    tasks: Optional[list[str]] = None
    timeWindowMinutes: Optional[int] = Field(None, ge=15, le=480)  # 15 min to 8 hrs


class PlanResponse(BaseModel):
    planId: str
    tasks: list[Task]
    overallRationale: str


# ── Intervention ──
class InterventionRequest(BaseModel):
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
    confidence: Literal["low", "medium", "high"]
    status: Literal["active", "confirmed", "disproved", "evolving"]
    supportingEvidence: list[dict]
    createdAt: str


class AgentAnnotation(BaseModel):
    dayNumber: int
    text: str
    type: str


class FeedbackItem(BaseModel):
    id: str
    rating: int
    feedback: Optional[str] = None
    date: str


class DashboardResponse(BaseModel):
    trendData: list[TrendDataPoint]
    momentumScore: int
    momentumDelta: int
    hypothesisCards: list[HypothesisCard]
    agentAnnotations: list[AgentAnnotation]
    feedbackHistory: list[FeedbackItem] = []


# ── CrewAI Structured Output Models ──
# These are used with output_pydantic in CrewAI tasks to replace fragile JSON parsing.

class ScreeningOutput(BaseModel):
    """Structured output from the screening agent."""
    dimensions: list[RadarDimension]
    profileTags: list[str]
    summary: str
    asrsTotalScore: int
    isPositiveScreen: bool
    profileId: str


class PlanOutput(BaseModel):
    """Structured output from the planning agent."""
    planId: str
    tasks: list[Task]
    overallRationale: str


class InterventionOutput(BaseModel):
    """Structured output from the intervention agent."""
    interventionId: str
    acknowledgment: str
    restructuredTasks: list[Task]
    agentReasoning: str
    followupHint: Optional[str] = None



# ── Pattern Detection Structured Output ──
class PatternEvidence(BaseModel):
    day: int
    detail: str


class PatternCard(BaseModel):
    patternDetected: str
    prediction: str
    confidence: Literal["low", "medium", "high"]
    supportingEvidence: list[PatternEvidence]
    status: Literal["active", "confirmed", "disproved", "evolving"] = "active"


class PatternOutput(BaseModel):
    """Structured output from the pattern detection agent."""
    cards: list[PatternCard]
