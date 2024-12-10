import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Alert,
  Platform,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Feather from 'react-native-vector-icons/Feather';
import RNFS from 'react-native-fs';
import {FFmpegKit, FFmpegKitConfig} from 'ffmpeg-kit-react-native';
import {VLCPlayer} from 'react-native-vlc-media-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {domain, useAPI} from '../hooks/useAPI';
import {Regular} from '../constants/font';
import ViewShot, {captureRef} from 'react-native-view-shot';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {hasAndroidPermission} from '../helper/permission';
import {useToast} from '../context/ToastContext';
import Marker, {ImageFormat, Position} from 'react-native-image-marker';
import RNFetchBlob from 'rn-fetch-blob';

const Player = ({route}) => {
  const {
    cam_id,
    tourplace_id,
    camera_name,
    rtsp_url,
    tourplace,
    usertype,
    user_id,
  } = route.params;

  const [isRecording, setIsRecording] = useState(false);
  const [isLoadingUpload, setIsLoadingUpload] = useState(false);
  const [recordingStarted, setRecordingStarted] = useState(false);
  const [recordingLimits, setRecordingLimits] = useState([]);
  const [selectedLimit, setSelectedLimit] = useState(null);
  const [loadingLimits, setLoadingLimits] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [streamUrl, setStreamUrl] = useState(`${rtsp_url}`);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [recordingStopped, setRecordingStopped] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [buttonStatus, setButtonStatus] = useState('Record');

  const currentSessionRef = useRef(null);
  const alertShownRef = useRef(false);

  const api = useAPI();

  const snapShotRef = useRef();

  const {showToast} = useToast();

  const generateFilePath = () => `${RNFS.DownloadDirectoryPath}/recording.mp4`;

  const requestPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      } else {
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const restrictRecordingButton =
    usertype !== 2 &&
    (!selectedLimit ||
      selectedLimit.videoremain === 0 ||
      isLoadingUpload ||
      buttonLoading);

  const fetchRecordingLimits = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.error('No access token found');
        return;
      }
      if (usertype === 2) {
        setLoadingLimits(false);
        return;
      }
      const response = await api.get(
        `invoice/validlist?tourplace=${tourplace_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (response.data.status) {
        setRecordingLimits(response.data.data);
        setLoadingLimits(false);
      }
    } catch (error) {
      console.error('Error fetching recording limits:', error);
      setLoadingLimits(false);
    }
  };

  const fetchCameras = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.error('No access token found');
        return;
      }
      const response = await api.get(`camera/getall`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.data.status) {
        setCameras(response.data.data);
        const defaultCamera = response.data.data.find(
          camera => camera.id === cam_id,
        );
        if (defaultCamera) {
          setSelectedCamera(defaultCamera.id);
          updateStreamUrl(defaultCamera);
        }
      }
    } catch (error) {
      console.error('Error fetching cameras:', error);
    }
  };

  const updateStreamUrl = camera => {
    setStreamUrl(`${camera?.rtsp_url}`);
  };

  const stopRecording = async () => {
    if (!isRecording || !currentSessionRef.current) {
      console.log('No active recording to stop.');
      return;
    }

    console.log('Calling stopRecording...');
    setRecordingStopped(true);

    const session = currentSessionRef.current;
    FFmpegKit.cancel(session)
      .then(() => {
        console.log('FFmpegKit session successfully canceled.');
        currentSessionRef.current = null;
        setIsRecording(false);
      })
      .catch(error => {
        console.error('Error canceling FFmpegKit session:', error);
      });
  };

  const takeSnapShot = async () => {
    try {
      if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
        return;
      }
      const uri = await captureRef(snapShotRef);
      const options = {
        // background image
        backgroundImage: {
          src: uri,
          scale: 1,
        },
        watermarkTexts: [
          {
            text: tourplace,
            position: {
              position: Position.center,
            },
            style: {
              color: '#FFFFFF',
              fontSize: 56,
              fontFamily: Regular,
              shadowStyle: {
                dx: 10,
                dy: 10,
                radius: 10,
                color: '#6450B0',
              },
            },
          },
        ],
        scale: 1,
        quality: 100,
        filename: 'test',
        saveFormat: ImageFormat.png,
      };
      const markedImageUri = await Marker.markText(options);
      const savedSnapshot = await CameraRoll.saveAsset(markedImageUri, {
        type: 'photo',
      });
      showToast('Snapshot saved successfully !', 'success');
      await uploadSnapshots(
        markedImageUri,
        savedSnapshot.node.type,
        savedSnapshot.node.image.filename,
      );
    } catch (e) {
      console.log(e, 'error while taking snapshots ...');
      showToast('Some error occurred', 'error');
    }
  };

  const unlinkRecordedFiles = async (thumbnail, recorded) => {
    setTimeout(async () => {
      console.log('Starting video upload after 2 seconds delay...');
      setIsLoadingUpload(true);

      try {
        if (!uploadInProgress) {
          setUploadInProgress(true);
          console.log('Video upload finished.');
          try {
            await RNFS.unlink(thumbnail);
            await RNFS.unlink(recorded);
            showToast('Video recorded successfully', 'success');
          } catch (error) {
            console.error('Error deleting file:', error);
          }
          setUploadInProgress(false);
        }
      } catch (uploadError) {
        console.error('Video upload error:', JSON.stringify(uploadError));
        showToast('Video recorded failed', 'error');
        setUploadInProgress(false);
        setButtonStatus('Record');
      }
      setButtonStatus('Record');
      setIsLoadingUpload(false);
      setButtonLoading(false);
    }, 2000);
  };

  const uploadVideoToServer = async (recordedPath, thumbnailPath) => {
    console.log('should call uploading ....', recordedPath, thumbnailPath);
    setButtonStatus('Uploading');
    try {
      const formData = new FormData();
      formData.append('video_path', {
        uri: `file://${recordedPath}`,
        type: 'video/mp4',
        name: 'recording.mp4',
      });
      formData.append('pricing_id', selectedLimit.price_id);
      formData.append('tourplace_id', tourplace_id);
      formData.append('thumbnail', {
        uri: `file://${thumbnailPath}`,
        type: 'image/jpg',
        name: 'output_thumbnail.jpg',
      });
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.error('No access token found');
        return;
      }
      const response = await api.post('video/video/add', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Video uploaded successfully!');
      console.log('Server Response:', response.data.data.video_path);
      if (response.data) {
        await unlinkRecordedFiles(thumbnailPath, recordedPath);
      }
    } catch (error) {
      showToast('Uploading Failed', 'error');
      console.error('Upload Error:', error);
      setButtonStatus('Record');
      setButtonLoading(false);
    }
  };

  const handleRecordingPress = async () => {
    if (isRecording) {
      await stopRecording();
    } else if (selectedLimit) {
      if (selectedLimit.videoremain > 0) {
        setButtonLoading(true);
        await startRecording();
      } else {
        showToast('You have reached your recording limit.', 'error');
      }
    }
  };

  const uploadSnapshots = async (imagepath, type, name) => {
    try {
      const formData = new FormData();
      formData.append('image_path', {
        uri: `file://${imagepath}`,
        type,
        name,
      });
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.error('No access token found');
        return;
      }
      await api.post('video/snapshot/add', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (e) {
      setButtonLoading(false);
      console.log(e, 'error in uploading snapshots');
      showToast('Some error occurred in snapshots', 'error');
    }
  };

  const generateThumbnail = async path => {
    const start_time = 3; // Ensure start time is within video duration
    const width = 320;
    const height = 300;

    // Path for the output thumbnail
    const thumbnailPath = `${RNFS.DownloadDirectoryPath}/output_thumbnail.jpg`;

    const thumbnailCommand = `-i ${path} -ss 00:00:${start_time} -vframes 1 -s ${width}x${height} -pix_fmt yuv420p -loglevel trace ${thumbnailPath}`;

    await FFmpegKit.executeAsync(thumbnailCommand, async session => {
      const returnCode = await session.getReturnCode();
      const logs = await session.getAllLogs();
      const logMessages = logs.map(log => log.getMessage());

      console.log(logMessages, 'Logs while generating the thumbnail');

      if (returnCode.isValueSuccess()) {
        console.log('Thumbnail generated successfully at:', thumbnailPath);

        try {
          console.log('Thumbnail saved to camera roll successfully');
          await CameraRoll.saveAsset(thumbnailPath, {
            type: 'photo',
          });
          await uploadVideoToServer(path, thumbnailPath);
        } catch (error) {
          console.error('Failed to save thumbnail:', error);
          return error;
        }
      } else {
        setButtonLoading(false);
        console.error('Thumbnail generation failed. Check logs for details.');
      }
    });
  };

  const startRecording = async () => {
    if (isRecording || currentSessionRef.current) {
      console.log('Another session is running, skipping...');
      return;
    }

    const path = generateFilePath();
    setIsRecording(true);
    setButtonStatus('Recording');
    setRecordingStopped(false);
    alertShownRef.current = false;

    const recordTime =
      usertype === 2 ? 10 : selectedLimit ? selectedLimit.record_time : 0;

    if (recordTime === 0) {
      Alert.alert(
        'Invalid Selection',
        'Please select a valid recording option.',
      );
      setButtonLoading(false);
      setIsRecording(false);
      setButtonStatus('Record');
      return;
    }

    console.log(`Starting recording for ${recordTime} seconds.`);

    const command = `-re -rtsp_transport tcp -i ${streamUrl} -t ${
      recordTime + 4
    } -fflags nobuffer -flags low_delay -c copy ${path}`;

    const session = await FFmpegKit.executeAsync(command, async session => {
      const returnCode = await session.getReturnCode();
      const output = await session.getOutput();
      console.log(returnCode, 'return code');
      if (returnCode.isValueSuccess) {
        // const outputPath = `${
        //   RNFS.DownloadDirectoryPath
        // }/recording_${Date.now()}.mp4`;
        await generateThumbnail(path);
      } else {
        console.log('Recording failed:', output);
        setButtonLoading(false);
      }
      setIsRecording(false);
      currentSessionRef.current = null;
    });
    currentSessionRef.current = session;
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestPermissions();
    }
    fetchRecordingLimits();
    fetchCameras();

    FFmpegKitConfig.enableLogCallback(log => {
      if (
        log.getMessage().includes('frame=') &&
        !alertShownRef.current &&
        !recordingStopped
      ) {
        alertShownRef.current = true;
        console.log('First frame detected. Recording started.');
        setRecordingStarted(true);
        setTimeout(async () => {
          console.log('Time limit reached. Stopping recording...');
          await stopRecording();
        }, (selectedLimit ? selectedLimit.record_time : 10) * 1000);
      }
    });

    return () => {
      alertShownRef.current = false;
      setRecordingStopped(true);
    };
  }, []);

  return (
    <View style={styles.container}>
      {loadingLimits ? (
        <ActivityIndicator size="large" color="#FFFFFF" />
      ) : (
        <View style={styles.pickerContainer}>
          <Picker
            itemStyle={styles.picker}
            selectedValue={selectedLimit ? selectedLimit.price_id : null}
            style={styles.picker}
            onValueChange={itemValue => {
              let selected = recordingLimits.find(
                limit => limit.price_id === itemValue,
              );
              if (selected) {
                selected.record_time = 10;
                console.log(selected, 'selected');
                setSelectedLimit(selected);
              }
            }}>
            <Picker.Item label="Select Recording Time Limit" value={null} />
            {recordingLimits.map(limit => (
              <Picker.Item
                key={limit.price_id}
                label={`${limit.comment} / ${limit.remain} videos remain`}
                value={limit.price_id}
              />
            ))}
          </Picker>
        </View>
      )}

      <View style={styles.pickerContainer}>
        <Picker
          itemStyle={styles.picker}
          selectedValue={selectedCamera}
          style={styles.picker}
          onValueChange={itemValue => {
            const selectedCamera = cameras.find(
              camera => camera.id === itemValue,
            );
            setSelectedCamera(itemValue);
            updateStreamUrl(selectedCamera); // Update the stream URL with the selected camera
          }}>
          {cameras.map(camera => (
            <Picker.Item
              key={camera.id}
              label={camera.camera_name}
              value={camera.id}
            />
          ))}
        </Picker>
      </View>
      <ViewShot ref={snapShotRef} style={styles.flex}>
        <View style={styles.videoContainer}>
          {isVideoLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}
          {streamUrl && (
            <VLCPlayer
              style={styles.videoPlayer}
              source={{
                uri: streamUrl,
              }}
              onLoad={() => {
                console.log('loading ...');
                setIsVideoLoading(true);
              }}
              autoplay={true}
              onProgress={e => {
                if (e.currentTime > 0) {
                  setIsVideoLoading(false);
                }
              }}
              onError={e => console.log('Error:', e)}
              onBuffering={e => {
                console.log('buffering ...');
                setIsVideoLoading(true);
              }}
              onStopped={() => {
                setIsVideoLoading(false);
              }}
            />
          )}
        </View>
      </ViewShot>

      <View style={styles.actionContainer}>
        <View style={styles.actionSpacing} />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              restrictRecordingButton ? styles.disabledButton : null,
            ]}
            onPress={handleRecordingPress}
            disabled={restrictRecordingButton}>
            {buttonLoading || isLoadingUpload ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View
                style={[
                  styles.innerCircle,
                  isRecording && styles.innerCircleActive,
                ]}
              />
            )}
          </TouchableOpacity>
          <Text style={styles.recordingText}>{buttonStatus}</Text>
        </View>
        <TouchableOpacity
          onPress={() => takeSnapShot()}
          disabled={
            isRecording ||
            restrictRecordingButton ||
            selectedLimit?.snapshotremain <= 0
          }
          activeOpacity={0.8}
          style={styles.snapshotButton}>
          <Feather
            name="camera"
            color={isRecording || restrictRecordingButton ? 'grey' : 'white'}
            size={32}
          />
          <Text style={styles.recordingText}>Snapshot</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  snapshotButton: {alignItems: 'center'},
  flex: {flex: 1},
  pickerContainer: {
    marginTop: 10,
    backgroundColor: '#1C2749',
    borderRadius: 10,
    padding: 5,
    marginHorizontal: 10,
  },
  picker: {
    color: '#FFFFFF',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
    marginBottom: 16,
  },
  actionSpacing: {width: 48},
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
  },
  innerCircleActive: {
    backgroundColor: 'red',
  },
  recordingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    fontFamily: Regular,
    textAlign: 'center',
  },
});

export default Player;
