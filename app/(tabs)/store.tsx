import { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProStore } from "../../store/proStore";
import { COLORS } from "../../constants/theme";
import { PLANS, PlanId } from "../../lib/razorpay";

const PACKS = [
  { id: "base", name: "Base Pack", emoji: "🎴", cards: 25, desc: "Your default identity cards. Always available.", proOnly: false },
  { id: "stoic", name: "Stoic Edge", emoji: "🏛️", cards: 30, desc: "Marcus Aurelius-inspired prompts for mental fortitude.", proOnly: true },
  { id: "founder", name: "The Founder", emoji: "🚀", cards: 30, desc: "Cards built for people building something from nothing.", proOnly: true },
  { id: "monk", name: "Inner Monk", emoji: "🪷", cards: 30, desc: "Deep stillness and clarity practices for the modern mind.", proOnly: true },
  { id: "hunger", name: "Hunger Games", emoji: "🎯", cards: 30, desc: "For the ambitious. Competitive. Relentless.", proOnly: true },
];

export default function StoreScreen() {
  const { isPro, purchase, isProcessing, error, clearError } = useProStore();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("yearly");

  const handlePurchase = async () => {
    clearError();
    const success = await purchase(selectedPlan);
    if (success) {
      Alert.alert("Welcome to Pro ✦", "All identities and packs are now unlocked.");
    } else if (error) {
      Alert.alert("Payment failed", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Card Store</Text>
        <Text style={styles.subtext}>Specialized decks for every path you're walking.</Text>

        {/* Pro banner / purchase block */}
        {!isPro ? (
          <View style={styles.proPanel}>
            <Text style={styles.proPanelEmoji}>✦</Text>
            <Text style={styles.proPanelTitle}>Persona Pro</Text>
            <Text style={styles.proPanelSub}>
              All identities. All packs. Everything — current and future.
            </Text>

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
                    style={[styles.planCard, isSelected && styles.planCardSelected]}
                  >
                    {"badge" in plan && (
                      <View style={styles.planBadge}>
                        <Text style={styles.planBadgeText}>{plan.badge}</Text>
                      </View>
                    )}
                    <Text style={styles.planLabel}>{plan.label}</Text>
                    <Text style={[styles.planPrice, isSelected && { color: "#fafafa" }]}>
                      {plan.displayPrice}
                    </Text>
                    <Text style={styles.planDesc}>{plan.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

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
                  Subscribe — {PLANS[selectedPlan].displayPrice}
                </Text>
              )}
            </TouchableOpacity>
            <Text style={styles.legal}>Cancel anytime · Secured by Razorpay</Text>
          </View>
        ) : (
          <View style={styles.proActive}>
            <Text style={styles.proActiveText}>✦ Pro active — everything unlocked</Text>
          </View>
        )}

        {/* Packs */}
        <View style={{ gap: 12 }}>
          {PACKS.map((pack) => {
            const locked = pack.proOnly && !isPro;
            return (
              <View key={pack.id} style={[styles.packCard, locked && { opacity: 0.6 }]}>
                <View style={[styles.packIcon, locked && { opacity: 0.5 }]}>
                  <Text style={styles.packEmoji}>{pack.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.packTitleRow}>
                    <Text style={styles.packName}>{pack.name}</Text>
                    {locked && <Text style={styles.packLock}>🔒</Text>}
                  </View>
                  <Text style={styles.packDesc}>{pack.desc}</Text>
                  <View style={styles.packMeta}>
                    <View style={styles.packChip}>
                      <Text style={styles.packChipText}>{pack.cards} cards</Text>
                    </View>
                    {!locked && (
                      <View style={[styles.packChip, styles.packChipActive]}>
                        <Text style={styles.packChipActiveText}>
                          {pack.proOnly ? "Included in Pro" : "Active"}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>New packs drop every month.</Text>
          <Text style={styles.comingSoonSub}>Pro members get them automatically.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 100, gap: 16 },
  heading: { fontSize: 28, fontFamily: "Inter_800ExtraBold", color: "#fafafa", letterSpacing: -0.8 },
  subtext: { fontSize: 14, color: COLORS.subtle, fontFamily: "Inter_400Regular", marginBottom: 4 },
  proPanel: {
    backgroundColor: "rgba(176,106,255,0.06)",
    borderRadius: 24, borderWidth: 1.5, borderColor: "rgba(176,106,255,0.25)",
    padding: 22, alignItems: "center", gap: 8,
  },
  proPanelEmoji: { fontSize: 32 },
  proPanelTitle: { fontSize: 20, fontFamily: "Inter_800ExtraBold", color: "#b06aff" },
  proPanelSub: {
    fontSize: 13, color: COLORS.subtle, fontFamily: "Inter_400Regular",
    textAlign: "center", marginBottom: 8,
  },
  planRow: { flexDirection: "row", gap: 10, width: "100%", marginBottom: 8 },
  planCard: {
    flex: 1, backgroundColor: COLORS.surface,
    borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.border,
    padding: 14, alignItems: "center", position: "relative",
  },
  planCardSelected: { borderColor: "#b06aff", backgroundColor: "rgba(176,106,255,0.1)" },
  planBadge: {
    position: "absolute", top: -10, backgroundColor: "#f7c948",
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
  },
  planBadgeText: { fontSize: 8, fontFamily: "Inter_900Black", color: "#09090b", letterSpacing: 0.8 },
  planLabel: { fontSize: 11, color: COLORS.muted, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  planPrice: { fontSize: 19, fontFamily: "Inter_900Black", color: "#a1a1aa" },
  planDesc: { fontSize: 9, color: COLORS.muted, fontFamily: "Inter_400Regular", marginTop: 2, textAlign: "center" },
  ctaButton: {
    width: "100%", backgroundColor: "#b06aff",
    borderRadius: 16, paddingVertical: 15, alignItems: "center",
  },
  ctaText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  legal: { fontSize: 10, color: "#3f3f46", fontFamily: "Inter_400Regular" },
  proActive: {
    backgroundColor: "rgba(34,197,94,0.08)", borderRadius: 16,
    borderWidth: 1, borderColor: "rgba(34,197,94,0.25)",
    paddingVertical: 14, alignItems: "center",
  },
  proActiveText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#22c55e" },
  packCard: {
    backgroundColor: COLORS.surface, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 16, flexDirection: "row", gap: 14,
  },
  packIcon: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: COLORS.border, alignItems: "center", justifyContent: "center",
  },
  packEmoji: { fontSize: 24 },
  packTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  packName: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#e4e4e7" },
  packLock: { fontSize: 11 },
  packDesc: { fontSize: 12, color: COLORS.muted, fontFamily: "Inter_400Regular", marginBottom: 8, lineHeight: 17 },
  packMeta: { flexDirection: "row", gap: 8 },
  packChip: {
    backgroundColor: COLORS.border, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  packChipText: { fontSize: 10, color: "#3f3f46", fontFamily: "Inter_500Medium" },
  packChipActive: { backgroundColor: "rgba(34,197,94,0.1)" },
  packChipActiveText: { fontSize: 10, color: "#22c55e", fontFamily: "Inter_700Bold" },
  comingSoon: {
    borderRadius: 16, borderWidth: 1, borderColor: COLORS.border,
    borderStyle: "dashed", paddingVertical: 16, alignItems: "center", gap: 2,
  },
  comingSoonText: { fontSize: 13, color: COLORS.muted, fontFamily: "Inter_400Regular" },
  comingSoonSub: { fontSize: 11, color: "#3f3f46", fontFamily: "Inter_400Regular" },
});
