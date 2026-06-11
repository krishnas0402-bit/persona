import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import { supabase } from "../lib/supabase";
import { useUserStore } from "../store/userStore";
import { useProStore } from "../store/proStore";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setSession, loadProfile } = useUserStore();
  const { checkProStatus } = useProStore();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
          await loadProfile();
          await checkProStatus();
        }
        if (fontsLoaded) {
          SplashScreen.hideAsync();
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadProfile().then(() => checkProStatus());
      }
      if (fontsLoaded) {
        SplashScreen.hideAsync();
      }
    });

    return () => subscription.unsubscribe();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="card/[id]" options={{ animation: "slide_from_bottom" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
