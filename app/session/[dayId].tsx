import { useKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useCoach } from "@/lib/coach/provider";
import type { LoggedSet, SessionBlock, SessionBlockType } from "@/lib/coach/types";

function makeSet(blockType: SessionBlockType, index: number): LoggedSet {
  const defaults = {
    warmup: { reps: 8, load: 0, rpe: 5 },
    strength: { reps: 6, load: 95, rpe: 7 },
    accessory: { reps: 12, load: 35, rpe: 8 },
    conditioning: { reps: 10, load: 0, rpe: 8 },
    cooldown: { reps: 5, load: 0, rpe: 3 },
  } satisfies Record<SessionBlockType, { reps: number; load: number; rpe: number }>;

  return {
    id: `${blockType}-set-${index + 1}`,
    label: `Set ${index + 1}`,
    reps: defaults[blockType].reps,
    load: defaults[blockType].load,
    rpe: defaults[blockType].rpe,
    completed: true,
  };
}

function MetricStepper({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <View className="flex-1 rounded-2xl bg-background px-3 py-3">
      <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-muted">{label}</Text>
      <View className="mt-3 flex-row items-center justify-between">
        <TouchableOpacity onPress={onMinus} activeOpacity={0.85} className="h-8 w-8 items-center justify-center rounded-full bg-surface">
          <Text className="text-lg font-semibold text-foreground">−</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">{value}</Text>
        <TouchableOpacity onPress={onPlus} activeOpacity={0.85} className="h-8 w-8 items-center justify-center rounded-full bg-surface">
          <Text className="text-lg font-semibold text-foreground">＋</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SessionScreen() {
  const params = useLocalSearchParams<{ dayId?: string }>();
  const router = useRouter();
  const { state, upsertWorkoutSet, completeWorkoutBlock } = useCoach();

  if (Platform.OS !== "web") {
    useKeepAwake();
  }

  const session = state.dailyTraining?.session;
  const sessionLog = state.dailyTraining?.log;

  const blocks = useMemo(() => session?.blocks ?? [], [session?.blocks]);

  if (!session || !params.dayId) {
    return (
      <ScreenContainer className="items-center justify-center px-8">
        <Text className="text-2xl font-bold text-foreground">No session ready</Text>
        <Text className="mt-3 text-center text-base leading-7 text-muted">
          Return to Today and generate your training day before starting a live workout.
        </Text>
      </ScreenContainer>
    );
  }

  const handleQuickAdd = async (block: SessionBlock) => {
    const existing = sessionLog?.blocks.find((entry) => entry.blockId === block.id);
    await upsertWorkoutSet(block.id, makeSet(block.type, existing?.sets.length ?? 0));
  };

  const updateSet = async (blockId: string, nextSet: LoggedSet) => {
    await upsertWorkoutSet(blockId, nextSet);
  };

  return (
    <ScreenContainer className="bg-background" edges={["top", "bottom", "left", "right"]}>
      <View className="border-b border-border px-6 pb-4 pt-3">
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-primary">Live session</Text>
        <Text className="mt-2 text-3xl font-bold text-foreground">{session.title}</Text>
        <Text className="mt-2 text-base leading-7 text-muted">{session.focus}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 18 }}>
        {blocks.map((block) => {
          const blockLog = sessionLog?.blocks.find((entry) => entry.blockId === block.id);

          return (
            <View key={block.id} className="rounded-[28px] border border-border bg-surface p-5">
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1 gap-2">
                  <Text className="text-xs font-semibold uppercase tracking-[2px] text-primary">{block.type}</Text>
                  <Text className="text-xl font-semibold text-foreground">{block.title}</Text>
                  <Text className="text-sm leading-6 text-muted">{block.summary}</Text>
                </View>
                <View className="rounded-full bg-background px-3 py-2">
                  <Text className="text-xs font-semibold text-foreground">{block.target}</Text>
                </View>
              </View>

              <View className="mt-4 gap-3">
                {(blockLog?.sets ?? []).map((set) => (
                  <View key={set.id} className="rounded-[24px] bg-background p-4">
                    <Text className="text-sm font-semibold text-foreground">{set.label}</Text>
                    <View className="mt-3 flex-row gap-3">
                      <MetricStepper
                        label="Reps"
                        value={set.reps}
                        onMinus={() => updateSet(block.id, { ...set, reps: Math.max(1, set.reps - 1) })}
                        onPlus={() => updateSet(block.id, { ...set, reps: set.reps + 1 })}
                      />
                      <MetricStepper
                        label="Load"
                        value={set.load}
                        onMinus={() => updateSet(block.id, { ...set, load: Math.max(0, set.load - 5) })}
                        onPlus={() => updateSet(block.id, { ...set, load: set.load + 5 })}
                      />
                      <MetricStepper
                        label="RPE"
                        value={set.rpe}
                        onMinus={() => updateSet(block.id, { ...set, rpe: Math.max(1, set.rpe - 1) })}
                        onPlus={() => updateSet(block.id, { ...set, rpe: Math.min(10, set.rpe + 1) })}
                      />
                    </View>
                  </View>
                ))}

                {!blockLog?.sets.length ? (
                  <View className="rounded-[24px] border border-dashed border-border bg-background px-4 py-5">
                    <Text className="text-sm leading-6 text-muted">
                      No sets logged yet. Add a quick set to start tracking this block.
                    </Text>
                  </View>
                ) : null}
              </View>

              <View className="mt-4 flex-row gap-3">
                <TouchableOpacity onPress={() => handleQuickAdd(block)} activeOpacity={0.85} className="flex-1 rounded-[22px] border border-border bg-background px-4 py-4">
                  <Text className="text-center text-sm font-semibold text-foreground">Add set</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => completeWorkoutBlock(block.id)} activeOpacity={0.9} className="flex-1 rounded-[22px] bg-primary px-4 py-4">
                  <Text className="text-center text-sm font-semibold text-white">Complete block</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <TouchableOpacity
          onPress={() => router.push({ pathname: "/review", params: { sessionId: session.id } })}
          activeOpacity={0.9}
          className="rounded-[26px] bg-[#111933] px-5 py-5"
        >
          <Text className="text-center text-base font-semibold text-white">Finish session and review recovery</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
