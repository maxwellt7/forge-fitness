import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useCoach } from "@/lib/coach/provider";
import type {
  AthleteProfile,
  ConditioningLevel,
  EquipmentItem,
  PreferredStyle,
  PrimaryGoal,
  TrainingAge,
  WeakPoint,
} from "@/lib/coach/types";

const goals: PrimaryGoal[] = ["hypertrophy", "mixed", "conditioning"];
const trainingAges: TrainingAge[] = ["beginner", "intermediate", "advanced"];
const equipmentOptions: EquipmentItem[] = [
  "barbell",
  "dumbbells",
  "pullup-bar",
  "bike",
  "rower",
  "rings",
  "kettlebells",
  "bench",
  "bands",
  "bodyweight",
];
const weakPointOptions: WeakPoint[] = [
  "upper-back",
  "shoulders",
  "arms",
  "glutes",
  "hamstrings",
  "single-leg-strength",
  "aerobic-engine",
  "midline",
];
const preferredStyles: PreferredStyle[] = [
  "supersets",
  "tempo-work",
  "olympic-derivatives",
  "short-metcons",
  "carries",
];
const sessionLengths = [45, 60, 75, 90];
const trainingDays = [3, 4, 5];
const conditioningOptions: ConditioningLevel[] = ["low", "moderate", "high"];
const limitationOptions = ["none", "shoulder sensitivity", "low-back sensitivity", "knee sensitivity"];

const stepMeta = [
  { title: "Identity", body: "Start with your current training level and goal emphasis." },
  { title: "Capacity", body: "Tell the app how often you train and how much time you usually have." },
  { title: "Constraints", body: "Pick the tools and physical considerations that should shape exercise selection." },
  { title: "Refinement", body: "Highlight weak points, conditioning level, and preferred session feel." },
] as const;

function titleCase(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={selected ? "rounded-full border border-primary bg-primary/20 px-4 py-3" : "rounded-full border border-border bg-surface px-4 py-3"}
    >
      <Text className={selected ? "text-sm font-semibold text-foreground" : "text-sm font-medium text-muted"}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useCoach();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<AthleteProfile>({
    firstName: "",
    trainingAge: "intermediate",
    primaryGoal: "mixed",
    trainingDaysPerWeek: 4,
    sessionLengthMinutes: 60,
    equipmentAccess: ["barbell", "dumbbells", "pullup-bar", "bodyweight"],
    limitations: ["none"],
    weakPoints: ["upper-back"],
    conditioningLevel: "moderate",
    recoveryScore: 3,
    preferredStyles: ["supersets", "short-metcons"],
  });

  const progress = useMemo(() => ((step + 1) / stepMeta.length) * 100, [step]);

  const toggleItem = <T extends string,>(values: T[], item: T, allowEmpty = false) => {
    if (values.includes(item)) {
      const next = values.filter((entry) => entry !== item);
      return next.length === 0 && !allowEmpty ? values : next;
    }

    return [...values, item];
  };

  const canContinue = useMemo(() => {
    if (step === 0) {
      return profile.firstName.trim().length > 0;
    }

    return true;
  }, [profile.firstName, step]);

  const handleContinue = async () => {
    if (step < stepMeta.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    setSaving(true);
    await completeOnboarding(profile);
    setSaving(false);
    router.replace("/(tabs)");
  };

  return (
    <ScreenContainer className="bg-background" edges={["top", "bottom", "left", "right"]}>
      <View className="border-b border-border px-6 pb-4 pt-3">
        <View className="mb-4 h-2 rounded-full bg-surface">
          <View className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </View>
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-primary">
          {stepMeta[step].title}
        </Text>
        <Text className="mt-2 text-3xl font-bold text-foreground">Personalize your coaching</Text>
        <Text className="mt-2 text-base leading-7 text-muted">{stepMeta[step].body}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
        {step === 0 ? (
          <View className="gap-6">
            <View className="rounded-[28px] border border-border bg-surface p-5">
              <Text className="text-sm font-semibold text-muted">What should your coach call you?</Text>
              <TextInput
                value={profile.firstName}
                onChangeText={(firstName) => setProfile((current) => ({ ...current, firstName }))}
                placeholder="First name"
                placeholderTextColor="#64748B"
                className="mt-4 rounded-2xl border border-border bg-background px-4 py-4 text-base text-foreground"
                returnKeyType="done"
              />
            </View>

            <View className="rounded-[28px] border border-border bg-surface p-5">
              <Text className="text-sm font-semibold text-muted">Training age</Text>
              <View className="mt-4 flex-row flex-wrap gap-3">
                {trainingAges.map((item) => (
                  <Chip
                    key={item}
                    label={titleCase(item)}
                    selected={profile.trainingAge === item}
                    onPress={() => setProfile((current) => ({ ...current, trainingAge: item }))}
                  />
                ))}
              </View>
            </View>

            <View className="rounded-[28px] border border-border bg-surface p-5">
              <Text className="text-sm font-semibold text-muted">Primary focus</Text>
              <View className="mt-4 flex-row flex-wrap gap-3">
                {goals.map((item) => (
                  <Chip
                    key={item}
                    label={titleCase(item)}
                    selected={profile.primaryGoal === item}
                    onPress={() => setProfile((current) => ({ ...current, primaryGoal: item }))}
                  />
                ))}
              </View>
            </View>
          </View>
        ) : null}

        {step === 1 ? (
          <View className="gap-6">
            <View className="rounded-[28px] border border-border bg-surface p-5">
              <Text className="text-sm font-semibold text-muted">How many days do you realistically train?</Text>
              <View className="mt-4 flex-row flex-wrap gap-3">
                {trainingDays.map((item) => (
                  <Chip
                    key={item}
                    label={`${item} days`}
                    selected={profile.trainingDaysPerWeek === item}
                    onPress={() => setProfile((current) => ({ ...current, trainingDaysPerWeek: item }))}
                  />
                ))}
              </View>
            </View>

            <View className="rounded-[28px] border border-border bg-surface p-5">
              <Text className="text-sm font-semibold text-muted">Session length</Text>
              <View className="mt-4 flex-row flex-wrap gap-3">
                {sessionLengths.map((item) => (
                  <Chip
                    key={item}
                    label={`${item} min`}
                    selected={profile.sessionLengthMinutes === item}
                    onPress={() => setProfile((current) => ({ ...current, sessionLengthMinutes: item }))}
                  />
                ))}
              </View>
            </View>

            <View className="rounded-[28px] border border-border bg-surface p-5">
              <Text className="text-sm font-semibold text-muted">Current recovery quality</Text>
              <View className="mt-4 flex-row gap-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <Chip
                    key={item}
                    label={`${item}`}
                    selected={profile.recoveryScore === item}
                    onPress={() => setProfile((current) => ({ ...current, recoveryScore: item }))}
                  />
                ))}
              </View>
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View className="gap-6">
            <View className="rounded-[28px] border border-border bg-surface p-5">
              <Text className="text-sm font-semibold text-muted">Equipment access</Text>
              <View className="mt-4 flex-row flex-wrap gap-3">
                {equipmentOptions.map((item) => (
                  <Chip
                    key={item}
                    label={titleCase(item)}
                    selected={profile.equipmentAccess.includes(item)}
                    onPress={() =>
                      setProfile((current) => ({
                        ...current,
                        equipmentAccess: toggleItem(current.equipmentAccess, item),
                      }))
                    }
                  />
                ))}
              </View>
            </View>

            <View className="rounded-[28px] border border-border bg-surface p-5">
              <Text className="text-sm font-semibold text-muted">Limitations or pain flags</Text>
              <View className="mt-4 flex-row flex-wrap gap-3">
                {limitationOptions.map((item) => (
                  <Chip
                    key={item}
                    label={titleCase(item)}
                    selected={profile.limitations.includes(item)}
                    onPress={() =>
                      setProfile((current) => ({
                        ...current,
                        limitations: item === "none"
                          ? ["none"]
                          : toggleItem(current.limitations.filter((entry) => entry !== "none"), item, true),
                      }))
                    }
                  />
                ))}
              </View>
            </View>
          </View>
        ) : null}

        {step === 3 ? (
          <View className="gap-6">
            <View className="rounded-[28px] border border-border bg-surface p-5">
              <Text className="text-sm font-semibold text-muted">Weak points you want to improve</Text>
              <View className="mt-4 flex-row flex-wrap gap-3">
                {weakPointOptions.map((item) => (
                  <Chip
                    key={item}
                    label={titleCase(item)}
                    selected={profile.weakPoints.includes(item)}
                    onPress={() =>
                      setProfile((current) => ({
                        ...current,
                        weakPoints: toggleItem(current.weakPoints, item),
                      }))
                    }
                  />
                ))}
              </View>
            </View>

            <View className="rounded-[28px] border border-border bg-surface p-5">
              <Text className="text-sm font-semibold text-muted">Conditioning background</Text>
              <View className="mt-4 flex-row flex-wrap gap-3">
                {conditioningOptions.map((item) => (
                  <Chip
                    key={item}
                    label={titleCase(item)}
                    selected={profile.conditioningLevel === item}
                    onPress={() => setProfile((current) => ({ ...current, conditioningLevel: item }))}
                  />
                ))}
              </View>
            </View>

            <View className="rounded-[28px] border border-border bg-surface p-5">
              <Text className="text-sm font-semibold text-muted">Session style preferences</Text>
              <View className="mt-4 flex-row flex-wrap gap-3">
                {preferredStyles.map((item) => (
                  <Chip
                    key={item}
                    label={titleCase(item)}
                    selected={profile.preferredStyles.includes(item)}
                    onPress={() =>
                      setProfile((current) => ({
                        ...current,
                        preferredStyles: toggleItem(current.preferredStyles, item),
                      }))
                    }
                  />
                ))}
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View className="border-t border-border px-6 py-4">
        <View className="flex-row items-center gap-3">
          {step > 0 ? (
            <TouchableOpacity
              onPress={() => setStep((current) => current - 1)}
              activeOpacity={0.85}
              className="flex-1 rounded-[24px] border border-border bg-surface px-5 py-4"
            >
              <Text className="text-center text-base font-semibold text-foreground">Back</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.9}
            disabled={!canContinue || saving}
            className="flex-1 rounded-[24px] bg-primary px-5 py-4"
          >
            <Text className="text-center text-base font-semibold text-white">
              {saving ? "Building your first day…" : step === stepMeta.length - 1 ? "Generate my training" : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
