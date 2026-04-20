import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  applyWorkoutFeedback,
  buildInitialProgramState,
  generateDailySession,
} from "./programming";
import { EMPTY_COACH_STATE, loadCoachState, resetCoachState, saveCoachState } from "./storage";
import type {
  AthleteProfile,
  CoachAppState,
  LoggedSet,
  WorkoutFeedback,
  WorkoutLog,
} from "./types";

type CoachContextValue = {
  state: CoachAppState;
  loading: boolean;
  completeOnboarding: (profile: AthleteProfile) => Promise<void>;
  refreshDailyTraining: (date?: string) => Promise<void>;
  upsertWorkoutSet: (blockId: string, set: LoggedSet) => Promise<void>;
  completeWorkoutBlock: (blockId: string, notes?: string) => Promise<void>;
  submitWorkoutFeedback: (feedback: WorkoutFeedback) => Promise<void>;
  resetAllData: () => Promise<void>;
};

const CoachContext = createContext<CoachContextValue | null>(null);

function todayString(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function createEmptyWorkoutLog(sessionId: string): WorkoutLog {
  return {
    sessionId,
    startedAt: new Date().toISOString(),
    blocks: [],
  };
}

function mergeState(current: CoachAppState, next: Partial<CoachAppState>) {
  return {
    ...current,
    ...next,
  } satisfies CoachAppState;
}

export function CoachProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CoachAppState>(EMPTY_COACH_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoachState()
      .then((stored) => {
        setState(stored);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const commitState = useCallback(async (updater: (current: CoachAppState) => CoachAppState) => {
    let nextState = EMPTY_COACH_STATE;

    setState((current) => {
      nextState = updater(current);
      return nextState;
    });

    await saveCoachState(nextState);
  }, []);

  const refreshDailyTraining = useCallback(
    async (date?: string) => {
      const effectiveDate = date ?? todayString();
      await commitState((current) => {
        if (!current.program) {
          return current;
        }

        const existing = current.dailyTraining;
        if (existing?.date === effectiveDate) {
          return current;
        }

        return mergeState(current, {
          dailyTraining: {
            date: effectiveDate,
            session: generateDailySession(current.program, effectiveDate),
            log: undefined,
            feedback: undefined,
          },
        });
      });
    },
    [commitState],
  );

  const completeOnboarding = useCallback(
    async (profile: AthleteProfile) => {
      const now = todayString();
      const program = buildInitialProgramState(profile, now);
      const dailyTraining = {
        date: now,
        session: generateDailySession(program, now),
        log: undefined,
        feedback: undefined,
      };

      await commitState((current) =>
        mergeState(current, {
          onboardingComplete: true,
          profile,
          program,
          dailyTraining,
        }),
      );
    },
    [commitState],
  );

  const upsertWorkoutSet = useCallback(
    async (blockId: string, set: LoggedSet) => {
      await commitState((current) => {
        if (!current.dailyTraining) {
          return current;
        }

        const log = current.dailyTraining.log ?? createEmptyWorkoutLog(current.dailyTraining.session.id);
        const existingBlock = log.blocks.find((item) => item.blockId === blockId);

        const nextBlocks = existingBlock
          ? log.blocks.map((item) =>
              item.blockId === blockId
                ? {
                    ...item,
                    sets: item.sets.some((entry) => entry.id === set.id)
                      ? item.sets.map((entry) => (entry.id === set.id ? set : entry))
                      : [...item.sets, set],
                  }
                : item,
            )
          : [...log.blocks, { blockId, sets: [set], notes: "", completed: false }];

        return mergeState(current, {
          dailyTraining: {
            ...current.dailyTraining,
            log: {
              ...log,
              blocks: nextBlocks,
            },
          },
        });
      });
    },
    [commitState],
  );

  const completeWorkoutBlock = useCallback(
    async (blockId: string, notes = "") => {
      await commitState((current) => {
        if (!current.dailyTraining) {
          return current;
        }

        const log = current.dailyTraining.log ?? createEmptyWorkoutLog(current.dailyTraining.session.id);
        const existingBlock = log.blocks.find((item) => item.blockId === blockId);
        const nextBlocks = existingBlock
          ? log.blocks.map((item) =>
              item.blockId === blockId
                ? {
                    ...item,
                    notes,
                    completed: true,
                  }
                : item,
            )
          : [...log.blocks, { blockId, sets: [], notes, completed: true }];

        return mergeState(current, {
          dailyTraining: {
            ...current.dailyTraining,
            log: {
              ...log,
              blocks: nextBlocks,
            },
          },
        });
      });
    },
    [commitState],
  );

  const submitWorkoutFeedback = useCallback(
    async (feedback: WorkoutFeedback) => {
      await commitState((current) => {
        if (!current.program || !current.dailyTraining) {
          return current;
        }

        const nextProgram = applyWorkoutFeedback(current.program, feedback);
        const completedLog = current.dailyTraining.log
          ? {
              ...current.dailyTraining.log,
              finishedAt: new Date().toISOString(),
            }
          : undefined;

        const completedSnapshot = {
          ...current.dailyTraining,
          log: completedLog,
          feedback,
        };

        const nextDate = todayString(new Date(Date.now() + 24 * 60 * 60 * 1000));

        return mergeState(current, {
          program: nextProgram,
          dailyTraining: {
            date: nextDate,
            session: generateDailySession(nextProgram, nextDate),
            log: undefined,
            feedback: undefined,
          },
          history: [completedSnapshot, ...current.history].slice(0, 14),
        });
      });
    },
    [commitState],
  );

  const resetAllData = useCallback(async () => {
    await resetCoachState();
    setState(EMPTY_COACH_STATE);
  }, []);

  const value = useMemo<CoachContextValue>(
    () => ({
      state,
      loading,
      completeOnboarding,
      refreshDailyTraining,
      upsertWorkoutSet,
      completeWorkoutBlock,
      submitWorkoutFeedback,
      resetAllData,
    }),
    [
      completeOnboarding,
      completeWorkoutBlock,
      loading,
      refreshDailyTraining,
      resetAllData,
      state,
      submitWorkoutFeedback,
      upsertWorkoutSet,
    ],
  );

  return <CoachContext.Provider value={value}>{children}</CoachContext.Provider>;
}

export function useCoach() {
  const value = useContext(CoachContext);

  if (!value) {
    throw new Error("useCoach must be used within a CoachProvider");
  }

  return value;
}
