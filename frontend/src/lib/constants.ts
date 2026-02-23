import type { BrainState } from "@/types";

// Harvard ASRS-6 screening questions (public domain, WHO)
export const ASRS_QUESTIONS = [
  "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
  "How often do you have difficulty getting things in order when you have to do a task that requires organization?",
  "How often do you have problems remembering appointments or obligations?",
  "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?",
  "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?",
  "How often do you feel overly active and compelled to do things, like you were driven by a motor?",
] as const;

// Likert scale: label → score (0-4)
export const ANSWER_OPTIONS = [
  { label: "Never", score: 0 },
  { label: "Rarely", score: 1 },
  { label: "Sometimes", score: 2 },
  { label: "Often", score: 3 },
  { label: "Very Often", score: 4 },
] as const;

// Radar chart dimension labels (must match backend dimension keys)
export const RADAR_DIMENSIONS = [
  { key: "attention_regulation", label: "Attention Regulation" },
  { key: "time_perception", label: "Time Perception" },
  { key: "emotional_intensity", label: "Emotional Intensity" },
  { key: "working_memory", label: "Working Memory" },
  { key: "task_initiation", label: "Task Initiation" },
  { key: "hyperfocus_capacity", label: "Hyperfocus Capacity" },
] as const;

// Brain state UI config
export const BRAIN_STATES: Record<BrainState, {
  label: string;
  description: string;
  icon: string;
  color: string;
  lightColor: string;
}> = {
  foggy: {
    label: "Foggy",
    description: "Low energy, hard to focus",
    icon: "Cloud",
    color: "var(--foggy)",
    lightColor: "var(--foggy-light)",
  },
  focused: {
    label: "Focused",
    description: "Clear mind, ready to work",
    icon: "Crosshair",
    color: "var(--focused)",
    lightColor: "var(--focused-light)",
  },
  wired: {
    label: "Wired",
    description: "High energy, restless",
    icon: "Zap",
    color: "var(--wired)",
    lightColor: "var(--wired-light)",
  },
};

// Task category → color mapping (for TaskCard left border)
export const CATEGORY_COLORS: Record<string, string> = {
  deep_work: "var(--cat-deep-work)",
  "deep-work": "var(--cat-deep-work)",
  admin: "var(--cat-admin)",
  creative: "var(--cat-creative)",
  physical: "var(--cat-physical)",
  social: "var(--cat-social)",
  communication: "var(--cat-communication)",
  planning: "var(--cat-planning)",
  learning: "var(--cat-learning)",
  review: "var(--cat-review)",
};

// Category → lucide icon name mapping
export const CATEGORY_ICONS: Record<string, string> = {
  deep_work: "Brain",
  "deep-work": "Brain",
  admin: "ClipboardList",
  creative: "Palette",
  physical: "Activity",
  social: "Users",
  communication: "MessageSquare",
  planning: "LayoutGrid",
  learning: "BookOpen",
  review: "Search",
};
