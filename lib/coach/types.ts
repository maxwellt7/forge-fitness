export type TrainingAge = "beginner" | "intermediate" | "advanced";
export type PrimaryGoal = "hypertrophy" | "mixed" | "conditioning";
export type EquipmentItem =
  | "barbell"
  | "dumbbells"
  | "pullup-bar"
  | "bike"
  | "rower"
  | "rings"
  | "kettlebells"
  | "bench"
  | "bands"
  | "bodyweight";
export type WeakPoint =
  | "upper-back"
  | "shoulders"
  | "arms"
  | "glutes"
  | "hamstrings"
  | "single-leg-strength"
  | "aerobic-engine"
  | "midline";
export type ConditioningLevel = "low" | "moderate" | "high";
export type PreferredStyle = "supersets" | "tempo-work" | "olympic-derivatives" | "short-metcons" | "carries";
export type SessionBlockType = "warmup" | "strength" | "accessory" | "conditioning" | "cooldown";
export type ProgressAdjustment = "progress" | "steady" | "pull-back";
export type IntensityBias = "build" | "maintain" | "deload";

export type AthleteProfile = {
  firstName: string;
  trainingAge: TrainingAge;
  primaryGoal: PrimaryGoal;
  trainingDaysPerWeek: number;
  sessionLengthMinutes: number;
  equipmentAccess: EquipmentItem[];
  limitations: string[];
  weakPoints: WeakPoint[];
  conditioningLevel: ConditioningLevel;
  recoveryScore: number;
  preferredStyles: PreferredStyle[];
};

export type SessionBlock = {
  id: string;
  type: SessionBlockType;
  title: string;
  summary: string;
  target: string;
};

export type SessionPrescription = {
  intensityBias: IntensityBias;
  volumeMultiplier: number;
};

export type TrainingSession = {
  id: string;
  dayIndex: number;
  title: string;
  focus: string;
  includesConditioning: boolean;
  blocks: SessionBlock[];
  prescription: SessionPrescription;
  coachNotes: string[];
};

export type ProgramPhase = {
  weekInWave: number;
  waveLengthWeeks: number;
};

export type ReadinessState = {
  score: number;
  adjustment: ProgressAdjustment;
};

export type ProgramState = {
  profile: AthleteProfile;
  phase: ProgramPhase;
  readiness: ReadinessState;
  sessions: TrainingSession[];
  lastUpdated: string;
};

export type WorkoutFeedback = {
  sessionId: string;
  completed: boolean;
  averageRpe: number;
  soreness: number;
  fatigue: number;
  pain: number;
  enjoyment: number;
  notes: string;
};

export type LoggedSet = {
  id: string;
  label: string;
  reps: number;
  load: number;
  rpe: number;
  completed: boolean;
};

export type WorkoutBlockLog = {
  blockId: string;
  sets: LoggedSet[];
  notes: string;
  completed: boolean;
};

export type WorkoutLog = {
  sessionId: string;
  startedAt: string;
  finishedAt?: string;
  blocks: WorkoutBlockLog[];
};

export type DailyTrainingSnapshot = {
  date: string;
  session: TrainingSession;
  log?: WorkoutLog;
  feedback?: WorkoutFeedback;
};

export type CoachAppState = {
  onboardingComplete: boolean;
  profile: AthleteProfile | null;
  program: ProgramState | null;
  dailyTraining: DailyTrainingSnapshot | null;
  history: DailyTrainingSnapshot[];
};
