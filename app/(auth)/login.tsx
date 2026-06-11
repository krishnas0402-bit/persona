import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { COLORS } from "../../constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendLink = async () => {
    if (!email.includes("@")) {
      Alert.alert("Enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: "persona://auth/callback",
      },
    });
    setLoading(false);
    if (error) {
      Alert.alert("Something went wrong", error.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={styles.checkEmoji}>📬</Text>
        <Text style={styles.heading}>Check your email</Text>
        <Text style={styles.sentText}>
          We sent a magic link to{"\n"}
          <Text style={{ color: "#b06aff" }}>{email}</Text>
        </Text>
        <Text style={styles.sentSub}>
          Tap the link to sign in — no password needed.
        </Text>
        <TouchableOpacity onPress={() => setSent(false)} style={styles.resend}>
          <Text style={styles.resendText}>Use a different email →</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.heading}>Sign in to Persona</Text>
          <Text style={styles.subtext}>
            Enter your email — we'll send you a magic link. No password needed.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor={COLORS.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="send"
            onSubmitEditing={handleSendLink}
          />

          <TouchableOpacity
            style={[styles.button, (!email || loading) && styles.buttonDisabled]}
            onPress={handleSendLink}
            disabled={!email || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send magic link →</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.terms}>
            By continuing you agree to our{" "}
            <Text style={{ color: "#b06aff" }}>Privacy Policy</Text>
            {" "}and{" "}
            <Text style={{ color: "#b06aff" }}>Terms of Service</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  inner: { flex: 1, paddingHorizontal: 24 },
  back: { paddingTop: 16, paddingBottom: 8, alignSelf: "flex-start" },
  backText: { color: COLORS.muted, fontFamily: "Inter_500Medium", fontSize: 15 },
  content: { flex: 1, justifyContent: "center", gap: 16 },
  heading: {
    fontSize: 30,
    fontFamily: "Inter_800ExtraBold",
    color: "#fafafa",
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 15,
    color: COLORS.subtle,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: "#fafafa",
    fontFamily: "Inter_400Regular",
  },
  button: {
    backgroundColor: "#b06aff",
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    shadowColor: "#b06aff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  terms: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginTop: 8,
  },
  checkEmoji: { fontSize: 56, marginBottom: 24 },
  sentText: {
    fontSize: 18,
    color: COLORS.subtle,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    lineHeight: 28,
    marginBottom: 8,
  },
  sentSub: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  resend: { marginTop: 32 },
  resendText: { color: "#b06aff", fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
