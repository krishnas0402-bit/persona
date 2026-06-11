import { useEffect } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { format } from "date-fns";
import { useUserStore } from "../../store/userStore";
import { useCardStore } from "../../store/cardStore";
import { useProStore } from "../../store/proStore";
import { IDENTITIES } from "../../constants/identities";
import { COLORS } from "../../constants/theme";
import { IdentityId } from "../../constants/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useUserStore();
  const { loadTodayCard, checkTodayStatus, completedToday } = useCardStore();
  const { isPro } = useProStore();

  const identity = IDENTITIES.find((i) => i.id === profile?.primary_identity);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (profile?.primary_identity) {
      loadTodayCard(profile.primary_identity as IdentityId);
      checkTodayStatus();
    }
  }, [profile?.primary_identity]);

  const handleOpenCard = () => {
    router.push(`/card/${profile?.primary_identity}`);
  };

  const handleIdentityPress = (identityId: IdentityId) => {
    if (!isPro) {
      router.push("/store");
      return;
    }
    // Switch primary identity
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.headerTitle}>
              {completedToday ? "Card complete ✓" : "Your card is ready."}
            </Text>
          </View>
          <View style={styles.streak}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakNum}>{profile?.streak_current ?? 0}</Text>
          </View>
        </View>

        {/* Week strip */}
        <WeekStrip accent={identity?.accent ?? "#b06aff"} />

        {/* Main identity card */}
        {identity && (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleOpenCard}
            style={[
              styles.identityCard,
              { borderColor: identity.accent + "44", backgroundColor: identity.soft },
            ]}
          >
            <Text style={[styles.cardEyebrow, { color: identity.accent }]}>
              TODAY'S IDENTITY
            </Text>
            <Text style={styles.cardEmoji}>{identity.emoji}</Text>
            <Text style={styles.cardTitle}>{identity.label}</Text>
            <Text style={styles.cardDesc}>{identity.desc}</Text>

            <View style={[styles.cardCta, { backgroundColor: identity.accent + "22", borderColor: identity.accent + "44" }]}>
              <Text style={[styles.cardCtaText, { color: identity.accent }]}>
                {completedToday ? "View today's card →" : "Open today's card →"}
              </Text>
            </View>

            {completedToday && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✓ Done</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Other identities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>OTHER IDENTITIES</Text>
            {!isPro && (
              <TouchableOpacity onPress={() => router.push("/store")}>
                <Text style={styles.unlockLink}>Unlock all →</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.identityGrid}>
            {IDENTITIES.filter((i) => i.id !== profile?.primary_identity).map((id) => (
              <TouchableOpacity
                key={id.id}
                onPress={() => handleIdentityPress(id.id as IdentityId)}
                style={styles.identityChip}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipEmoji, !isPro && { opacity: 0.35 }]}>{id.emoji}</Text>
                {!isPro && <Text style={styles.chipLock}>🔒</Text>}
                <Text style={styles.chipLabel}>{id.label.replace("The ", "")}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pro upsell if not pro */}
        {!isPro && (
          <TouchableOpacity
            onPress={() => router.push("/store")}
            style={styles.proBanner}
            activeOpacity={0.85}
          >
            <Text style={styles.proBannerText}>
              ✦ Unlock Persona Pro — ₹299/mo
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function WeekStrip({ accent }: { accent: string }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <View style={wStyles.container}>
      {days.map((d, i) => {
        const isToday = i === todayIndex;
        const isPast = i < todayIndex;
        return (
          <View key={i} style={wStyles.day}>
            <Text style={wStyles.dayLabel}>{d}</Text>
            <View style={[
              wStyles.dot,
              isPast && { backgroundColor: accent },
              isToday && { borderColor: accent, borderWidth: 2 },
            ]}>
              {isPast && <Text style={wStyles.check}>✓</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const wStyles = StyleSheet.create({
  container: {
    flexDirection: "row", backgroundColor: COLORS.surface,
    borderRadius: 16, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  day: { flex: 1, alignItems: "center", gap: 5 },
  dayLabel: { fontSize: 9, color: COLORS.muted, fontFamily: "Inter_600SemiBold" },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.border, alignItems: "center", justifyContent: "center",
  },
  check: { fontSize: 10, color: "#09090b", fontFamily: "Inter_900Black" },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 100 },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 20,
  },
  greeting: { fontSize: 12, color: COLORS.muted, fontFamily: "Inter_400Regular", marginBottom: 2 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_800ExtraBold", color: "#fafafa", letterSpacing: -0.5 },
  streak: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: COLORS.surface, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  streakEmoji: { fontSize: 16 },
  streakNum: { fontSize: 16, fontFamily: "Inter_800ExtraBold", color: "#fafafa" },
  identityCard: {
    borderRadius: 24, borderWidth: 1.5, padding: 28,
    marginBottom: 16, position: "relative", overflow: "hidden",
  },
  cardEyebrow: {
    fontSize: 9, letterSpacing: 3, fontFamily: "Inter_700Bold",
    textTransform: "uppercase", marginBottom: 10,
  },
  cardEmoji: { fontSize: 36, marginBottom: 8 },
  cardTitle: {
    fontSize: 26, fontFamily: "Inter_800ExtraBold",
    color: "#fafafa", letterSpacing: -0.5, marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14, color: COLORS.subtle, fontFamily: "Inter_400Regular",
    lineHeight: 21, marginBottom: 20,
  },
  cardCta: {
    alignSelf: "flex-start", borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  cardCtaText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  completedBadge: {
    position: "absolute", top: 16, right: 16,
    backgroundColor: "rgba(34,197,94,0.15)", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  completedText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#22c55e" },
  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10, color: COLORS.muted, fontFamily: "Inter_700Bold",
    textTransform: "uppercase", letterSpacing: 2,
  },
  unlockLink: { fontSize: 11, color: "#b06aff", fontFamily: "Inter_700Bold" },
  identityGrid: { flexDirection: "row", gap: 8 },
  identityChip: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: "center", paddingVertical: 12, gap: 4,
  },
  chipEmoji: { fontSize: 20 },
  chipLock: { fontSize: 10, position: "absolute", top: 8, right: 8 },
  chipLabel: { fontSize: 9, color: COLORS.muted, fontFamily: "Inter_500Medium", textAlign: "center" },
  proBanner: {
    backgroundColor: "rgba(176,106,255,0.08)", borderRadius: 16,
    borderWidth: 1.5, borderColor: "rgba(176,106,255,0.2)",
    paddingVertical: 14, alignItems: "center",
  },
  proBannerText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#b06aff" },
});
