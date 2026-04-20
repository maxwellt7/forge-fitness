import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useCoach } from "@/lib/coach/provider";

export default function EntryScreen() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { state, loading: coachLoading } = useCoach();

  if (authLoading || coachLoading) {
    return (
      <ScreenContainer className="items-center justify-center px-8">
        <View className="items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/15">
            <ActivityIndicator color="white" />
          </View>
          <Text className="text-3xl font-bold text-foreground">Forge Daily</Text>
          <Text className="text-center text-base leading-6 text-muted">
            Building your next functional bodybuilding session.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  if (!state.onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
