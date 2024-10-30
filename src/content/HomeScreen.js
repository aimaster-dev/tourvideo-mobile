import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const HomeScreen = ({ navigation }) => {
  const [cameraData, setCameraData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

        
        if (response.data && response.data.status) {
          setCameraData(response.data.data); // Save the camera data
        }
      } catch (error) {
        console.error('Error fetching camera data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCameraData();
  }, []);

  if (loading) {
    // eslint-disable-next-line react-native/no-inline-styles
    return <ActivityIndicator size="large" color="#287BF3" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  const handleItemPress = (item) => {
    navigation.navigate('Player', {
      tourplace_id: item.tourplace[0]?.id,
      camera_name: item.camera_name,
      camera_ip: item.camera_ip,
      camera_port: item.camera_port,
      camera_user_name: item.camera_user_name,
      password: item.password,
      tourplace: item.tourplace[0]?.place_name || 'Unknown Place',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Choose Camera</Text>

      {/* Display camera data in a list */}
      <FlatList
        data={cameraData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.cameraItem} onPress={() => handleItemPress(item)}>
            <View style={styles.cameraItem}>
              <Image
                source={require('../../asset/img/camera_icon.png')} // Ensure the path is correct for your image file
                style={styles.icon}
              />
              <Text style={styles.cameraText}>{item.camera_name}</Text>
            </View>
          </TouchableOpacity>
        )}
        numColumns={2} // Display items in two columns
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
  cameraItem: {
    flex: 1,
    backgroundColor: '#1C2749', // Similar to the card background
    borderRadius: 10,
    padding: 20,
    margin: 10,
    alignItems: 'center', // Center items horizontally
    justifyContent: 'center', // Center items vertically
  },
  iconContainer: {
    backgroundColor: '#333C57', // Background color for the icon
    borderRadius: 50, // Makes the icon container circular
    padding: 10,
    marginBottom: 10,
  },
  icon: {
    width: 30,  // Set the width of your icon image
    height: 30, // Set the height of your icon image
    resizeMode: 'contain', // Ensure the image scales properly
  },
  cameraText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center', // Center the text under the icon
  },
});

export default HomeScreen;
