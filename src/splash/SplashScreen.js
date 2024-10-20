import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Signin');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../asset/img/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      {/* Text under the logo */}
      {/* <Text style={styles.title}>EMMY'S VIDEOS</Text>
      <Text style={styles.subtitle}>Manage Travel Video</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B1541', // Dark blue background color from the image
  },
  logo: {
    width: 362,
    height: 238,  // Adjust size as per your logo
    marginBottom: 20,
  },
//   title: {
//     fontSize: 24,
//     color: '#FFFFFF', // White text
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#FFFFFF', // White text
//   },
});

export default SplashScreen;
