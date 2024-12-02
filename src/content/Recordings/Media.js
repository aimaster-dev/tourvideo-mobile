import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Share,
  Platform,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {styles} from './styles';
import {RecordingMenuOptions, RecordingOptions} from '../../constants/data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {domain, useAPI} from '../../hooks/useAPI';
import RNFS from 'react-native-fs';
import {Regular, Semibold} from '../../constants/font';
import Entypo from 'react-native-vector-icons/Entypo';
import Modal from 'react-native-modal';
import {useToast} from '../../context/ToastContext';
import Card from './Card';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import Empty from '../../components/Empty';

const Media = ({}) => {
  const [selectedRecordingOption, setSelectedRecordingOption] = useState(
    RecordingOptions[0].name,
  );
  const [isVisible, setIsVisible] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState({});
  const [recording, setRecording] = useState([]);
  const [snapshot, setSnapshot] = useState([]);
  const [loading, setLoading] = useState(true);

  const api = useAPI();
  const {showToast} = useToast();

  const fetchSnapshots = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        setLoading(false);
        console.error('No access token found');
        return;
      }
      const {data} = await api.get(`/video/snapshot/get`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (data.data) {
        setSnapshot(data.data);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.log(e.response.data, 'error in fetching snapshots');
    }
  };

  const fetchRecordedVideos = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      const user_data = await AsyncStorage.getItem('user_details');
      const parsed_data = JSON.parse(user_data);
      if (!accessToken) {
        setLoading(false);
        console.error('No access token found');
        return;
      }
      if (parsed_data) {
        const formData = new FormData();
        formData.append('tourplace_id', parsed_data.tourplace.toString());
        const {data} = await api.get('video/getall', {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
          },
          params: formData,
        });
        if (data.data) {
          setRecording(data.data);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.log(e, 'error in fetch recorded videos');
    }
  };

  const handleShare = async path => {
    const message = `Hey! \n\nI just came across this amazing ${
      selectedRecordingOption === 'Videos' ? 'Recording' : 'Picture'
    } on Emmy's Videos and couldn't wait to share it with you! \n\n${domain}${path}`;
    await Share.share({
      url:
        Platform.OS == 'android'
          ? `${RNFS.DownloadDirectoryPath}/${path}`
          : null,
      message,
    });
  };

  const handleDownload = async video_path => {
    try {
      const filename = video_path.split('/').pop();
      const downloadResult = await RNFS.downloadFile({
        fromUrl: `${domain}${video_path}`,
        toFile: `${RNFS.DownloadDirectoryPath}/${filename}`,
        progress: res => {
          let progressPercent = (res.bytesWritten / res.contentLength) * 100;
          console.log(progressPercent, 'progress');
        },
      }).promise;
      if (downloadResult.statusCode === 200) {
        console.log(
          'Recording saved at:',
          `${RNFS.DownloadDirectoryPath}${video_path}`,
        );
        showToast(`${filename} video saved successfully`, 'success');
      } else {
        showToast(`Error while downloading ${filename} video`, 'error');
      }
    } catch (e) {
      console.log(e, 'error while downloading');
    }
  };

  const deleteSnapshots = async id => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.error('No access token found');
        return;
      }
      const {data} = await api.post(
        'video/snapshot/delete',
        {
          image_ids: [id],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (data.data) {
        setIsVisible(false);
        await fetchSnapshots();
      }
    } catch (e) {
      console.log(e, 'error in deleting snapshots');
    }
  };

  const handleAction = async item => {
    const path =
      selectedRecordingOption === 'Videos'
        ? selectedRecording.video_path
        : selectedRecordingOption === 'Snapshots'
        ? selectedRecording.image_path
        : null;
    if (item?.title === 'Share') {
      await handleShare(path);
      setIsVisible(false);
    } else if (item?.title == 'Download') {
      setIsVisible(false);
      if (selectedRecordingOption === 'Videos') {
        showToast('Downloading in progress', 'success');
        await handleDownload(path);
      } else if (selectedRecordingOption === 'Snapshots') {
        const filePath = `${
          RNFS.CachesDirectoryPath
        }/${new Date().getTime()}.jpg`;
        const downloadResult = await RNFS.downloadFile({
          fromUrl: `${domain}${path}`,
          toFile: filePath,
          progress: res => {
            let progressPercent = (res.bytesWritten / res.contentLength) * 100;
            console.log(progressPercent, 'progress');
          },
        }).promise;
        await CameraRoll.saveAsset(filePath, {type: 'photo'});
        showToast('Snapshot saved successfully !', 'success');
      }
    } else if (item?.title === 'Delete') {
      if (selectedRecordingOption === 'Snapshots') {
        await deleteSnapshots(selectedRecording?.id);
      }
    }
  };

  useEffect(() => {
    fetchRecordedVideos();
    fetchSnapshots();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        {RecordingOptions.map(item => (
          <TouchableOpacity
            activeOpacity={0.8}
            key={item.id}
            onPress={() => setSelectedRecordingOption(item.name)}
            style={[
              styles.menu,
              {
                backgroundColor:
                  item.name === selectedRecordingOption ? '#0075FFE5' : null,
              },
            ]}>
            <Text style={styles.menuOptions}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {!loading ? (
        selectedRecordingOption === 'Videos' ? (
          <FlatList
            data={recording}
            numColumns={2}
            style={{marginTop: 30}}
            ListEmptyComponent={() => <Empty />}
            renderItem={({item, index}) => {
              return (
                <Card
                  item={item}
                  index={index}
                  handlePress={() => {
                    setSelectedRecording({...selectedRecording, ...item});
                    setIsVisible(true);
                  }}
                />
              );
            }}
            keyExtractor={(_, index) => index.toString()}
          />
        ) : (
          selectedRecordingOption === 'Snapshots' && (
            <FlatList
              data={snapshot}
              numColumns={2}
              style={{marginTop: 30}}
              ListEmptyComponent={() => <Empty />}
              renderItem={({item, index}) => {
                return (
                  <Card
                    item={item}
                    index={index}
                    handlePress={() => {
                      setSelectedRecording({...selectedRecording, ...item});
                      setIsVisible(true);
                    }}
                  />
                );
              }}
              keyExtractor={(_, index) => index.toString()}
            />
          )
        )
      ) : loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <></>
      )}

      <Modal isVisible={isVisible} onBackdropPress={() => setIsVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={{paddingHorizontal: 16, paddingBottom: 10}}>
            <FlatList
              data={RecordingMenuOptions}
              ItemSeparatorComponent={() => <View style={styles.borderLine} />}
              renderItem={({item}) => (
                <TouchableOpacity
                  onPress={() => handleAction(item)}
                  style={styles.row}>
                  <Entypo name={item.icon} size={24} />
                  <View style={{marginHorizontal: 16}}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Media;
