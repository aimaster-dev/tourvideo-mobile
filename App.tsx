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
import PaymentScreen from './src/content/Payment/PaymentScreen';
import CheckoutScreen from './src/content/CheckoutScreen';
import ProfileScreen from './src/content/ProfileScreen';
import {LogBox, StyleSheet} from 'react-native';
import Dashboard from './src/content/Dashboard';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {AuthContext, AuthProvider} from './src/context/AuthContext';
import {Semibold} from './src/constants/font';
import Toast from './src/components/Toast';
import {ToastProvider} from './src/context/ToastContext';

const Stack = createStackNavigator();

LogBox.ignoreAllLogs();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Signin" component={SignInScreen} />
    <Stack.Screen name="Signup" component={SignUpScreen} />
    <Stack.Screen name="OTPCheck" component={OTPScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStatusBarHeight: 0,
      headerStyle: {
        backgroundColor: '#0B1541',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontFamily: Semibold,
        fontSize: 20,
      },
    }}>
    <Stack.Screen
      name="Dashboard"
      component={Dashboard}
      options={{headerShown: false}}
    />
    <Stack.Screen name="Choose Camera" component={HomeScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="CameraDetail" component={CameraDetailScreen} />
    <Stack.Screen
      name="Player"
      component={Player}
      options={{
        headerStyle: {
          backgroundColor: '#000000',
        },
      }}
    />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen
      name="VideoPlayback"
      component={VideoPlaybackScreen}
      options={{title: 'How to Use Our Program'}}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const {user, isLoading} = React.useContext(AuthContext);
  if (isLoading) {
    return <SplashScreen />;
  }
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <Toast />
        <NavigationContainer>
          <SafeAreaView edges={['top']} style={styles.container}>
            {user ? <AppStack /> : <AuthStack />}
          </SafeAreaView>
        </NavigationContainer>
      </ToastProvider>
    </SafeAreaProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1541',
  },
});

export default App;
