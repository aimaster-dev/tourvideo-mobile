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
import {LogBox, StyleSheet} from 'react-native';
import Dashboard from './src/content/Dashboard';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {AuthContext, AuthProvider} from './src/context/AuthContext';

const Stack = createStackNavigator();

LogBox.ignoreAllLogs();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="SignIn" component={SignInScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen name="OTPCheck" component={OTPScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Dashboard" component={Dashboard} />
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="CameraDetail" component={CameraDetailScreen} />
    <Stack.Screen name="Player" component={Player} />
    <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
    <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
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
      <NavigationContainer>
        <SafeAreaView edges={['top']} style={styles.container}>
          {user ? <AppStack /> : <AuthStack />}
        </SafeAreaView>
      </NavigationContainer>
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
