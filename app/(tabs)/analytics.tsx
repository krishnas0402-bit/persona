import { useEffect, useMemo } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { subDays, format, isSameDay, parseISO } from "date-fns";
import { useUserStore } from "../../store/userStore";
import { useCardStore } from "../../store/cardStore";
import { useProStore } from "../../store/proStore";
import { IDENTITIES } from "../../constants/identities";
import { COLORS } from "../../constants/theme";

export default function AnalyticsScreen() {
  const router = useRouter();
  const { profile } = useUserStore();
  const { history, loadHistory } = useCardStore();
  const { isPro } = useProStore();

  const identity = IDENTITIES.find((i) => i.id === profile?.primary_identity);
  const accent = identity?.accent ?? "#b06aff";

  useEffect(() => {
    loadHistory();
  }, []);

  // Last 7 days completion map
  const week = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const done = history.some((h) => isSameDay(parseISO(h.completed_date), date));
      return { label: format(date, "EEEEE"), date, done };
    });
  }, [history]);

  // This month completion rate
  const monthStats = useMemo(() => {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const completedThisMonth = history.filter((h) => {
      const d = parseISO(h.completed_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { completed: completedThisMonth, total: dayOfMonth };
  }, [history]);

  // Identity usage breakdown
  const identityUsage = useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach((h) => {
      counts[h.identity_id] = (counts[h.identity_id] || 0) + 1;
    });
    const total = history.length || 1;
    return IDENTITIES.map((id) => ({
      ...id,
      count: counts[id.id] || 0,
      pct: Math.round(((counts[id.id] || 0) / total) * 100),
    }));
  }, [history]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Progress</Text>
        <Text style={styles.subtext}>Your streak, patterns, and consistency.</Text>

        {/* Stat cards */}
        <View style={styles.statsRow}>
          <StatCard label="Current streak" value={String(profile?.streak_current ?? 0)} color="#f97316" />
          <StatCard label="Best streak" value={String(profile?.streak_best ?? 0)} color="#f7c948" />
          <StatCard label="This month" value={`${monthStats.completed}/${monthStats.total}`} color="#22c55e" />
        </View>

        {/* This week */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>THIS WEEK</Text>
          <View style={styles.weekRow}>
            {week.map((d, i) => (
              <View key={i} style={styles.weekDay}>
                <View style={[
                  styles.weekDot,
                  d.done && { backgroundColor: accent },
                ]}>
                  {d.done && <Text style={styles.weekCheck}>✓</Text>}
                </View>
                <Text style={styles.weekLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 30-day heatmap */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>LAST 30 DAYS</Text>
          <View style={styles.heatmap}>
            {Array.from({ length: 30 }, (_, i) => {
              const date = subDays(new Date(), 29 - i);
              const done = history.some((h) => isSameDay(parseISO(h.completed_date), date));
              return (
                <View
                  key={i}
                  style={[
                    styles.heatCell,
                    done && { backgroundColor: accent, opacity: 0.9 },
                  ]}
                />
              );
            })}
          </View>
          <Text style={styles.heatCaption}>
            {history.length} completions in the last 30 days
          </Text>
        </View>

        {/* Identity breakdown — Pro gated */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>IDENTITY BREAKDOWN</Text>
          {!isPro ? (
            <View style={styles.lockedPanel}>
              <Text style={styles.lockedEmoji}>🔒</Text>
              <Text style={styles.lockedText}>
                Track time across all 5 identities with Pro
              </Text>
              <TouchableOpacity
                style={styles.unlockBtn}
                onPress={() => router.push("/store")}
                activeOpacity={0.85}
              >
                <Text style={styles.unlockBtnText}>Unlock Pro</Text>
              </TouchableOpacity>
            </View>
          ) : (
            identityUsage.map((id) => (
              <View key={id.id} style={styles.usageRow}>
                <Text style={styles.usageEmoji}>{id.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.usageLabel}>{id.label}</Text>
                  <View style={styles.usageTrack}>
                    <View
                      style={[
                        styles.usageFill,
                        { width: `${id.pct}%`, backgroundColor: id.accent },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.usagePct}>{id.pct}%</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 100, gap: 14 },
  heading: { fontSize: 28, fontFamily: "Inter_800ExtraBold", color: "#fafafa", letterSpacing: -0.8 },
  subtext: { fontSize: 14, color: COLORS.subtle, fontFamily: "Inter_400Regular", marginBottom: 4 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 16, alignItems: "center",
  },
  statValue: { fontSize: 22, fontFamily: "Inter_900Black" },
  statLabel: {
    fontSize: 8, color: COLORS.muted, fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase", letterSpacing: 1, marginTop: 3,
  },
  panel: {
    backgroundColor: COLORS.surface, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border, padding: 18,
  },
  panelTitle: {
    fontSize: 10, color: COLORS.muted, fontFamily: "Inter_700Bold",
    letterSpacing: 2, marginBottom: 14,
  },
  weekRow: { flexDirection: "row", gap: 6 },
  weekDay: { flex: 1, alignItems: "center", gap: 6 },
  weekDot: {
    width: "100%", aspectRatio: 1, borderRadius: 10,
    backgroundColor: COLORS.border, alignItems: "center", justifyContent: "center",
  },
  weekCheck: { fontSize: 11, color: "#09090b", fontFamily: "Inter_900Black" },
  weekLabel: { fontSize: 9, color: COLORS.muted, fontFamily: "Inter_500Medium" },
  heatmap: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  heatCell: {
    width: "8.5%", aspectRatio: 1, borderRadius: 5,
    backgroundColor: COLORS.border,
  },
  heatCaption: {
    fontSize: 11, color: COLORS.muted, fontFamily: "Inter_400Regular", marginTop: 12,
  },
  lockedPanel: { alignItems: "center", paddingVertical: 16, gap: 10 },
  lockedEmoji: { fontSize: 26 },
  lockedText: { fontSize: 13, color: COLORS.muted, fontFamily: "Inter_400Regular", textAlign: "center" },
  unlockBtn: {
    backgroundColor: "#b06aff", borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 10,
  },
  unlockBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  usageRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  usageEmoji: { fontSize: 16, width: 24 },
  usageLabel: { fontSize: 12, color: "#d4d4d8", fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  usageTrack: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: "hidden" },
  usageFill: { height: "100%", borderRadius: 3 },
  usagePct: { fontSize: 11, color: COLORS.muted, width: 32, textAlign: "right", fontFamily: "Inter_500Medium" },
});
