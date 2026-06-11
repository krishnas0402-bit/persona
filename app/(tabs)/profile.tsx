import { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Switch, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "../../store/userStore";
import { useProStore } from "../../store/proStore";
import { IDENTITIES } from "../../constants/identities";
import { COLORS } from "../../constants/theme";
import {
  requestPermissions,
  scheduleDailyReminder,
  cancelDailyReminder,
} from "../../lib/notifications";

const TIMES = ["06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00"];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, user, updateNotifications, signOut } = useUserStore();
  const { isPro } = useProStore();
  const [saving, setSaving] = useState(false);

  const identity = IDENTITIES.find((i) => i.id === profile?.primary_identity);
  const notifEnabled = profile?.notification_enabled ?? false;
  const notifTime = profile?.notification_time?.slice(0, 5) ?? "07:00";

  const handleToggleNotifications = async (value: boolean) => {
    setSaving(true);
    try {
      if (value) {
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert(
            "Permission needed",
            "Enable notifications in your device settings to get daily reminders."
          );
          setSaving(false);
          return;
        }
        await scheduleDailyReminder(
          notifTime,
          identity?.label ?? "Your identity",
          identity?.emoji ?? "🎴"
        );
      } else {
        await cancelDailyReminder();
      }
      await updateNotifications(value, notifTime + ":00");
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = async (time: string) => {
    setSaving(true);
    try {
      await updateNotifications(true, time + ":00");
      if (notifEnabled) {
        await scheduleDailyReminder(
          time,
          identity?.label ?? "Your identity",
          identity?.emoji ?? "🎴"
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign out?", "Your streak and data are saved to your account.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Profile</Text>
        <Text style={styles.subtext}>Your identity, plan, and reminders.</Text>

        {/* Identity card */}
        {identity && (
          <View style={[styles.identityCard, { borderColor: identity.accent + "44", backgroundColor: identity.soft }]}>
            <View style={[styles.identityIcon, { backgroundColor: identity.accent + "22" }]}>
              <Text style={styles.identityEmoji}>{identity.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.identityName, { color: identity.accent }]}>{identity.label}</Text>
              <Text style={styles.identityTrait}>{identity.trait}</Text>
              <Text style={styles.identityStreak}>🔥 {profile?.streak_current ?? 0} day streak</Text>
            </View>
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={() => Alert.alert(
                "Change identity",
                isPro
                  ? "Pick a new primary identity from the home screen."
                  : "Switching identities requires Persona Pro.",
              )}
            >
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Plan */}
        <View style={[styles.panel, isPro && styles.proPanel]}>
          <View style={styles.planRow}>
            <View>
              <Text style={[styles.planTitle, isPro && { color: "#b06aff" }]}>
                {isPro ? "✦ Persona Pro" : "Free Plan"}
              </Text>
              <Text style={styles.planSub}>
                {isPro
                  ? "All identities · All packs · Full analytics"
                  : "1 identity · Base cards only"}
              </Text>
            </View>
            {!isPro ? (
              <TouchableOpacity
                style={styles.upgradeBtn}
                onPress={() => router.push("/store")}
                activeOpacity={0.85}
              >
                <Text style={styles.upgradeBtnText}>Upgrade</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            )}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.panel}>
          <View style={styles.notifRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.notifTitle}>Daily reminder</Text>
              <Text style={styles.notifSub}>
                {notifEnabled ? `Every day at ${notifTime}` : "Off"}
              </Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={handleToggleNotifications}
              disabled={saving}
              trackColor={{ false: COLORS.border, true: identity?.accent ?? "#b06aff" }}
              thumbColor="#fff"
            />
          </View>

          {notifEnabled && (
            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>REMINDER TIME</Text>
              <View style={styles.timeGrid}>
                {TIMES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => handleTimeChange(t)}
                    disabled={saving}
                    style={[
                      styles.timeChip,
                      notifTime === t && { backgroundColor: identity?.accent ?? "#b06aff" },
                    ]}
                  >
                    <Text style={[
                      styles.timeChipText,
                      notifTime === t && { color: "#09090b" },
                    ]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Account */}
        <View style={styles.panel}>
          <Text style={styles.accountLabel}>SIGNED IN AS</Text>
          <Text style={styles.accountEmail}>{user?.email}</Text>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.actionRow} onPress={handleSignOut}>
          <Text style={styles.actionTextDanger}>Sign out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Persona v1.0.0 · Made with intention</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 100, gap: 14 },
  heading: { fontSize: 28, fontFamily: "Inter_800ExtraBold", color: "#fafafa", letterSpacing: -0.8 },
  subtext: { fontSize: 14, color: COLORS.subtle, fontFamily: "Inter_400Regular", marginBottom: 4 },
  identityCard: {
    borderRadius: 20, borderWidth: 1.5, padding: 18,
    flexDirection: "row", alignItems: "center", gap: 14,
  },
  identityIcon: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  identityEmoji: { fontSize: 26 },
  identityName: { fontSize: 15, fontFamily: "Inter_800ExtraBold" },
  identityTrait: { fontSize: 11, color: COLORS.muted, fontFamily: "Inter_400Regular", marginTop: 2 },
  identityStreak: { fontSize: 12, color: "#f97316", fontFamily: "Inter_500Medium", marginTop: 2 },
  changeBtn: {
    borderWidth: 1, borderColor: "#333", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  changeBtnText: { fontSize: 11, color: COLORS.subtle, fontFamily: "Inter_600SemiBold" },
  panel: {
    backgroundColor: COLORS.surface, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border, padding: 18,
  },
  proPanel: {
    backgroundColor: "rgba(176,106,255,0.06)",
    borderColor: "rgba(176,106,255,0.25)",
  },
  planRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: COLORS.subtle },
  planSub: { fontSize: 12, color: COLORS.muted, fontFamily: "Inter_400Regular", marginTop: 2 },
  upgradeBtn: {
    backgroundColor: "#b06aff", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  upgradeBtnText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },
  activeBadge: {
    backgroundColor: "rgba(34,197,94,0.15)", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  activeBadgeText: { fontSize: 10, fontFamily: "Inter_800ExtraBold", color: "#22c55e" },
  notifRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  notifTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#e4e4e7" },
  notifSub: { fontSize: 11, color: COLORS.muted, fontFamily: "Inter_400Regular", marginTop: 2 },
  timeSection: { marginTop: 16 },
  timeLabel: {
    fontSize: 10, color: COLORS.muted, fontFamily: "Inter_700Bold",
    letterSpacing: 1.5, marginBottom: 8,
  },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  timeChip: {
    backgroundColor: COLORS.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  timeChipText: { fontSize: 12, color: COLORS.subtle, fontFamily: "Inter_700Bold" },
  accountLabel: {
    fontSize: 10, color: COLORS.muted, fontFamily: "Inter_700Bold",
    letterSpacing: 1.5, marginBottom: 4,
  },
  accountEmail: { fontSize: 14, color: "#d4d4d8", fontFamily: "Inter_400Regular" },
  actionRow: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 14, alignItems: "center",
  },
  actionTextDanger: { fontSize: 14, color: "#e94560", fontFamily: "Inter_600SemiBold" },
  version: {
    fontSize: 11, color: "#2a2a2e", textAlign: "center",
    fontFamily: "Inter_400Regular", marginTop: 8,
  },
});
