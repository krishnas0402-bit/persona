import { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { IDENTITIES } from "../../constants/identities";
import { COLORS } from "../../constants/theme";
import { useUserStore } from "../../store/userStore";
import { supabase, createProfile } from "../../lib/supabase";
import { IdentityId } from "../../constants/theme";

export default function OnboardIdentityScreen() {
  const router = useRouter();
  const { user, loadProfile } = useUserStore();
  const [selected, setSelected] = useState<IdentityId | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected || !user) return;
    setLoading(true);

    try {
      // Create or update profile with selected identity
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existing) {
        await createProfile(user.id, selected);
      } else {
        await supabase
          .from("profiles")
          .update({ primary_identity: selected })
          .eq("id", user.id);
      }

      await loadProfile();
      router.push("/(auth)/onboard-paywall");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.step}>Step 1 of 2</Text>
        <Text style={styles.heading}>Who are you{"\n"}choosing to become?</Text>
        <Text style={styles.subtext}>
          Your daily card is built entirely around this identity.
        </Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {IDENTITIES.map((identity) => {
          const isSelected = selected === identity.id;
          return (
            <TouchableOpacity
              key={identity.id}
              onPress={() => setSelected(identity.id)}
              activeOpacity={0.8}
              style={[
                styles.card,
                isSelected && {
                  borderColor: identity.accent,
                  backgroundColor: identity.soft,
                },
              ]}
            >
              <Text style={styles.emoji}>{identity.emoji}</Text>
              <View style={styles.cardText}>
                <Text style={[styles.label, isSelected && { color: identity.accent }]}>
                  {identity.label}
                </Text>
                <Text style={styles.trait}>{identity.trait}</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  isSelected && { borderColor: identity.accent, backgroundColor: identity.accent },
                ]}
              >
                {isSelected && <Text style={styles.radioCheck}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !selected && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selected || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue →</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  step: {
    fontSize: 10,
    letterSpacing: 3,
    color: COLORS.muted,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  heading: {
    fontSize: 30,
    fontFamily: "Inter_800ExtraBold",
    color: "#fafafa",
    letterSpacing: -0.8,
    lineHeight: 38,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: COLORS.subtle,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  list: { flex: 1, paddingHorizontal: 24 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  emoji: { fontSize: 26, width: 36, textAlign: "center" },
  cardText: { flex: 1 },
  label: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#e4e4e7",
    marginBottom: 2,
  },
  trait: {
    fontSize: 11,
    color: COLORS.muted,
    fontFamily: "Inter_400Regular",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCheck: { fontSize: 11, color: "#09090b", fontFamily: "Inter_900Black" },
  footer: { padding: 24, paddingTop: 12 },
  button: {
    backgroundColor: "#b06aff",
    borderRadius: 18,
    paddingVertical: 17,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.35 },
  buttonText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
