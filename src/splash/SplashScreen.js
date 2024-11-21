import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect} from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';

const SplashScreen = ({navigation}) => {

  const checkIsAuthenticated = async () => {
    try {
      const data = await AsyncStorage.getItem('access_token');
      const user_data = await AsyncStorage.getItem('user_details');
      const parsed_data = JSON.parse(user_data);
      if (data) {
        navigation.replace('Home', {
          user_id: parsed_data.user_id,
          usertype: parsed_data.usertype,
        });
      } else {
        navigation.replace('Signin');
      }
    } catch (e) {
      console.log(e, 'error in checking authentication');
    }
  };

  useEffect(() => {
    checkIsAuthenticated();
  }, []);

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
