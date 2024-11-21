import {View, Text, StyleSheet, Button, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileScreen = () => {
  const [data, setData] = useState([]);

  const getProfile = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.error('No access token found');
        return;
      }

      const {data} = await axios.get(
        'https://api.emmysvideos.com/api/v1/user/getprofile',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (data && data.status) {
        console.log(data.data.tourplace);
        setData(data?.data);
      }
    } catch (e) {
      console.log(e, 'error in profile');
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Profile Details</Text>
      <View style={{flex: 1}}>
        <View style={styles.card}>
          <Icon name="email" size={24} color="white" />
          <Text style={styles.text}>{data?.email}</Text>
        </View>
        <View style={styles.card}>
          <Icon name="cellphone" size={24} color="white" />
          <Text style={styles.text}>{data?.phone_number}</Text>
        </View>
        <View style={styles.card}>
          <Icon name="at" size={24} color="white" />
          <Text style={styles.text}>{data?.username}</Text>
        </View>
        <View style={styles.card}>
          <Icon name="flag" size={24} color="white" />
          <Text style={styles.text}>{data?.tourplace[0]?.place_name}</Text>
        </View>
      </View>
      <Button
        title="Delete Account"
        color="red"
        onPress={() =>
          Alert.alert(
            'Delete account',
            'Are you sure you want to delete the account ?',
            [
              {
                text: 'Yes',
                onPress: () => console.log('Yes Pressed'),
              },
              {
                text: 'No',
              },
            ],
            {cancelable: true},
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1541', // Background color from your design
    padding: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1C2749', // Similar to the card background
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginLeft: 16,
  },
});

export default ProfileScreen;
