import {View, Text, TouchableOpacity, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import {styles} from './styles';
import {RecordingOptions} from '../../constants/data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAPI} from '../../hooks/useAPI';
import RNFS from 'react-native-fs';

const Media = ({route}) => {
  const [selectedPaymentOption, setSelectedPaymentOption] = useState(
    RecordingOptions[0].name,
  );

  const api = useAPI();

  const fetchRecordedVideos = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      const user_data = await AsyncStorage.getItem('user_details');
      const parsed_data = JSON.parse(user_data);
      if (!accessToken) {
        console.error('No access token found');
        return;
      }
      if (parsed_data) {
        const formData = new FormData();
        formData.append('tourplace_id', parsed_data.tourplace.toString());
        console.log(accessToken);
        const {data} = await api.get('video/getall', {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
          },
          params: formData,
        });
        console.log(data, 'data');
      }
    } catch (e) {
      console.log(e.response.data, 'error in fetch recorded videos');
    }
  };

  useEffect(() => {
    fetchRecordedVideos();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        {RecordingOptions.map(item => (
          <TouchableOpacity
            activeOpacity={0.8}
            key={item.id}
            onPress={() => setSelectedPaymentOption(item.name)}
            style={[
              styles.menu,
              {
                backgroundColor:
                  item.name === selectedPaymentOption ? '#0075FFE5' : null,
              },
            ]}>
            <Text style={styles.menuOptions}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Media;
