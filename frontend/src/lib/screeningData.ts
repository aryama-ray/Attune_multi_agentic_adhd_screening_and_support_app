export interface Question {
  id: string;
  text: string;
  dimension: string;
}

export interface AnswerOption {
  label: string;
  score: number;
}

export const ASRS_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "How often do you have trouble staying focused on a task until it's completely finished?",
    dimension: "Focus",
  },
  {
    id: "q2",
    text: "How often does your mind wander when you're reading, even when you're trying to concentrate?",
    dimension: "Focus",
  },
  {
    id: "q3",
    text: "How often do you have difficulty organising tasks that require multiple steps?",
    dimension: "Organisation",
  },
  {
    id: "q4",
    text: "How often do you delay or avoid starting tasks that need sustained mental effort?",
    dimension: "Organisation",
  },
  {
    id: "q5",
    text: "How often do you forget where you put things, or lose track of appointments and obligations?",
    dimension: "Working Memory",
  },
  {
    id: "q6",
    text: "How often do you lose your train of thought when switching between tasks?",
    dimension: "Working Memory",
  },
  {
    id: "q7",
    text: "How often do you feel restless or find it hard to stay still when you need to?",
    dimension: "Hyperactivity",
  },
  {
    id: "q8",
    text: "How often do you feel driven by an inner motor — needing to always be doing something?",
    dimension: "Hyperactivity",
  },
  {
    id: "q9",
    text: "How often do you act or speak without thinking it through first?",
    dimension: "Impulsivity",
  },
  {
    id: "q10",
    text: "How often do you find yourself jumping into conversations before the other person has finished?",
    dimension: "Impulsivity",
  },
  {
    id: "q11",
    text: "How often do small frustrations trigger strong emotional reactions in you?",
    dimension: "Emotional Regulation",
  },
  {
    id: "q12",
    text: "How often do you find it hard to calm down after something upsetting has happened?",
    dimension: "Emotional Regulation",
  },
];

export const ANSWER_OPTIONS: AnswerOption[] = [
  { label: "Never", score: 0 },
  { label: "Rarely", score: 1 },
  { label: "Sometimes", score: 2 },
  { label: "Often", score: 3 },
  { label: "Very Often", score: 4 },
];

export const DIMENSIONS = [
  "Focus",
  "Organisation",
  "Working Memory",
  "Hyperactivity",
  "Impulsivity",
  "Emotional Regulation",
] as const;

export type Dimension = (typeof DIMENSIONS)[number];
