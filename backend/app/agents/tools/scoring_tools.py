import json
from crewai.tools import tool


ASRS_QUESTIONS = [
    "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
    "How often do you have difficulty getting things in order when you have to do a task that requires organization?",
    "How often do you have problems remembering appointments or obligations?",
    "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?",
    "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?",
    "How often do you feel overly active and compelled to do things, like you were driven by a motor?",
]

ANSWER_LABELS = ["Never", "Rarely", "Sometimes", "Often", "Very Often"]

# Mapping: which ASRS questions primarily influence which radar dimensions
# Questions 0-1: inattention → Attention Regulation, Working Memory
# Questions 2-3: organization/avoidance → Task Initiation, Time Perception
# Questions 4-5: hyperactivity → Emotional Intensity, Hyperfocus Capacity
DIMENSION_MAP = {
    "attention_regulation": [0, 1],
    "time_perception": [2, 3],
    "emotional_intensity": [4, 5],
    "working_memory": [0, 2],
    "task_initiation": [3, 4],
    "hyperfocus_capacity": [1, 5],
}


@tool
def score_asrs(answers_json: str) -> str:
    """Calculate the ASRS-6 total score and per-dimension scores from 6 answers.
    Input: JSON string of answers array [{questionIndex, score}].
    Returns: JSON with totalScore, isPositiveScreen, and dimensionScores."""
    answers = json.loads(answers_json)
    total = sum(a["score"] for a in answers)
    is_positive = total >= 14

    # Map to radar dimensions (0-100 scale)
    score_by_index = {a["questionIndex"]: a["score"] for a in answers}
    dimension_scores = {}
    for dim_key, q_indices in DIMENSION_MAP.items():
        raw = sum(score_by_index.get(qi, 0) for qi in q_indices)
        # Normalize: max possible per dimension is 8 (2 questions * 4 max)
        dimension_scores[dim_key] = round((raw / 8) * 100)

    return json.dumps({
        "totalScore": total,
        "isPositiveScreen": is_positive,
        "dimensionScores": dimension_scores,
    })
