import { Redirect, Stack } from "expo-router";
import { useUserStore } from "../../store/userStore";

export default function AuthLayout() {
  const { session, profile, isInitialized } = useUserStore();

  if (!isInitialized) return null;

  // If logged in and onboarded, go to main app
  if (session && profile?.onboarded) {
    return <Redirect href="/(tabs)" />;
  }

  // If logged in but not onboarded, continue onboarding
  if (session && profile && !profile.onboarded) {
    return <Redirect href="/(auth)/onboard-identity" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="login" />
      <Stack.Screen name="onboard-identity" />
      <Stack.Screen name="onboard-paywall" />
    </Stack>
  );
}
