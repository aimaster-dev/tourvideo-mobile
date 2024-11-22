import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from './src/splash/SplashScreen';
import SignInScreen from './src/auth/SignInScreen';
import SignUpScreen from './src/auth/SIgnUpScreen';
import HomeScreen from './src/content/HomeScreen';
import CameraDetailScreen from './src/content/CameraDetailScreen';
import Player from './src/content/Player';
import OTPScreen from './src/auth/OTPScreen';
import VideoPlaybackScreen from './src/content/VideoPlaybackScreen';
import PaymentScreen from './src/content/PaymentScreen';
import CheckoutScreen from './src/content/CheckoutScreen';
import ProfileScreen from './src/content/ProfileScreen';
import {LogBox} from 'react-native';
import Dashboard from './src/content/Dashboard';

const Stack = createStackNavigator();

LogBox.ignoreAllLogs();
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Signin" component={SignInScreen} />
        <Stack.Screen name="Signup" component={SignUpScreen} />
        <Stack.Screen name="CameraDetail" component={CameraDetailScreen} />
        <Stack.Screen name="Player" component={Player} />
        <Stack.Screen name="OTPCheck" component={OTPScreen} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
        <Stack.Screen
          name="VideoPlayback"
          component={VideoPlaybackScreen}
          options={{title: 'How to Use Our Program'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
