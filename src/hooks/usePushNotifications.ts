import { useState, useEffect, useCallback } from 'react';

interface NotificationSchedule {
  workoutReminder: boolean;
  workoutTime: string;
  streakReminder: boolean;
  waterReminder: boolean;
  waterInterval: number; // hours
}

const DEFAULT_SCHEDULE: NotificationSchedule = {
  workoutReminder: true,
  workoutTime: '18:00',
  streakReminder: true,
  waterReminder: false,
  waterInterval: 2,
};

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [schedule, setSchedule] = useState<NotificationSchedule>(DEFAULT_SCHEDULE);

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      registerServiceWorker();
      loadSchedule();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const loadSchedule = () => {
    const saved = localStorage.getItem('fitai-notification-schedule');
    if (saved) {
      try {
        setSchedule(JSON.parse(saved));
      } catch {
        setSchedule(DEFAULT_SCHEDULE);
      }
    }
  };

  const saveSchedule = (newSchedule: NotificationSchedule) => {
    setSchedule(newSchedule);
    localStorage.setItem('fitai-notification-schedule', JSON.stringify(newSchedule));
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback(async (
    title: string,
    body: string,
    options?: NotificationOptions
  ) => {
    if (permission !== 'granted') {
      console.log('Notifications not permitted');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [permission]);

  const scheduleWorkoutReminder = useCallback(() => {
    if (permission !== 'granted' || !schedule.workoutReminder) return;

    const now = new Date();
    const [hours, minutes] = schedule.workoutTime.split(':').map(Number);
    const reminderTime = new Date(now);
    reminderTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const delay = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      sendNotification(
        '💪 Workout Zeit!',
        'Zeit für dein Training. Starte jetzt dein Workout!',
        { tag: 'workout-reminder' }
      );
      // Reschedule for next day
      scheduleWorkoutReminder();
    }, delay);
  }, [permission, schedule.workoutReminder, schedule.workoutTime, sendNotification]);

  const sendStreakReminder = useCallback((streakDays: number) => {
    if (permission !== 'granted' || !schedule.streakReminder) return;

    sendNotification(
      '🔥 Streak in Gefahr!',
      `Du hast einen ${streakDays}-Tage-Streak. Trainiere heute um ihn zu behalten!`,
      { tag: 'streak-reminder' }
    );
  }, [permission, schedule.streakReminder, sendNotification]);

  const sendWaterReminder = useCallback(() => {
    if (permission !== 'granted' || !schedule.waterReminder) return;

    sendNotification(
      '💧 Trink Wasser!',
      'Zeit für ein Glas Wasser. Bleib hydriert!',
      { tag: 'water-reminder' }
    );
  }, [permission, schedule.waterReminder, sendNotification]);

  return {
    isSupported,
    permission,
    schedule,
    requestPermission,
    sendNotification,
    saveSchedule,
    scheduleWorkoutReminder,
    sendStreakReminder,
    sendWaterReminder,
  };
}
