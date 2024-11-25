import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Medium, Regular, Semibold} from '../constants/font';
import {useAPI} from '../hooks/useAPI';
import {AuthContext} from '../context/AuthContext';

const ProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const api = useAPI();

  const {logout} = useContext(AuthContext);

  const getProfile = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        setLoading(false);
        console.error('No access token found');
        return;
      }

      const {data} = await api.get('user/getprofile', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setLoading(false);
      if (data && data.status) {
        setData(data?.data);
      }
    } catch (e) {
      setLoading(false);
      console.log(e, 'error in profile');
    }
  };

  const deleteAccount = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.error('No access token found');
        return;
      }
      const { data } = await api.post('user/deleteaccount', {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (data && data.status) {
        await logout();
      }
    } catch (e) {
      console.log(e, 'error in deleting the account');
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      Alert.alert(
        'Delete account',
        'Are you sure you want to delete the account ?',
        [
          {
            text: 'Yes',
            onPress: async () => {
              await deleteAccount();
              setIsSubmitting(false);
            },
          },
          {
            text: 'No',
            onPress: () => {
              setIsSubmitting(false);
            },
          },
        ],
        {cancelable: true},
      );
    } catch (e) {
      console.log(e, 'error in deleting');
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <View style={styles.container}>
      <View style={{flex: 1}}>
        {!loading ? (
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
            {data?.tourplace && (
              <View style={styles.card}>
                <Icon name="flag" size={24} color="white" />
                <Text style={styles.text}>
                  {data?.tourplace[0]?.place_name}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#287BF3" />
          </View>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete()}
        disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1541', // Background color from your design
    padding: 20,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#0B1541',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 20,
  },
  deleteButton: {
    width: '100%',
    backgroundColor: '#FF4C4C',
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: Medium,
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
    fontFamily: Medium,
  },
});

export default ProfileScreen;
