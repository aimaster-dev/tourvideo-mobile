import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {useAPI} from '../hooks/useAPI';
import {Semibold} from '../constants/font';
import Camera from '../../asset/svg/Camera.svg';

const HomeScreen = ({}) => {
  const [userData, setUserData] = useState({});

  const [cameraData, setCameraData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const api = useAPI();

  useEffect(() => {
    const fetchCameraData = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('access_token');
        const user_data = await AsyncStorage.getItem('user_details');
        const parsed_data = JSON.parse(user_data);
        if (parsed_data) {
          setUserData(parsed_data);
        }
        if (!accessToken) {
          console.error('No access token found');
          return;
        }

        const response = await api.get('camera/getall', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log(response, "response of camera")
        if (response.data && response.data.status) {
          setCameraData(response.data.data);
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
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#287BF3" style={styles.center} />
      </View>
    );
  }

  const handleItemPress = item => {
    navigation.navigate('Player', {
      cam_id: item.id,
      tourplace_id: item.tourplace[0]?.id,
      camera_name: item.camera_name,
      rtsp_url: item.rtsp_url,
      tourplace: item.tourplace[0]?.place_name || 'Unknown Place',
      usertype: userData?.usertype,
      user_id: userData?.user_id,
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cameraData}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.box}
            onPress={() => {
              handleItemPress(item);
            }}>
            <View style={styles.iconContainer}>
              <Camera width={32} height={32} />
            </View>
            <Text style={styles.name}>{item.camera_name}</Text>
          </TouchableOpacity>
        )}
        numColumns={2}
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
  box: {
    flex: 1,
    margin: 8,
    padding: 16,
    backgroundColor: '#575B721A',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  spaceBetween: {justifyContent: 'space-between'},
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: Semibold,
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#0B1541',
  },
  name: {
    color: '#9E9E9E',
    width: '100%',
    fontFamily: Semibold,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
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
    width: 72,
    height: 72,
    backgroundColor: '#575B72',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 72,
  },
  center: {flex: 1, justifyContent: 'center'},
  icon: {
    width: 30, // Set the width of your icon image
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
