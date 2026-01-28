import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useEffect, useRef, useState } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  async function registerForPushNotificationsAsync() {
    let token;
    try {
      if (Device.isDevice) {
        // @ts-ignore
        const { status: existingStatus } = await Notifications.getPermissionsAsync(undefined);
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          // @ts-ignore
          const { status } = await Notifications.requestPermissionsAsync(undefined);
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          return;
        }

        // Check if we can actually get a token (will fail in Expo Go SDK 53+)
        try {
          token = (await Notifications.getExpoPushTokenAsync()).data;
        } catch (tokenError) {
          console.log('Skipping push token registration: Not supported in Expo Go SDK 53+');
          return;
        }
      }

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (error) {
      console.warn('Push Notifications are not supported in this environment (likely Expo Go SDK 53+).', error);
    }

    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return { expoPushToken, notification };
};
