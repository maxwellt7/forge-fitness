import { ScrollView, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useCoach } from "@/lib/coach/provider";

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default function ProgressScreen() {
  const { state } = useCoach();
  const history = state.history;
  const adherence = history.length === 0 ? 0 : Math.round((history.filter((entry) => entry.feedback?.completed).length / history.length) * 100);
  const averageEnjoyment = average(history.map((entry) => entry.feedback?.enjoyment ?? 0)).toFixed(1);
  const averageFatigue = average(history.map((entry) => entry.feedback?.fatigue ?? 0)).toFixed(1);

  return (
    <ScreenContainer className="bg-background px-6">
      <ScrollView contentContainerStyle={{ paddingBottom: 28, gap: 18 }}>
        <View className="pt-3">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-primary">Progress</Text>
          <Text className="mt-2 text-4xl font-black text-foreground">Your coaching feedback loop</Text>
          <Text className="mt-2 text-base leading-7 text-muted">
            The app tracks completion quality, fatigue, and enjoyment so tomorrow’s prescription can stay challenging without becoming random.
          </Text>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 rounded-[28px] border border-border bg-surface p-5">
            <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-muted">Adherence</Text>
            <Text className="mt-3 text-4xl font-black text-foreground">{adherence}%</Text>
            <Text className="mt-2 text-sm leading-6 text-muted">Completed sessions across your recent logged history.</Text>
          </View>
          <View className="flex-1 rounded-[28px] border border-border bg-surface p-5">
            <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-muted">Avg enjoyment</Text>
            <Text className="mt-3 text-4xl font-black text-foreground">{averageEnjoyment}</Text>
            <Text className="mt-2 text-sm leading-6 text-muted">A quick indicator of how sustainable and engaging the work feels.</Text>
          </View>
        </View>

        <View className="rounded-[28px] border border-border bg-surface p-5">
          <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-muted">Recovery pulse</Text>
          <Text className="mt-3 text-3xl font-bold text-foreground">Average fatigue: {averageFatigue}/5</Text>
          <Text className="mt-2 text-sm leading-6 text-muted">
            As your fatigue trends up, the adaptive engine can pull conditioning down and simplify the next day’s loading.
          </Text>
        </View>

        <View className="rounded-[28px] border border-border bg-surface p-5">
          <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-muted">Recent sessions</Text>
          <View className="mt-4 gap-3">
            {history.length === 0 ? (
              <View className="rounded-[22px] bg-background px-4 py-4">
                <Text className="text-sm leading-6 text-muted">Finish your first workout review to start building a history here.</Text>
              </View>
            ) : (
              history.map((entry) => (
                <View key={`${entry.date}-${entry.session.id}`} className="rounded-[22px] bg-background px-4 py-4">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">{entry.session.title}</Text>
                      <Text className="mt-1 text-sm leading-6 text-muted">{entry.session.focus}</Text>
                    </View>
                    <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-primary">{entry.date}</Text>
                  </View>
                  <View className="mt-3 flex-row gap-3">
                    <View className="rounded-full bg-surface px-3 py-2">
                      <Text className="text-xs font-semibold text-foreground">Enjoyment {entry.feedback?.enjoyment ?? "-"}/5</Text>
                    </View>
                    <View className="rounded-full bg-surface px-3 py-2">
                      <Text className="text-xs font-semibold text-foreground">Fatigue {entry.feedback?.fatigue ?? "-"}/5</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
