import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Header from '../components/Header';
import {Products} from '../constants/data';
import {Semibold} from '../constants/font';
import {useAPI} from '../hooks/useAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Camera from '../../asset/svg/Camera.svg';
import Video from '../../asset/svg/Video.svg';
import Receipt from '../../asset/svg/Receipt.svg';
import Payment from '../../asset/svg/Payment.svg';
import { useIsFocused } from '@react-navigation/native';

const Dashboard = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const api = useAPI();
  const [product, setProduct] = useState([
    {id: '1', name: 'Camera', icon: Camera, screen: 'Choose Camera'},
    {id: '2', name: 'Recordings', icon: Video, screen: 'Recordings'},
    {id: '3', name: 'Payment', icon: Payment, screen: 'Payment'},
    {
      id: '4',
      name: 'Transaction History',
      icon: Receipt,
      screen: 'Payment',
      params: 'Transaction History',
    },
  ]);

  const focused = useIsFocused()

  const getProfile = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.error('No access token found');
        return;
      }

      const {data} = await api.get('user/getprofile', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(data, "data of profile")
      if (data && data.status) {
        setData(data?.data);
        setLoading(false);
        if (
          !data.data.recording_permissions.is_snapshot_allowed ||
          !data.data.recording_permissions.is_video_allowed
        ) {
          setProduct(product.filter(item => item.name !== 'Payment'));
        }
      }
    } catch (e) {
      setLoading(false);
      console.log(e, 'error in profile');
    }
  };

  // const fetchRecordingLimits = async ({tourplace_id}) => {
  //   try {
  //     const accessToken = await AsyncStorage.getItem('access_token');
  //     if (!accessToken) {
  //       console.error('No access token found');
  //       return;
  //     }
  //     const response = await api.get(
  //       `invoice/video-snapshot-count?tourplace=${tourplace_id}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       },
  //     );
  //     if(response.data.data){
  //       console.log('Recording limits:', response.data.data);
  //       setRecordingLimits(response.data.data);
  //       if(response.data.data.video_remaining > 0 || response.data.data.snapshot_remaining > 0){
  //         setProduct(product.filter(item => item.name !== 'Payment'));
  //       }
  //     }
  //     setLoading(false);
  //   } catch (error) {
  //     console.error('Error fetching recording limits:', error);
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    getProfile();
  }, [focused]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#287BF3" />
        </View>
      ) : (
        <>
          <Header navigation={navigation} data={data} />
          <FlatList
            data={product}
            contentContainerStyle={styles.list}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            renderItem={({item}) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  style={styles.box}
                  onPress={() => {
                    if (item.name === 'Camera') {
                      if (
                        data.recording_permissions.is_snapshot_allowed ||
                        data.recording_permissions.is_video_recording_allowed
                      ) {
                        navigation.navigate(item.screen);
                      } else {
                        console.log(data.recording_permissions)
                        Alert.alert(
                          'Limited Exceeded',
                          'You have exceeded the limit of recording. Please upgrade your plan to continue.',
                          [
                            {
                              text: 'Cancel',
                              onPress: () => console.log('Cancel Pressed'),
                              style: 'cancel',
                            },
                            {
                              text: 'OK',
                              onPress: () => navigation.navigate('Payment'),
                            },
                          ],
                        );
                      }
                    } else if (item?.screen && item?.params) {
                      navigation.navigate(item.screen, {
                        params: item?.params,
                      });
                    } else if (item.screen) {
                      navigation.navigate(item.screen);
                    } else {
                      Alert.alert(
                        'Coming Soon',
                        'Exciting updates are on the way! Stay tuned!',
                      );
                    }
                  }}>
                  <View style={styles.iconContainer}>
                    <IconComponent width={32} height={32} />
                  </View>
                  <Text style={styles.name}>{item.name}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1541',
    padding: 16,
  },
  list: {
    marginVertical: 32,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#0B1541',
  },
  iconContainer: {
    width: 72,
    height: 72,
    backgroundColor: '#575B72',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 72,
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
  name: {
    color: '#9E9E9E',
    width: '100%',
    fontFamily: Semibold,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default Dashboard;
