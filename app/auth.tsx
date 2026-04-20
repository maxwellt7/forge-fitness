import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { startOAuthLogin } from "@/constants/oauth";
import { useAuth } from "@/hooks/use-auth";

const featureRows = [
  "Adaptive daily training based on soreness, fatigue, and performance",
  "Functional bodybuilding periodization with structured strength and conditioning",
  "Fast set logging designed for one-handed use during training",
];

export default function AuthScreen() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, loading, router]);

  const handleSignIn = async () => {
    try {
      setSubmitting(true);
      await startOAuthLogin();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer className="px-6 pb-8" edges={["top", "bottom", "left", "right"]}>
      <View className="flex-1 justify-between py-4">
        <View className="gap-6">
          <View className="gap-3">
            <Text className="text-sm font-semibold uppercase tracking-[2px] text-primary">
              Functional Bodybuilding Coaching
            </Text>
            <Text className="text-5xl font-black leading-[56px] text-foreground">
              Train for muscle, engine, and movement quality.
            </Text>
            <Text className="text-base leading-7 text-muted">
              Forge Daily builds intelligent sessions that blend hypertrophy, structural balance, and carefully dosed mixed-modal work.
            </Text>
          </View>

          <View className="rounded-[32px] border border-primary/20 bg-surface px-6 py-6 shadow-sm">
            <View className="gap-5 rounded-[28px] border border-white/10 bg-[#111933] p-6">
              <Text className="text-lg font-semibold text-foreground">Built like a coach, not a random workout feed.</Text>
              <View className="gap-4">
                {featureRows.map((row) => (
                  <View key={row} className="flex-row gap-3">
                    <View className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <Text className="flex-1 text-sm leading-6 text-slate-200">{row}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View className="gap-4">
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={submitting}
            activeOpacity={0.9}
            className="rounded-[28px] bg-primary px-6 py-5"
          >
            <Text className="text-center text-base font-semibold text-white">
              {submitting ? "Opening secure sign in…" : "Sign in to start programming"}
            </Text>
          </TouchableOpacity>
          <Text className="px-4 text-center text-sm leading-6 text-muted">
            You will answer a short onboarding flow about goals, equipment, and recovery before your first training day is generated.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
