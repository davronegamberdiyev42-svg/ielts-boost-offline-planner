import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const TIMER_CHANNEL_ID = "ielts-timer";

export type NotificationPermissionState = "granted" | "denied" | "unsupported";

async function prepareAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(TIMER_CHANNEL_ID, {
    name: "Taymer bildirishnomalari",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 300, 150, 300],
    sound: "default",
  });
}

export async function getTimerNotificationPermission(): Promise<NotificationPermissionState> {
  if (Platform.OS === "web") return "unsupported";
  const settings = await Notifications.getPermissionsAsync();
  return settings.granted ? "granted" : "denied";
}

export async function requestTimerNotificationPermission(): Promise<NotificationPermissionState> {
  if (Platform.OS === "web") return "unsupported";
  await prepareAndroidChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return "granted";
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted ? "granted" : "denied";
}

export async function scheduleTimerNotification(
  timerId: string,
  label: string,
  endsAt: number,
): Promise<string> {
  await prepareAndroidChannel();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Taymer tugadi",
      body: `${label} uchun belgilangan vaqt tugadi.`,
      sound: true,
      data: { timerId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(endsAt),
      channelId: Platform.OS === "android" ? TIMER_CHANNEL_ID : undefined,
    },
  });
}

export async function scheduleTestNotification(): Promise<string> {
  await prepareAndroidChannel();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Ovozli bildirishnoma sinovi",
      body: "IELTS Boost bildirishnomasi tayyor.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: Platform.OS === "android" ? TIMER_CHANNEL_ID : undefined,
    },
  });
}

export async function cancelTimerNotification(id: string | null | undefined) {
  if (!id || Platform.OS === "web") return;
  await Notifications.cancelScheduledNotificationAsync(id);
}
