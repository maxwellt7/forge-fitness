import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useCoach } from "@/lib/coach/provider";

function Pill({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-background px-3 py-2">
      <Text className="text-xs font-semibold text-foreground">{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { state, resetAllData } = useCoach();
  const profile = state.profile;

  const handleLogout = async () => {
    await logout();
    router.replace("/auth");
  };

  const handleResetProgram = async () => {
    await resetAllData();
    router.replace("/onboarding");
  };

  return (
    <ScreenContainer className="bg-background px-6">
      <ScrollView contentContainerStyle={{ paddingBottom: 28, gap: 18 }}>
        <View className="pt-3">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-primary">Profile</Text>
          <Text className="mt-2 text-4xl font-black text-foreground">Training preferences and account</Text>
          <Text className="mt-2 text-base leading-7 text-muted">
            Use this space to review the constraints that shape your programming and reset your intake when your schedule changes.
          </Text>
        </View>

        <View className="rounded-[30px] border border-border bg-surface p-6">
          <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-muted">Athlete</Text>
          <Text className="mt-3 text-3xl font-bold text-foreground">{profile?.firstName ?? user?.name ?? "Athlete"}</Text>
          <Text className="mt-2 text-sm leading-6 text-muted">{user?.email ?? "Signed in with secure app authentication"}</Text>
        </View>

        <View className="rounded-[30px] border border-border bg-surface p-6">
          <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-muted">Program inputs</Text>
          <View className="mt-4 gap-5">
            <View>
              <Text className="text-sm font-semibold text-foreground">Equipment</Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {(profile?.equipmentAccess ?? []).map((item) => (
                  <Pill key={item} label={item.replace(/-/g, " ")} />
                ))}
              </View>
            </View>
            <View>
              <Text className="text-sm font-semibold text-foreground">Weak points</Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {(profile?.weakPoints ?? []).map((item) => (
                  <Pill key={item} label={item.replace(/-/g, " ")} />
                ))}
              </View>
            </View>
            <View>
              <Text className="text-sm font-semibold text-foreground">Preferred styles</Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {(profile?.preferredStyles ?? []).map((item) => (
                  <Pill key={item} label={item.replace(/-/g, " ")} />
                ))}
              </View>
            </View>
          </View>
        </View>

        <View className="gap-3">
          <TouchableOpacity onPress={() => router.push("/onboarding")} activeOpacity={0.85} className="rounded-[24px] border border-border bg-surface px-5 py-4">
            <Text className="text-center text-base font-semibold text-foreground">Retake onboarding</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleResetProgram} activeOpacity={0.85} className="rounded-[24px] border border-border bg-surface px-5 py-4">
            <Text className="text-center text-base font-semibold text-foreground">Reset local program data</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.9} className="rounded-[24px] bg-primary px-5 py-4">
            <Text className="text-center text-base font-semibold text-white">Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
