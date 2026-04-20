import { describe, expect, it } from "vitest";

import {
  applyWorkoutFeedback,
  buildInitialProgramState,
  generateDailySession,
} from "../lib/coach/programming";
import type { AthleteProfile, WorkoutFeedback } from "../lib/coach/types";

const profile: AthleteProfile = {
  firstName: "Jordan",
  trainingAge: "intermediate",
  primaryGoal: "hypertrophy",
  trainingDaysPerWeek: 5,
  sessionLengthMinutes: 70,
  equipmentAccess: ["barbell", "dumbbells", "pullup-bar", "bike", "rings"],
  limitations: ["none"],
  weakPoints: ["upper-back", "single-leg-strength"],
  conditioningLevel: "moderate",
  recoveryScore: 4,
  preferredStyles: ["supersets", "short-metcons"],
};

describe("functional bodybuilding programming engine", () => {
  it("builds an initial training state with a four-week wave and today's session", () => {
    const state = buildInitialProgramState(profile, "2026-04-19");

    expect(state.phase.weekInWave).toBe(1);
    expect(state.phase.waveLengthWeeks).toBe(4);
    expect(state.sessions.length).toBe(profile.trainingDaysPerWeek);
    expect(state.sessions[0].blocks.some((block) => block.type === "strength")).toBe(true);
  });

  it("increases progression slightly after a strong completed session with low fatigue", () => {
    const state = buildInitialProgramState(profile, "2026-04-19");
    const feedback: WorkoutFeedback = {
      sessionId: state.sessions[0].id,
      completed: true,
      averageRpe: 7,
      soreness: 2,
      fatigue: 2,
      pain: 1,
      enjoyment: 5,
      notes: "Felt smooth and left a rep in reserve.",
    };

    const adapted = applyWorkoutFeedback(state, feedback);
    const nextSession = generateDailySession(adapted, "2026-04-20");

    expect(adapted.readiness.adjustment).toBe("progress");
    expect(nextSession.prescription.intensityBias).toBe("build");
    expect(nextSession.prescription.volumeMultiplier).toBeGreaterThan(1);
  });

  it("reduces intensity and conditioning load after poor recovery or pain flags", () => {
    const state = buildInitialProgramState(profile, "2026-04-19");
    const feedback: WorkoutFeedback = {
      sessionId: state.sessions[0].id,
      completed: false,
      averageRpe: 9,
      soreness: 5,
      fatigue: 5,
      pain: 4,
      enjoyment: 2,
      notes: "Low back tightened up during the finisher.",
    };

    const adapted = applyWorkoutFeedback(state, feedback);
    const nextSession = generateDailySession(adapted, "2026-04-20");

    expect(adapted.readiness.adjustment).toBe("pull-back");
    expect(nextSession.prescription.intensityBias).toBe("deload");
    expect(nextSession.includesConditioning).toBe(false);
    expect(nextSession.coachNotes.join(" ")).toContain("recovery");
  });
});
