import { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/theme";
import { IDENTITIES } from "../../constants/identities";
import { useUserStore } from "../../store/userStore";
import { useProStore } from "../../store/proStore";
import { PLANS, PlanId } from "../../lib/razorpay";

const FEATURES = [
  { icon: "🎴", text: "All 5 identity card decks (150+ cards)" },
  { icon: "📦", text: "All card packs — current and future" },
  { icon: "📊", text: "Full streak analytics & patterns" },
  { icon: "🔔", text: "Custom daily reminder times" },
  { icon: "✦", text: "New packs dropped every month" },
  { icon: "🌑", text: "Custom identity builder (coming soon)" },
];

export default function OnboardPaywallScreen() {
  const router = useRouter();
  const { profile, setOnboarded } = useUserStore();
  const { purchase, isProcessing } = useProStore();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("yearly");

  const primaryIdentity = IDENTITIES.find((i) => i.id === profile?.primary_identity);

  const handlePurchase = async () => {
    const success = await purchase(selectedPlan);
    if (success) {
      await setOnboarded();
      router.replace("/(tabs)");
    }
  };

  const handleSkip = async () => {
    await setOnboarded();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Step indicator */}
        <Text style={styles.step}>Step 2 of 2</Text>

        {/* Identity locked cards */}
        <Text style={styles.heading}>
          You only get{" "}
          <Text style={{ color: primaryIdentity?.accent ?? "#b06aff" }}>
            one identity
          </Text>{" "}
          free.
        </Text>
        <Text style={styles.subtext}>
          Most people are building more than one version of themselves. Pro unlocks all five.
        </Text>

        {/* Free */}
        {primaryIdentity && (
          <View style={[styles.identityRow, { borderColor: primaryIdentity.accent, backgroundColor: primaryIdentity.soft }]}>
            <Text style={styles.identityEmoji}>{primaryIdentity.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.identityLabel, { color: primaryIdentity.accent }]}>
                {primaryIdentity.label}
              </Text>
              <Text style={styles.identitySub}>Primary · Always free</Text>
            </View>
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>FREE</Text>
            </View>
          </View>
        )}

        {/* Locked */}
        {IDENTITIES.filter((i) => i.id !== profile?.primary_identity).map((id) => (
          <View key={id.id} style={styles.lockedRow}>
            <Text style={[styles.identityEmoji, { opacity: 0.4 }]}>{id.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.lockedLabel}>{id.label}</Text>
              <Text style={styles.lockedSub}>Persona Pro only</Text>
            </View>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        ))}

        {/* Features */}
        <View style={styles.featuresBox}>
          <Text style={styles.featuresTitle}>Everything in Pro</Text>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
              <Text style={styles.featureCheck}>✓</Text>
            </View>
          ))}
        </View>

        {/* Plan selector */}
        <View style={styles.planRow}>
          {(Object.keys(PLANS) as PlanId[]).map((planId) => {
            const plan = PLANS[planId];
            const isSelected = selectedPlan === planId;
            return (
              <TouchableOpacity
                key={planId}
                onPress={() => setSelectedPlan(planId)}
                activeOpacity={0.85}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                ]}
              >
                {"badge" in plan && (
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>{plan.badge}</Text>
                  </View>
                )}
                <Text style={styles.planPeriod}>
                  {"badge" in plan ? "Yearly" : "Monthly"}
                </Text>
                <Text style={[styles.planPrice, isSelected && { color: "#fafafa" }]}>
                  {plan.displayPrice}
                </Text>
                <Text style={styles.planDesc}>{plan.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handlePurchase}
          disabled={isProcessing}
          activeOpacity={0.85}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaText}>
              Start Pro — {PLANS[selectedPlan].displayPrice}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={styles.skip}>
          <Text style={styles.skipText}>Continue with free plan</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Cancel anytime · Processed securely by Razorpay
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48, gap: 12 },
  step: {
    fontSize: 10, letterSpacing: 3, color: COLORS.muted,
    fontFamily: "Inter_700Bold", textTransform: "uppercase", marginBottom: 4,
  },
  heading: {
    fontSize: 28, fontFamily: "Inter_800ExtraBold",
    color: "#fafafa", letterSpacing: -0.8, lineHeight: 36, marginBottom: 8,
  },
  subtext: {
    fontSize: 14, color: COLORS.subtle,
    fontFamily: "Inter_400Regular", lineHeight: 21, marginBottom: 4,
  },
  identityRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 18, borderWidth: 1.5, padding: 16,
  },
  identityEmoji: { fontSize: 24, width: 32, textAlign: "center" },
  identityLabel: { fontSize: 14, fontFamily: "Inter_700Bold" },
  identitySub: { fontSize: 11, color: COLORS.muted, fontFamily: "Inter_400Regular" },
  freeBadge: {
    backgroundColor: "rgba(34,197,94,0.15)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3,
  },
  freeBadgeText: { fontSize: 10, fontFamily: "Inter_800ExtraBold", color: "#22c55e" },
  lockedRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#0d0d0f", borderRadius: 18, borderWidth: 1.5,
    borderColor: "#1a1a1d", padding: 16, opacity: 0.6,
  },
  lockedLabel: { fontSize: 14, fontFamily: "Inter_700Bold", color: COLORS.muted },
  lockedSub: { fontSize: 11, color: "#3f3f46", fontFamily: "Inter_400Regular" },
  lockIcon: { fontSize: 14 },
  featuresBox: {
    backgroundColor: COLORS.surface, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border, padding: 18, gap: 10,
  },
  featuresTitle: {
    fontSize: 11, color: COLORS.muted, fontFamily: "Inter_700Bold",
    textTransform: "uppercase", letterSpacing: 2, marginBottom: 4,
  },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureIcon: { fontSize: 16, width: 22 },
  featureText: { flex: 1, fontSize: 13, color: "#d4d4d8", fontFamily: "Inter_400Regular" },
  featureCheck: { fontSize: 14, color: "#22c55e" },
  planRow: { flexDirection: "row", gap: 10 },
  planCard: {
    flex: 1, backgroundColor: COLORS.surface,
    borderRadius: 18, borderWidth: 1.5, borderColor: COLORS.border,
    padding: 18, alignItems: "center", position: "relative",
  },
  planCardSelected: {
    borderColor: "#b06aff",
    backgroundColor: "rgba(176,106,255,0.08)",
  },
  planBadge: {
    position: "absolute", top: -11,
    backgroundColor: "#f7c948", borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  planBadgeText: { fontSize: 9, fontFamily: "Inter_900Black", color: "#09090b", letterSpacing: 1 },
  planPeriod: { fontSize: 11, color: COLORS.muted, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  planPrice: { fontSize: 22, fontFamily: "Inter_900Black", color: "#a1a1aa", marginBottom: 2 },
  planDesc: { fontSize: 10, color: COLORS.muted, fontFamily: "Inter_400Regular", textAlign: "center" },
  ctaButton: {
    backgroundColor: "#b06aff", borderRadius: 18,
    paddingVertical: 17, alignItems: "center",
    shadowColor: "#b06aff", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  ctaText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  skip: { alignItems: "center", paddingVertical: 4 },
  skipText: { fontSize: 13, color: COLORS.muted, fontFamily: "Inter_400Regular", textDecorationLine: "underline" },
  legal: { fontSize: 11, color: "#3f3f46", textAlign: "center", fontFamily: "Inter_400Regular" },
});
