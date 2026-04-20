import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useCoach } from "@/lib/coach/provider";
import type { WorkoutFeedback } from "@/lib/coach/types";

function ScaleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <View className="gap-3 rounded-[24px] border border-border bg-surface p-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-foreground">{label}</Text>
        <Text className="text-sm font-semibold text-primary">{value}/5</Text>
      </View>
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => onChange(item)}
            activeOpacity={0.85}
            className={item === value ? "h-12 flex-1 items-center justify-center rounded-2xl bg-primary" : "h-12 flex-1 items-center justify-center rounded-2xl bg-background"}
          >
            <Text className={item === value ? "text-sm font-semibold text-white" : "text-sm font-semibold text-foreground"}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function WorkoutReviewScreen() {
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const router = useRouter();
  const { state, submitWorkoutFeedback } = useCoach();
  const [feedback, setFeedback] = useState<Omit<WorkoutFeedback, "sessionId">>({
    completed: true,
    averageRpe: 7,
    soreness: 2,
    fatigue: 2,
    pain: 1,
    enjoyment: 4,
    notes: "Quality work across the main lifts.",
  });
  const [submitting, setSubmitting] = useState(false);

  const sessionId = useMemo(() => params.sessionId ?? state.dailyTraining?.session.id, [params.sessionId, state.dailyTraining?.session.id]);

  if (!sessionId) {
    return (
      <ScreenContainer className="items-center justify-center px-8">
        <Text className="text-2xl font-bold text-foreground">No completed session found</Text>
        <Text className="mt-3 text-center text-base leading-7 text-muted">
          Start a session first so the app can collect recovery feedback and adjust your next day.
        </Text>
      </ScreenContainer>
    );
  }

  const handleSubmit = async () => {
    setSubmitting(true);
    await submitWorkoutFeedback({
      sessionId,
      ...feedback,
    });
    setSubmitting(false);
    router.replace("/(tabs)");
  };

  return (
    <ScreenContainer className="bg-background" edges={["top", "bottom", "left", "right"]}>
      <View className="border-b border-border px-6 pb-4 pt-3">
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-primary">Post-workout review</Text>
        <Text className="mt-2 text-3xl font-bold text-foreground">Tell the coach how today felt</Text>
        <Text className="mt-2 text-base leading-7 text-muted">
          Your soreness, fatigue, pain, and session quality shape tomorrow’s loading and conditioning dose.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 18 }}>
        <View className="rounded-[24px] border border-border bg-surface p-5">
          <Text className="text-base font-semibold text-foreground">Session completion</Text>
          <View className="mt-4 flex-row gap-3">
            <TouchableOpacity
              onPress={() => setFeedback((current) => ({ ...current, completed: true }))}
              activeOpacity={0.85}
              className={feedback.completed ? "flex-1 rounded-[20px] bg-primary px-4 py-4" : "flex-1 rounded-[20px] bg-background px-4 py-4"}
            >
              <Text className={feedback.completed ? "text-center text-sm font-semibold text-white" : "text-center text-sm font-semibold text-foreground"}>Completed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFeedback((current) => ({ ...current, completed: false }))}
              activeOpacity={0.85}
              className={!feedback.completed ? "flex-1 rounded-[20px] bg-primary px-4 py-4" : "flex-1 rounded-[20px] bg-background px-4 py-4"}
            >
              <Text className={!feedback.completed ? "text-center text-sm font-semibold text-white" : "text-center text-sm font-semibold text-foreground"}>Cut short</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScaleRow label="Average RPE" value={feedback.averageRpe} onChange={(averageRpe) => setFeedback((current) => ({ ...current, averageRpe }))} />
        <ScaleRow label="Soreness" value={feedback.soreness} onChange={(soreness) => setFeedback((current) => ({ ...current, soreness }))} />
        <ScaleRow label="Fatigue" value={feedback.fatigue} onChange={(fatigue) => setFeedback((current) => ({ ...current, fatigue }))} />
        <ScaleRow label="Pain flags" value={feedback.pain} onChange={(pain) => setFeedback((current) => ({ ...current, pain }))} />
        <ScaleRow label="Enjoyment" value={feedback.enjoyment} onChange={(enjoyment) => setFeedback((current) => ({ ...current, enjoyment }))} />

        <TouchableOpacity onPress={handleSubmit} activeOpacity={0.9} className="rounded-[26px] bg-primary px-5 py-5">
          <Text className="text-center text-base font-semibold text-white">
            {submitting ? "Adapting tomorrow’s plan…" : "Save feedback and optimize next day"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
