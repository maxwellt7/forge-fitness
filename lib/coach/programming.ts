import type {
  AthleteProfile,
  ProgramState,
  TrainingSession,
  WorkoutFeedback,
  SessionBlock,
  IntensityBias,
  ProgressAdjustment,
} from "./types";

const WAVE_LENGTH_WEEKS = 4;

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function buildCoachNotes(adjustment: ProgressAdjustment, profile: AthleteProfile) {
  if (adjustment === "pull-back") {
    return [
      "Prioritize recovery and cleaner positions before pushing loading.",
      profile.limitations.includes("none")
        ? "Conditioning is reduced to preserve recovery and movement quality."
        : `Work around ${profile.limitations.join(", ")} while keeping the session crisp.`,
    ];
  }

  if (adjustment === "progress") {
    return [
      "Recovery looks strong, so the next session can build with a small progression.",
      "Keep one to two reps in reserve on the main lifts while earning the finisher.",
    ];
  }

  return [
    "Stay steady today and prioritize repeatable quality across all work sets.",
    "Use clean mechanics and smooth pacing to support long-term progress.",
  ];
}

function getAdjustment(feedback?: WorkoutFeedback): ProgressAdjustment {
  if (!feedback) {
    return "steady";
  }

  if (!feedback.completed || feedback.fatigue >= 4 || feedback.soreness >= 4 || feedback.pain >= 3 || feedback.averageRpe >= 9) {
    return "pull-back";
  }

  if (feedback.completed && feedback.averageRpe <= 7 && feedback.fatigue <= 2 && feedback.soreness <= 2 && feedback.pain <= 1 && feedback.enjoyment >= 4) {
    return "progress";
  }

  return "steady";
}

function getPrescription(adjustment: ProgressAdjustment): { intensityBias: IntensityBias; volumeMultiplier: number } {
  if (adjustment === "pull-back") {
    return { intensityBias: "deload", volumeMultiplier: 0.84 };
  }

  if (adjustment === "progress") {
    return { intensityBias: "build", volumeMultiplier: 1.06 };
  }

  return { intensityBias: "maintain", volumeMultiplier: 1 };
}

function buildBlocks(titlePrefix: string, includesConditioning: boolean): SessionBlock[] {
  const blocks: SessionBlock[] = [
    {
      id: `${slugify(titlePrefix)}-warmup`,
      type: "warmup",
      title: "Movement Prep",
      summary: "Prime positions, trunk pressure, and shoulder or hip range before loading.",
      target: "6-8 min",
    },
    {
      id: `${slugify(titlePrefix)}-strength`,
      type: "strength",
      title: `${titlePrefix} Strength Builder`,
      summary: "Controlled compound work with one to two reps in reserve.",
      target: "18-24 min",
    },
    {
      id: `${slugify(titlePrefix)}-accessory`,
      type: "accessory",
      title: "Structural Superset",
      summary: "Unilateral and pump-focused accessory work for balance and resilience.",
      target: "14-18 min",
    },
  ];

  if (includesConditioning) {
    blocks.push({
      id: `${slugify(titlePrefix)}-conditioning`,
      type: "conditioning",
      title: "Mixed Engine Finisher",
      summary: "Short mixed-modal piece to support work capacity without stealing recovery.",
      target: "8-12 min",
    });
  }

  blocks.push({
    id: `${slugify(titlePrefix)}-cooldown`,
    type: "cooldown",
    title: "Downshift",
    summary: "Breathing reset and tissue work to improve next-day readiness.",
    target: "4-6 min",
  });

  return blocks;
}

function getSessionTitles(profile: AthleteProfile) {
  const base = [
    { title: "Lower Body Power & Quads", focus: "Squat pattern, single-leg strength, and cyclical output" },
    { title: "Upper Body Push & Pull", focus: "Horizontal press, upper-back volume, and shoulder balance" },
    { title: "Athletic Posterior Chain", focus: "Hinge pattern, hamstring tissue, and trunk stiffness" },
    { title: "Upper Pump & Gymnastics Skill", focus: "Vertical pulling, arm volume, and body-control skill" },
    { title: "Mixed Performance Builder", focus: "Full-body density with controlled conditioning" },
  ];

  if (profile.trainingDaysPerWeek <= 3) {
    return base.slice(0, 3);
  }

  if (profile.trainingDaysPerWeek === 4) {
    return base.slice(0, 4);
  }

  return base.slice(0, Math.min(profile.trainingDaysPerWeek, base.length));
}

function buildSession(profile: AthleteProfile, index: number, adjustment: ProgressAdjustment): TrainingSession {
  const titles = getSessionTitles(profile);
  const selection = titles[index % titles.length];
  const prescription = getPrescription(adjustment);
  const conditioningAllowed = profile.conditioningLevel !== "low" && adjustment !== "pull-back";
  const includesConditioning = conditioningAllowed && index !== 1;

  return {
    id: `${slugify(selection.title)}-${index + 1}`,
    dayIndex: index,
    title: selection.title,
    focus: selection.focus,
    includesConditioning,
    blocks: buildBlocks(selection.title, includesConditioning),
    prescription,
    coachNotes: buildCoachNotes(adjustment, profile),
  };
}

export function buildInitialProgramState(profile: AthleteProfile, currentDate: string): ProgramState {
  return {
    profile,
    phase: {
      weekInWave: 1,
      waveLengthWeeks: WAVE_LENGTH_WEEKS,
    },
    readiness: {
      score: Math.min(5, Math.max(1, profile.recoveryScore)),
      adjustment: "steady",
    },
    sessions: Array.from({ length: profile.trainingDaysPerWeek }, (_, index) => buildSession(profile, index, "steady")),
    lastUpdated: currentDate,
  };
}

export function applyWorkoutFeedback(state: ProgramState, feedback: WorkoutFeedback): ProgramState {
  const adjustment = getAdjustment(feedback);
  const score = adjustment === "progress" ? 4.6 : adjustment === "pull-back" ? 2.4 : 3.5;

  return {
    ...state,
    readiness: {
      score,
      adjustment,
    },
    sessions: state.sessions.map((session, index) => buildSession(state.profile, index, adjustment)),
    lastUpdated: feedback.sessionId,
  };
}

export function generateDailySession(state: ProgramState, currentDate: string): TrainingSession {
  const sessionIndex = Math.abs(currentDate.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % state.sessions.length;
  const baseSession = state.sessions[sessionIndex];

  return {
    ...baseSession,
    id: `${baseSession.id}-${slugify(currentDate)}`,
  };
}
