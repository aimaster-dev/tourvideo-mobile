import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from '../context/AuthContext';

const Header = ({navigation, data}) => {
  const [username, setUsername] = useState('');

  const {logout} = useContext(AuthContext);

  const fetchUserData = async () => {
    try {
      const user_data = await AsyncStorage.getItem('user_details');
      const parsed_data = JSON.parse(user_data);
      if (parsed_data) {
        setUsername(parsed_data?.username);
      }
    } catch (e) {
      console.log(e, 'error in fetching user details');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <View style={[styles.row, {justifyContent: 'space-between'}]}>
      <View style={styles.row}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.circle}
          onPress={() => navigation.navigate('Profile', {data})}>
          <Icon name="user" size={24} color="red" />
        </TouchableOpacity>
        <View>
          <Text style={styles.welcomeText}>Hello, Welcome 🎉</Text>
          {username && <Text style={styles.name}>{username}</Text>}
        </View>
      </View>
      <TouchableOpacity
        style={styles.logoutContainer}
        onPress={() => {
          Alert.alert(
            'Logout account',
            'Are you sure you want to logout the account?',
            [
              {
                text: 'Yes',
                onPress: async () => {
                  await logout();
                },
              },
              {
                text: 'No',
              },
            ],
            {cancelable: true},
          );
        }}>
        <Icon name="power" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#B7B9C2',
    fontFamily: 'SFProText-Regular',
    fontSize: 15,
  },
  logoutContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    color: '#B7B9C2',
    fontFamily: 'SFProText-Semibold',
    fontSize: 16,
  },
  circle: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
});
export default Header;
