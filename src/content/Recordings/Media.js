import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
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
import Entypo from 'react-native-vector-icons/Entypo';
import Modal from 'react-native-modal';
import {useToast} from '../../context/ToastContext';
import Card from './Card';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import Empty from '../../components/Empty';
import RNFetchBlob from 'rn-fetch-blob';

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
          setRecording(data.data.reverse());
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
      const {dirs} = RNFetchBlob.fs;
      const dirToSave =
        Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
      const configfb = {
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          mediaScannable: true,
          title: filename,
          path: `${dirs.DownloadDir}/${filename}`,
        },
        useDownloadManager: true,
        notification: true,
        mediaScannable: true,
        title: filename,
        path: `${dirToSave}/${filename}`,
      };
      const configOptions = Platform.select({
        ios: configfb,
        android: configfb,
      });

      RNFetchBlob.config(configOptions || {})
        .fetch('GET', `${domain}${video_path}`, {})
        .then(res => {
          if (Platform.OS === 'ios') {
            RNFetchBlob.fs.writeFile(configfb.path, res.data, 'base64');
            RNFetchBlob.ios.previewDocument(configfb.path);
          }
          if (Platform.OS === 'android') {
            console.log('file downloaded');
            showToast(`${filename} video saved successfully`, 'success');
          }
        })
        .catch(e => {
          showToast(`${filename} failed to save`, 'error');
        });
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
        showToast('Snapshot deleted successfully', 'success');
      }
    } catch (e) {
      console.log(e, 'error in deleting snapshots');
      showToast('Error while deleting snapshot', 'error');
    }
  };

  const deleteRecording = async id => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.error('No access token found');
        return;
      }
      const formData = new FormData();
      formData.append('video_id', id);
      const {data} = await api.post('/video/video/delete', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (data.data) {
        setIsVisible(false);
        await fetchRecordedVideos();
        showToast('Recording deleted successfully', 'success');
      }
    } catch (e) {
      console.log(e, 'error in deleting snapshots');
      showToast('Error while deleting recording', 'error');
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
      } else if (selectedRecordingOption === 'Videos') {
        setIsVisible(false);
        await deleteRecording(selectedRecording?.id);
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
            // numColumns={2}
            style={styles.list}
            ListEmptyComponent={() => <Empty />}
            renderItem={({item, index}) => {
              return (
                <Card
                  thumbnail={`${domain}/${item?.thumbnail}`}
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
              style={styles.list}
              ListEmptyComponent={() => <Empty />}
              renderItem={({item, index}) => {
                return (
                  <Card
                    thumbnail={`${domain}/${item?.image_path}`}
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
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <></>
      )}

      <Modal isVisible={isVisible} onBackdropPress={() => setIsVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.innerContainer}>
            <FlatList
              data={RecordingMenuOptions}
              ItemSeparatorComponent={() => <View style={styles.borderLine} />}
              renderItem={({item}) => (
                <TouchableOpacity
                  onPress={() => handleAction(item)}
                  style={styles.row}>
                  <Entypo name={item.icon} size={24} />
                  <View style={styles.modalContent}>
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
