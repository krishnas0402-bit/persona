import { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { IDENTITIES } from "../../constants/identities";
import { COLORS } from "../../constants/theme";
import { IdentityId } from "../../constants/theme";
import { useCardStore } from "../../store/cardStore";

const TABS = [
  { id: "action", label: "Do This", icon: "⚡" },
  { id: "why", label: "Why", icon: "💡" },
  { id: "reflection", label: "Reflect", icon: "🔍" },
  { id: "challenge", label: "Challenge", icon: "🎯" },
  { id: "affirmation", label: "Affirm", icon: "✦" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function CardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { todayCard, completedToday, completeToday } = useCardStore();
  const [activeTab, setActiveTab] = useState<TabId>("action");
  const [completing, setCompleting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const identity = IDENTITIES.find((i) => i.id === id);

  if (!identity || !todayCard) return null;

  const content: Record<TabId, string> = {
    action: todayCard.action,
    why: todayCard.why,
    reflection: todayCard.reflection,
    challenge: todayCard.challenge,
    affirmation: todayCard.affirmation,
  };

  const handleComplete = async () => {
    if (completedToday || completing) return;
    setCompleting(true);
    await completeToday();
    setJustCompleted(true);
    setCompleting(false);
    setTimeout(() => router.replace("/(tabs)"), 1200);
  };

  const isDone = completedToday || justCompleted;

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg }]}>
      {/* Background tint */}
      <View style={[styles.bgTint, { backgroundColor: identity.bg }]} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Nav */}
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 Keep the streak</Text>
          </View>
        </View>

        {/* Identity header */}
        <View style={styles.identityHeader}>
          <View style={[styles.identityIcon, { backgroundColor: identity.soft }]}>
            <Text style={styles.identityEmoji}>{identity.emoji}</Text>
          </View>
          <View>
            <Text style={[styles.identityName, { color: identity.accent }]}>
              {identity.label}
            </Text>
            <Text style={styles.identityDate}>Today's card</Text>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
          style={styles.tabsScroll}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.8}
              style={[
                styles.tab,
                activeTab === tab.id && {
                  backgroundColor: identity.accent,
                  borderColor: identity.accent,
                },
              ]}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.id && { color: "#09090b" },
              ]}>
                {tab.icon} {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Card content */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.contentCard, { borderColor: identity.accent + "22" }]}>
            <Text style={styles.contentIcon}>
              {TABS.find((t) => t.id === activeTab)?.icon}
            </Text>
            <Text style={styles.contentText}>{content[activeTab]}</Text>

            {activeTab === "affirmation" && (
              <View style={[styles.mantraBox, { borderTopColor: identity.accent + "22" }]}>
                <Text style={[styles.mantraLabel, { color: identity.accent }]}>MANTRA</Text>
                <Text style={styles.mantraText}>{todayCard.mantra}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Complete button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleComplete}
            disabled={isDone || completing}
            activeOpacity={0.85}
            style={[
              styles.completeBtn,
              isDone && styles.completeBtnDone,
              { shadowColor: isDone ? "#22c55e" : identity.accent },
            ]}
          >
            <Text style={styles.completeBtnText}>
              {isDone ? "✓ Done for today" : completing ? "Saving..." : "Mark complete — keep the streak"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgTint: {
    position: "absolute", top: 0, left: 0, right: 0, height: 300,
    opacity: 0.6,
  },
  nav: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 22, paddingTop: 12, paddingBottom: 8,
  },
  backBtn: { padding: 4 },
  backText: { color: COLORS.muted, fontFamily: "Inter_500Medium", fontSize: 15 },
  streakBadge: {
    backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1,
    borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 5,
  },
  streakText: { fontSize: 11, color: COLORS.dim, fontFamily: "Inter_600SemiBold" },
  identityHeader: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 22, paddingVertical: 16,
  },
  identityIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  identityEmoji: { fontSize: 24 },
  identityName: { fontSize: 14, fontFamily: "Inter_700Bold" },
  identityDate: { fontSize: 11, color: COLORS.muted, fontFamily: "Inter_400Regular" },
  tabsScroll: { flexGrow: 0, marginBottom: 16 },
  tabsContainer: { paddingHorizontal: 22, gap: 6 },
  tab: {
    backgroundColor: COLORS.surface, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  tabText: {
    fontSize: 12, fontFamily: "Inter_700Bold",
    color: COLORS.muted, letterSpacing: 0.2,
  },
  contentScroll: { flex: 1 },
  contentContainer: { paddingHorizontal: 22, paddingBottom: 24 },
  contentCard: {
    backgroundColor: "#0f0f12", borderRadius: 24, borderWidth: 1.5,
    padding: 28, minHeight: 220,
  },
  contentIcon: { fontSize: 32, marginBottom: 16 },
  contentText: {
    fontSize: 20, fontFamily: "Inter_600SemiBold",
    color: "#f4f4f5", lineHeight: 32, letterSpacing: -0.3,
  },
  mantraBox: { marginTop: 20, paddingTop: 16, borderTopWidth: 1 },
  mantraLabel: {
    fontSize: 9, fontFamily: "Inter_700Bold",
    textTransform: "uppercase", letterSpacing: 2, marginBottom: 6,
  },
  mantraText: {
    fontSize: 14, color: COLORS.subtle, fontFamily: "Inter_400Regular",
    fontStyle: "italic", lineHeight: 22,
  },
  footer: { paddingHorizontal: 22, paddingBottom: 24, paddingTop: 12 },
  completeBtn: {
    backgroundColor: "#b06aff", borderRadius: 18, paddingVertical: 17,
    alignItems: "center", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  completeBtnDone: { backgroundColor: "#22c55e" },
  completeBtnText: { fontSize: 15, fontFamily: "Inter_800ExtraBold", color: "#fff" },
});
