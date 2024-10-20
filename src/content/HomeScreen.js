import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const HomeScreen = () => {
  const [cameraData, setCameraData] = useState([]);


  const fetchCameraData = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.error('No access token found');
        return;
      }
      const response = await axios.get('https://api.emmysvideos.com/api/v1/camera/getall', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching camera data:', error);
    }
  };

  useEffect(() => {
    const getCameraData = async () => {
      const data = await fetchCameraData();
      setCameraData(data);
    };

    getCameraData();
  }, []);

  return (
    <View>
      <Text>Choose Camera</Text>
      <FlatList
        data={cameraData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default HomeScreen;
