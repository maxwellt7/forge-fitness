import { Redirect, useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useCoach } from "@/lib/coach/provider";

function readinessTone(score: number) {
  if (score >= 4.2) {
    return { label: "Ready to build", color: "#22C55E" };
  }

  if (score <= 2.8) {
    return { label: "Pulling back", color: "#F59E0B" };
  }

  return { label: "Steady quality day", color: "#14B8A6" };
}

export default function TodayScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { state, refreshDailyTraining } = useCoach();

  useEffect(() => {
    refreshDailyTraining().catch((error) => {
      console.error("[TodayScreen] Failed to refresh daily training", error);
    });
  }, [refreshDailyTraining]);

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  if (!state.onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  if (!state.profile || !state.dailyTraining || !state.program) {
    return (
      <ScreenContainer className="items-center justify-center px-8">
        <Text className="text-2xl font-bold text-foreground">Building your day</Text>
        <Text className="mt-3 text-center text-base leading-7 text-muted">
          Your profile and training wave are loading so the session can be assembled correctly.
        </Text>
      </ScreenContainer>
    );
  }

  const { profile, dailyTraining, program } = state;
  const tone = readinessTone(program.readiness.score);
  const completedBlocks = dailyTraining.log?.blocks.filter((block) => block.completed).length ?? 0;

  return (
    <ScreenContainer className="bg-background px-6">
      <ScrollView contentContainerStyle={{ paddingBottom: 28, gap: 18 }}>
        <View className="pt-3">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-primary">Today</Text>
          <Text className="mt-2 text-4xl font-black text-foreground">Good to see you, {profile.firstName}.</Text>
          <Text className="mt-2 text-base leading-7 text-muted">
            Your functional bodybuilding plan is tuned for {profile.trainingDaysPerWeek} training days with a {profile.primaryGoal} emphasis.
          </Text>
        </View>

        <PwaInstallBanner />

        <View className="rounded-[30px] border border-border bg-surface p-6">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-muted">Current focus</Text>
              <Text className="mt-2 text-3xl font-bold text-foreground">{dailyTraining.session.title}</Text>
              <Text className="mt-2 text-sm leading-6 text-muted">{dailyTraining.session.focus}</Text>
            </View>
            <View className="rounded-full px-3 py-2" style={{ backgroundColor: `${tone.color}22` }}>
              <Text className="text-xs font-semibold" style={{ color: tone.color }}>{tone.label}</Text>
            </View>
          </View>

          <View className="mt-5 flex-row gap-3">
            <View className="flex-1 rounded-[24px] bg-background px-4 py-4">
              <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-muted">Wave</Text>
              <Text className="mt-2 text-xl font-semibold text-foreground">Week {program.phase.weekInWave}/{program.phase.waveLengthWeeks}</Text>
            </View>
            <View className="flex-1 rounded-[24px] bg-background px-4 py-4">
              <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-muted">Progress</Text>
              <Text className="mt-2 text-xl font-semibold text-foreground">{completedBlocks}/{dailyTraining.session.blocks.length} blocks</Text>
            </View>
          </View>

          <View className="mt-5 gap-3">
            {dailyTraining.session.coachNotes.map((note) => (
              <View key={note} className="flex-row gap-3 rounded-[20px] bg-background px-4 py-4">
                <View className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                <Text className="flex-1 text-sm leading-6 text-foreground">{note}</Text>
              </View>
            ))}
          </View>

          <View className="mt-5 flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/session/[dayId]", params: { dayId: dailyTraining.session.id } })}
              activeOpacity={0.9}
              className="flex-1 rounded-[24px] bg-primary px-5 py-4"
            >
              <Text className="text-center text-base font-semibold text-white">Start session</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/review")}
              activeOpacity={0.85}
              className="flex-1 rounded-[24px] border border-border bg-background px-5 py-4"
            >
              <Text className="text-center text-base font-semibold text-foreground">Review last session</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="rounded-[30px] border border-border bg-surface p-6">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-muted">Session blocks</Text>
          <View className="mt-4 gap-3">
            {dailyTraining.session.blocks.map((block) => {
              const isComplete = dailyTraining.log?.blocks.some((entry) => entry.blockId === block.id && entry.completed);
              return (
                <View key={block.id} className="rounded-[24px] bg-background px-4 py-4">
                  <View className="flex-row items-center justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold uppercase tracking-[1.5px] text-primary">{block.type}</Text>
                      <Text className="mt-1 text-lg font-semibold text-foreground">{block.title}</Text>
                      <Text className="mt-2 text-sm leading-6 text-muted">{block.summary}</Text>
                    </View>
                    <View className={isComplete ? "rounded-full bg-success/15 px-3 py-2" : "rounded-full bg-surface px-3 py-2"}>
                      <Text className={isComplete ? "text-xs font-semibold text-success" : "text-xs font-semibold text-foreground"}>
                        {isComplete ? "Done" : block.target}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
