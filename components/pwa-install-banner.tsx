import { useEffect, useMemo, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandaloneMode() {
  if (Platform.OS !== "web" || typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(isStandaloneMode);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const shouldRender = useMemo(() => {
    return Platform.OS === "web" && !installed && !dismissed;
  }, [dismissed, installed]);

  if (!shouldRender) {
    return null;
  }

  const manualCopy = deferredPrompt
    ? "Install Forge Daily for faster launch, full-screen focus, and a more native coaching experience."
    : "You can install Forge Daily from your browser menu to open it full-screen and keep your training one tap away.";

  async function handleInstall() {
    if (!deferredPrompt) {
      return;
    }

    setInstalling(true);
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setInstalling(false);

    if (choice.outcome === "accepted") {
      setInstalled(true);
      setDeferredPrompt(null);
      return;
    }

    setDismissed(true);
  }

  return (
    <View className="rounded-[28px] border border-primary/25 bg-primary/10 px-5 py-5">
      <Text className="text-xs font-semibold uppercase tracking-[2px] text-primary">Install Forge Daily</Text>
      <Text className="mt-3 text-base font-semibold text-foreground">Keep your coach on the home screen.</Text>
      <Text className="mt-2 text-sm leading-6 text-muted">{manualCopy}</Text>

      <View className="mt-4 flex-row gap-3">
        {deferredPrompt ? (
          <TouchableOpacity
            onPress={() => {
              handleInstall().catch((error) => {
                console.error("[PwaInstallBanner] install failed", error);
                setInstalling(false);
              });
            }}
            activeOpacity={0.88}
            className="flex-1 rounded-[22px] bg-primary px-4 py-3"
          >
            <Text className="text-center text-sm font-semibold text-white">
              {installing ? "Opening prompt..." : "Install now"}
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          onPress={() => setDismissed(true)}
          activeOpacity={0.8}
          className="rounded-[22px] border border-border bg-background px-4 py-3"
        >
          <Text className="text-sm font-semibold text-foreground">Not now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
