import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { TimeBlock } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Bildirim izinleri alınamadı!');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'LGS Asistanım Bildirimleri',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#339AF0',
    });
  }

  return true;
}

export async function scheduleBlockNotification(
  block: TimeBlock,
  subjectName: string,
  preMinutes: number = 5
): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined;

  try {
    const [hours, minutes] = block.startTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return undefined;

    // Calculate notification time
    const now = new Date();
    const targetDate = new Date();
    targetDate.setHours(hours, minutes - preMinutes, 0, 0);

    // If time has already passed today, schedule for tomorrow or skip if 'once'
    if (targetDate.getTime() <= now.getTime()) {
      if (block.repeatType === 'once') return undefined;
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const trigger: Notifications.NotificationTriggerInput = {
      date: targetDate,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ LGS Zamanı: ${subjectName}`,
        body: `${preMinutes} dakika sonra (${block.startTime}) "${block.title}" çalışma seansın başlıyor. Hedefine bir adım daha yaklaş!`,
        sound: true,
        data: { blockId: block.id },
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error('Bildirim planlanırken hata oluştu:', error);
    return undefined;
  }
}

export async function cancelBlockNotification(notificationId?: string): Promise<void> {
  if (!notificationId || Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Bildirim iptal edilirken hata:', error);
  }
}
