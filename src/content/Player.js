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
import Feather from 'react-native-vector-icons/Feather';
import RNFS from 'react-native-fs';
import {FFmpegKit, FFmpegKitConfig} from 'ffmpeg-kit-react-native';
import {VLCPlayer} from 'react-native-vlc-media-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAPI} from '../hooks/useAPI';
import {Regular} from '../constants/font';
import ViewShot, {captureRef} from 'react-native-view-shot';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {hasAndroidPermission} from '../helper/permission';
import {useToast} from '../context/ToastContext';
import Marker, {ImageFormat, Position} from 'react-native-image-marker';
import {useIsFocused} from '@react-navigation/native';

const Player = ({route, navigation}) => {
  const {cam_id, tourplace_id, stream_url, tourplace, usertype} = route.params;

  const [isRecording, setIsRecording] = useState(false);
  const [isLoadingUpload, setIsLoadingUpload] = useState(false);
  const [recordingLimits, setRecordingLimits] = useState([]);
  const [loadingLimits, setLoadingLimits] = useState(true);
  const [streamUrl, setStreamUrl] = useState(`${stream_url}`);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [recordingStopped, setRecordingStopped] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [buttonStatus, setButtonStatus] = useState('Record');
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(false);
  const [data, setData] = useState([]);

  const currentSessionRef = useRef(null);
  const alertShownRef = useRef(false);

  const api = useAPI();

  const snapShotRef = useRef();

  const focused = useIsFocused();

  const {showToast} = useToast();

  const generateFilePath = () => `${RNFS.DocumentDirectoryPath}/recording.mp4`;

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
    isLoadingUpload || buttonLoading || isVideoLoading || isSnapshotLoading;

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
        `invoice/video-snapshot-count?tourplace=${tourplace_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (response.data.data) {
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
        const defaultCamera = response.data.data.find(
          camera => camera.id === cam_id,
        );
        if (defaultCamera) {
          updateStreamUrl(defaultCamera);
        }
      }
    } catch (error) {
      console.error('Error fetching cameras:', error);
    }
  };

  const updateStreamUrl = camera => {
    setStreamUrl(`${camera?.stream_url}`);
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

  const checkAndroidPermission = async () => {
    try {
      const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
      await PermissionsAndroid.request(permission);
      Promise.resolve();
    } catch (error) {
      Promise.reject(error);
    }
  };

  const takeSnapShot = async () => {
    try {
      if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
        return;
      }
      setIsSnapshotLoading(true);
      const uri = await captureRef(snapShotRef);
      const accessToken = await AsyncStorage.getItem('access_token');
      console.log(accessToken, 'access token');
      if (!accessToken) {
        console.error('No access token found');
        return;
      }
      const {data} = await api.get('user/getprofile', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(data?.data?.isp?.customer_name, 'data in snapshot');
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
      await uploadSnapshots(
        markedImageUri,
        savedSnapshot.node.type,
        savedSnapshot.node.image.filename,
      );
    } catch (e) {
      setIsSnapshotLoading(false);
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
            await fetchRecordingLimits();
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
    setButtonStatus('Uploading');
    try {
      const formData = new FormData();
      console.log(`file://${recordedPath}`);
      console.log(`file://${thumbnailPath}`);
      formData.append('video_path', {
        uri: `file://${recordedPath}`,
        type: 'video/mp4',
        name: 'recording.mp4',
      });
      formData.append('pricing_id', recordingLimits?.price_id ?? '');
      formData.append('venue_id', tourplace_id);
      formData.append('thumbnail', {
        uri: `file://${thumbnailPath}`,
        type: 'image/jpg',
        name: 'output_thumbnail.jpg',
      });
      console.log(
        {
          uri: `file://${thumbnailPath}`,
          type: 'image/jpg',
          name: 'output_thumbnail.jpg',
        },
        'thumbnail',
      );
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.error('No access token found');
        return;
      }
      console.log('Uploading video...', formData);
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
      // await unlinkRecordedFiles(thumbnailPath, recordedPath);
      showToast('Uploading Failed', 'error');
      console.error(error, 'Upload Error:', error.response);
      setButtonStatus('Record');
      setButtonLoading(false);
    }
  };

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
      if (data && data.status) {
        setData(data?.data);
      }
    } catch (e) {
      console.log(e, 'error in profile');
    }
  };

  const handleRecordingPress = async () => {
    console.log(recordingLimits, 'recording limits');
    console.log(data?.has_unlimited_access, 'data?.has_unlimited_access');
    if (usertype === 2) {
      showToast('Only clients are allowed to do recordings', 'error');
    } else if (
      recordingLimits &&
      recordingLimits.video_remaining == 0 &&
      !data?.has_unlimited_access
    ) {
      Alert.alert(
        'Limit Exceeded',
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
    } else if (isRecording) {
      await stopRecording();
    } else if (recordingLimits && recordingLimits.video_remaining > 0) {
      setButtonLoading(true);
      await startRecording();
    } else {
      console.log('not recording...', recordingLimits.video_remaining);
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
      const {data} = await api.post('video/snapshot/add', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(data, 'data');
      await fetchRecordingLimits();
      setIsSnapshotLoading(false);
      showToast('Snapshot saved successfully !', 'success');
    } catch (e) {
      setIsSnapshotLoading(false);
      setButtonLoading(false);
      console.log(e.response.data, 'error in uploading snapshots');
      showToast('Some error occurred in snapshots', 'error');
    }
  };

  const generateThumbnail = async path => {
    const start_time = 3; // Ensure start time is within video duration
    const width = 320;
    const height = 300;

    // Path for the output thumbnail
    const thumbnailPath = `${RNFS.DocumentDirectoryPath}/output_thumbnail.jpg`;

    const thumbnailCommand = `-y -i ${path} -ss 00:00:${start_time} -vframes 1 -s ${width}x${height} -pix_fmt yuv420p -loglevel trace ${thumbnailPath}`;

    await FFmpegKit.executeAsync(thumbnailCommand, async session => {
      const returnCode = await session.getReturnCode();
      const logs = await session.getAllLogs();
      const logMessages = logs.map(log => log.getMessage());

      console.log(logMessages, 'Logs while generating the thumbnail');

      if (returnCode.isValueSuccess()) {
        console.log('Thumbnail generated successfully at:', thumbnailPath);

        try {
          console.log('Thumbnail saved to camera roll successfully');
          // await CameraRoll.saveAsset(thumbnailPath, {
          //   type: 'photo',
          // });
          await uploadVideoToServer(path, thumbnailPath);
        } catch (error) {
          console.error('Failed to save thumbnail:', error);
          showToast('Failed to save thumbnail', 'error');
          return error;
        }
      } else {
        setButtonLoading(false);
        console.error('Thumbnail generation failed. Check logs for details.');
      }
    });
  };

  const addWatermarkToVideo = async videoPath => {
    const watermarkedPath = `${RNFS.DocumentDirectoryPath}/watermarked_video.mp4`;
    const watermarkText = 'My Watermark';

    const watermarkCommand = `-i ${videoPath} -vf drawtext="text='${watermarkText}':x=10:y=H-th-10:fontsize=24:fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2" -codec:a copy ${watermarkedPath}`;

    await FFmpegKit.executeAsync(watermarkCommand, async session => {
      const returnCode = await session.getReturnCode();
      if (returnCode.isValueSuccess()) {
        console.log('Watermark added successfully.');
        // Replace original path
        await RNFS.unlink(videoPath);
        await RNFS.moveFile(watermarkedPath, videoPath);
      } else {
        console.error('Failed to add watermark.');
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
      usertype === 2
        ? 10
        : recordingLimits?.video_remaining
        ? recordingLimits?.record_time
        : 0;
    console.log(recordingLimits, 'usertype');
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

    // const streamUrl = "rtsp://jerry:Milexx9186*@200.105.49.70:554/Streaming/Channels/2301"

    console.log(`Starting recording for ${recordTime} seconds.`);

    const isRTSP = streamUrl.startsWith("rtsp://");
    const transportFlag = isRTSP ? "-rtsp_transport tcp" : "";
    
    const command = `-re ${transportFlag} -i ${streamUrl} -t ${
      recordTime + 4
    } -fflags nobuffer -flags low_delay -c copy ${path}`;

    const session = await FFmpegKit.executeAsync(command, async session => {
      const returnCode = await session.getReturnCode();
      const output = await session.getOutput();
      console.log(returnCode.isValueSuccess, 'return code');
      if (returnCode.isValueSuccess) {
        console.log("if", path)
        await addWatermarkToVideo(path);
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
    fetchRecordingLimits();
  }, [focused]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestPermissions();
    }
    getProfile();
    fetchCameras();

    FFmpegKitConfig.enableLogCallback(log => {
      if (
        log.getMessage().includes('frame=') &&
        !alertShownRef.current &&
        !recordingStopped
      ) {
        alertShownRef.current = true;
        console.log('First frame detected. Recording started.');
        setTimeout(async () => {
          console.log('Time limit reached. Stopping recording...');
          await stopRecording();
        }, (recordingLimits ? recordingLimits?.record_time : 10) * 1000);
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
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 12,
          }}>
          <View
            style={{
              padding: 10,
              backgroundColor: '#1C2749',
              borderRadius: 10,
            }}>
            <Text style={styles.blockText}>Recording Limit Left</Text>
            <Text style={styles.blockSubText}>
              {recordingLimits?.video_remaining}{' '}
            </Text>
          </View>
          <View
            style={{
              padding: 10,
              backgroundColor: '#1C2749',
              borderRadius: 10,
            }}>
            <Text style={styles.blockText}>Snapshot Limit Left</Text>
            <Text style={styles.blockSubText}>
              {recordingLimits?.snapshot_remaining}
            </Text>
          </View>
        </View>
      )}

      {Object.keys(recordingLimits).length > 0 && (
        <>
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
                    // console.log(e, "e")
                    // if (e.currentTime > 0) {
                      setIsVideoLoading(false);
                    // }
                  }}
                  onError={e => console.log('Error:', e)}
                  onBuffering={e => {
                    // console.log('buffering ...');
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
                onPress={async () => {
                  if (
                    Platform.OS === 'android' &&
                    !(await hasAndroidPermission())
                  ) {
                    console.log('No permission to record');
                    return;
                  }
                  handleRecordingPress();
                }}
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
              onPress={async () => {
                if (isRecording) {
                  showToast(
                    "Can't take snapshots while the video is recording",
                    'error',
                  );
                } else if (
                  recordingLimits &&
                  recordingLimits?.snapshot_remaining == 0
                ) {
                  Alert.alert(
                    'Limited Exceeded',
                    'You have exceeded the limit of snapshot. Please upgrade your plan to continue.',
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
                } else {
                  if (Platform.OS === 'android') {
                    await checkAndroidPermission();
                  }
                  takeSnapShot();
                }
              }}
              disabled={restrictRecordingButton}
              activeOpacity={0.8}
              style={styles.snapshotButton}>
              {isSnapshotLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Feather
                  name="camera"
                  size={30}
                  color={restrictRecordingButton ? 'grey' : '#FFFFFF'}
                />
              )}
              <Text style={styles.recordingText}>Snapshot</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
    // marginTop: 10,
    // backgroundColor: '#1C2749',
    // borderRadius: 10,
    // padding: 5,
    // marginHorizontal: 10,
  },
  blockText: {color: '#FFFFFF', fontSize: 15, fontFamily: Regular},
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
  blockSubText: {color: '#FFFFFF', fontSize: 15, fontFamily: Regular},
  recordingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    fontFamily: Regular,
    textAlign: 'center',
  },
});

export default Player;
