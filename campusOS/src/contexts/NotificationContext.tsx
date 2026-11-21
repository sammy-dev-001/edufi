import Constants from 'expo-constants';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { updateUserPushToken } from '../services/userService';
import { useAuth } from './AuthContext';

// Detect Expo Go — expo-notifications push notifications removed from Expo Go since SDK 53
const IS_EXPO_GO = Constants.appOwnership === 'expo';

// Only load expo-notifications when NOT running in Expo Go
let Notifications: typeof import('expo-notifications') | null = null;
if (!IS_EXPO_GO) {
  try {
    Notifications = require('expo-notifications');
    Notifications!.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    console.warn('[Notifications] Failed to load expo-notifications:', e);
    Notifications = null;
  }
} else {
  console.log('[Notifications] Running in Expo Go — push notifications disabled.');
}

type NotificationType = 'like' | 'comment' | 'message' | 'class' | 'post';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

interface NotificationContextType {
  scheduleNotification: (type: NotificationType, payload: NotificationPayload) => Promise<string>;
  cancelNotification: (notificationId: string) => Promise<void>;
  getPushToken: () => Promise<string | null>;
  registerForPushNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const notificationListener = useRef<any>(undefined);
  const responseListener = useRef<any>(undefined);

  useEffect(() => {
    if (!Notifications) return; // Expo Go or module unavailable

    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log('Notification response:', data);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [user?.id]);

  const registerForPushNotifications = async (): Promise<void> => {
    if (!Notifications) return;
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted.');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: '4db3bf0f-f0fc-4892-b786-3ff8f17744b0',
      })).data;

      if (user?.id) {
        try {
          await updateUserPushToken(user.id.toString(), token);
        } catch (e) {
          console.warn('[Notifications] Failed to update push token on server:', e);
        }
      }
    } catch (error) {
      console.warn('[Notifications] registerForPushNotifications failed:', error);
    }
  };

  const scheduleNotification = async (
    type: NotificationType,
    { title, body, data = {} }: NotificationPayload
  ): Promise<string> => {
    if (!Notifications) return '';
    try {
      return await Notifications.scheduleNotificationAsync({
        content: { title, body, data: { type, ...data }, sound: 'default' },
        trigger: null,
      });
    } catch (error) {
      console.warn('[Notifications] scheduleNotification failed:', error);
      return '';
    }
  };

  const cancelNotification = async (notificationId: string): Promise<void> => {
    if (!Notifications || !notificationId) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.warn('[Notifications] cancelNotification failed:', error);
    }
  };

  const getPushToken = async (): Promise<string | null> => {
    if (!Notifications) return null;
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') return null;
      return (await Notifications.getExpoPushTokenAsync()).data;
    } catch (error) {
      console.warn('[Notifications] getPushToken failed:', error);
      return null;
    }
  };

  return (
    <NotificationContext.Provider
      value={{ scheduleNotification, cancelNotification, getPushToken, registerForPushNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
