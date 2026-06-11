import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/theme";

export default function SplashScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#1a0833", "#09090b"]}
      locations={[0, 0.6]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconEmoji}>🎴</Text>
          </View>

          <Text style={styles.eyebrow}>DAILY IDENTITY CARDS</Text>
          <Text style={styles.title}>PERSONA</Text>
          <Text style={styles.subtitle}>
            60 seconds a day.{"\n"}One card. One identity. Compounding.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Get started →</Text>
          </TouchableOpacity>
          <Text style={styles.footnote}>Free to start · No credit card needed</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: "#b06aff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#b06aff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 12,
  },
  iconEmoji: { fontSize: 40 },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 3.5,
    color: "#b06aff",
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  title: {
    fontSize: 52,
    fontFamily: "Inter_900Black",
    color: "#fafafa",
    letterSpacing: -2,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.subtle,
    textAlign: "center",
    lineHeight: 26,
    fontFamily: "Inter_400Regular",
    maxWidth: 260,
  },
  footer: {
    paddingBottom: 32,
    alignItems: "center",
    gap: 14,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: "#b06aff",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#b06aff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 0.3,
  },
  footnote: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: "Inter_400Regular",
  },
});
