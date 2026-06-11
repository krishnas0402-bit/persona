import { Tabs, Redirect } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useUserStore } from "../../store/userStore";
import { COLORS } from "../../constants/theme";

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { session, profile, isInitialized } = useUserStore();

  if (!isInitialized) return null;
  if (!session) return <Redirect href="/(auth)/splash" />;
  if (session && profile && !profile.onboarded) return <Redirect href="/(auth)/onboard-identity" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="Progress" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🎁" label="Store" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "rgba(9,9,11,0.97)",
    borderTopColor: "#1f1f23",
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 16,
  },
  tabItem: { alignItems: "center", gap: 3 },
  tabEmoji: { fontSize: 20, opacity: 0.35 },
  tabEmojiActive: { opacity: 1 },
  tabLabel: { fontSize: 10, color: COLORS.muted, fontFamily: "Inter_500Medium" },
  tabLabelActive: { color: "#b06aff", fontFamily: "Inter_700Bold" },
});
