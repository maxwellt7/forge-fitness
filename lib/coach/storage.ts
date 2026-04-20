import AsyncStorage from "@react-native-async-storage/async-storage";

import type { CoachAppState } from "./types";

const COACH_STATE_KEY = "functional-bodybuilding-coach-state";

export const EMPTY_COACH_STATE: CoachAppState = {
  onboardingComplete: false,
  profile: null,
  program: null,
  dailyTraining: null,
  history: [],
};

export async function loadCoachState(): Promise<CoachAppState> {
  try {
    const raw = await AsyncStorage.getItem(COACH_STATE_KEY);
    if (!raw) {
      return EMPTY_COACH_STATE;
    }

    const parsed = JSON.parse(raw) as Partial<CoachAppState>;
    return {
      ...EMPTY_COACH_STATE,
      ...parsed,
      history: parsed.history ?? [],
    };
  } catch (error) {
    console.error("[CoachStorage] Failed to load coach state", error);
    return EMPTY_COACH_STATE;
  }
}

export async function saveCoachState(state: CoachAppState): Promise<void> {
  try {
    await AsyncStorage.setItem(COACH_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("[CoachStorage] Failed to save coach state", error);
  }
}

export async function resetCoachState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(COACH_STATE_KEY);
  } catch (error) {
    console.error("[CoachStorage] Failed to reset coach state", error);
  }
}
