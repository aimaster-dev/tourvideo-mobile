import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './src/splash/SplashScreen';
import SignInScreen from './src/auth/SignInScreen';
import SignUpScreen from './src/auth/SIgnUpScreen';
import HomeScreen from './src/content/HomeScreen';
import CameraDetailScreen from './src/content/CameraDetailScreen';
import Player from './src/content/Player';
import OTPScreen from './src/auth/OTPScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        // initialRouteName="OTPCheck"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name = "Home" component={HomeScreen} />
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Signin" component={SignInScreen} />
        <Stack.Screen name="Signup" component={SignUpScreen} />
        <Stack.Screen name="CameraDetail" component={CameraDetailScreen} />
        <Stack.Screen name="Player" component={Player} />
        <Stack.Screen name="OTPCheck" component={OTPScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
