/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

async function onMessageReceived(message) {
  console.log(message, 'message of notification ....');
}

async function onDisplayNotification(data) {
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  // Display a notification
  await notifee.displayNotification({
    title: data.notification.title,
    body: data.notification.body,
    android: {
      channelId,
      smallIcon: 'ic_launcher_emmy',
      color: '#FFFFFF',
      pressAction: {
        id: 'default',
      },
      
    },
  });
}

messaging().onMessage(remoteMessage => {
  console.log('Foreground message:', remoteMessage);
  onDisplayNotification(remoteMessage);
});

messaging().onNotificationOpenedApp(remoteMessage => {
  console.log('App opened by notification while in foreground:', remoteMessage);
  onDisplayNotification(remoteMessage);
});

messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    console.log('App opened by notification from closed state:', remoteMessage);
  });

messaging().setBackgroundMessageHandler(onMessageReceived);

AppRegistry.registerComponent(appName, () => App);
