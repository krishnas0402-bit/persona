import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

export const requestPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-card", {
      name: "Daily Card Reminder",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#b06aff",
    });
  }

  return true;
};

export const scheduleDailyReminder = async (
  timeString: string, // "HH:MM" format
  identityLabel: string,
  identityEmoji: string
): Promise<string | null> => {
  // Cancel any existing reminders
  await cancelDailyReminder();

  const [hours, minutes] = timeString.split(":").map(Number);

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your card is ready.",
      body: `${identityEmoji} ${identityLabel} awaits. 60 seconds is all it takes.`,
      data: { screen: "card" },
      sound: false,
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });

  return identifier;
};

export const cancelDailyReminder = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const getPushToken = async (): Promise<string | null> => {
  if (!Device.isDevice) return null;
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
};
