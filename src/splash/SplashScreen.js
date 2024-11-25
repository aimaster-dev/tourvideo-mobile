import React from 'react';
import {View, Image, StyleSheet} from 'react-native';

const SplashScreen = ({}) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../asset/img/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
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
    height: 238, // Adjust size as per your logo
    marginBottom: 20,
  },
});

export default SplashScreen;
