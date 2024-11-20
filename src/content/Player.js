import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, PermissionsAndroid, Alert, Platform, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import RNFS from 'react-native-fs';
import { FFmpegKit, FFmpegKitConfig } from 'ffmpeg-kit-react-native';
import { VLCPlayer } from 'react-native-vlc-media-player';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Player = ({ route }) => {
  const { cam_id, tourplace_id, camera_name, rtsp_url, tourplace, usertype, user_id } = route.params;

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

  const currentSessionRef = useRef(null);
  const alertShownRef = useRef(false);

  const generateFilePath = () => `${RNFS.DownloadDirectoryPath}/recording_${Date.now()}.mp4`;

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestPermissions();
    }
    fetchRecordingLimits();
    fetchCameras();

    FFmpegKitConfig.enableLogCallback(log => {
      if (log.getMessage().includes('frame=') && !alertShownRef.current && !recordingStopped) {
        alertShownRef.current = true;
        console.log('First frame detected. Recording started.');
        setRecordingStarted(true);
        Alert.alert('Recording started!');
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
  }, [selectedLimit]);

  const requestPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Record Audio permission not granted');
      } else {
        console.log('Permissions granted for Android 10+');
      }
    } catch (err) {
      console.warn(err);
    }
  };

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
      const response = await axios.get(`https://api.emmysvideos.com/api/v1/invoice/validlist?tourplace=${tourplace_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
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
      const response = await axios.get(`https://api.emmysvideos.com/api/v1/camera/getall`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (response.data.status) {
        setCameras(response.data.data);
        const defaultCamera = response.data.data.find(camera => camera.id === cam_id);
        if (defaultCamera) {
          setSelectedCamera(defaultCamera.id);
          updateStreamUrl(defaultCamera);
        }
      }
    } catch (error) {
      console.error('Error fetching cameras:', error);
    }
  };

  const updateStreamUrl = (camera) => {
    setStreamUrl(`${camera.rtsp_url}`);
  };

  const startRecording = async () => {
    if (isRecording || currentSessionRef.current) {
      console.log('Another session is running, skipping...');
      return;
    }

    const path = generateFilePath();
    setIsRecording(true);
    setRecordingStopped(false);
    alertShownRef.current = false;
    setButtonLoading(true);

    const recordTime = usertype === 2 ? 10 : (selectedLimit ? selectedLimit.record_time : 0);

    if (recordTime === 0) {
      Alert.alert('Invalid Selection', 'Please select a valid recording option.');
      setButtonLoading(false);
      setIsRecording(false);
      return;
    }

    console.log(`Starting recording for ${recordTime} seconds.`);

    const command = `-re -rtsp_transport tcp -i ${streamUrl} -t ${recordTime + 4} -fflags nobuffer -flags low_delay -c copy ${path}`;

    const session = await FFmpegKit.executeAsync(command, async (session) => {
      const returnCode = await session.getReturnCode();
      const output = await session.getOutput();
      console.log('FFmpeg output: ', output);
      if (returnCode.isValueSuccess()) {
        Alert.alert('Recording saved at:', path);
        handleVideoUpload(path);
      } else {
        console.log('Recording failed:', output);
      }
      setIsRecording(false);
      currentSessionRef.current = null;
    });
    currentSessionRef.current = session;
  };

  const stopRecording = async () => {
    if (!isRecording || !currentSessionRef.current) {
      console.log('No active recording to stop.');
      return;
    }

    console.log('Calling stopRecording...');
    setRecordingStopped(true);

    const session = currentSessionRef.current;
    FFmpegKit.cancel(session).then(() => {
      console.log('FFmpegKit session successfully canceled.');
      currentSessionRef.current = null;
      setIsRecording(false);
    }).catch(error => {
      console.error('Error canceling FFmpegKit session:', error);
    });
  };

  const handleVideoUpload = async (videoPath) => {
    setTimeout(async () => {
      console.log('Starting video upload after 2 seconds delay...');
      setIsLoadingUpload(true);

      try {
        if (!uploadInProgress) {
          setUploadInProgress(true);
          await uploadVideoToServer(videoPath);
          console.log('Video upload finished.');

          try {
            await RNFS.unlink(videoPath);
            console.log('Recording file deleted:', videoPath);
            Alert.alert('Video uploaded successfully!');
          } catch (error) {
            console.error('Error deleting file:', error);
          }
          setUploadInProgress(false);
        }
      } catch (uploadError) {
        console.error('Video upload error:', JSON.stringify(uploadError));
        setUploadInProgress(false);
      }

      setIsLoadingUpload(false);
      setButtonLoading(false);
    }, 2000);
  };

  const uploadVideoToServer = async (videoPath) => {
    const formData = new FormData();
    formData.append('video_path', {
      uri: `file://${videoPath}`,
      type: 'video/mp4',
      name: 'recording.mp4',
    });
    formData.append('tourplace_id', tourplace_id.toString());
    formData.append('pricing_id', selectedLimit ? selectedLimit.price_id.toString() : '1');

    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      if (!accessToken) {
        console.error('No access token found');
        return;
      }
      const response = await axios.post('https://api.emmysvideos.com/api/v1/video/video/add', formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Video uploaded successfully!');
      console.log('Server Response:', response.data);
    } catch (error) {
      Alert.alert('Video upload failed!', error.message);
      console.error('Upload Error:', error);
    }
  };

  const handleRecordingPress = async () => {
    if (isRecording) {
      await stopRecording();
    } else if (selectedLimit && selectedLimit.remain > 0) {
      await startRecording();
    } else if (usertype === 3) {
      Alert.alert('Invalid Selection', 'Please select a valid recording option.');
    } else {
      await startRecording();
    }
  };

  return (
    <View style={styles.container}>
      {loadingLimits ? (
        <ActivityIndicator size="large" color="#FFFFFF" />
      ) : (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedLimit ? selectedLimit.price_id : null}
            style={styles.picker}
            onValueChange={(itemValue) => {
              let selected = recordingLimits.find(limit => limit.price_id === itemValue);
              selected.record_time = 10;
              console.log(selected);
              setSelectedLimit(selected);
            }}
          >
            <Picker.Item label="Select Recording Time Limit" value={null} />
            {recordingLimits.map((limit) => (
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
          selectedValue={selectedCamera}
          style={styles.picker}
          onValueChange={(itemValue) => {
            const selectedCamera = cameras.find(camera => camera.id === itemValue);
            setSelectedCamera(itemValue);
            updateStreamUrl(selectedCamera); // Update the stream URL with the selected camera
          }}
        >
          {cameras.map(camera => (
            <Picker.Item key={camera.id} label={camera.camera_name} value={camera.id} />
          ))}
        </Picker>
      </View>

      <View style={styles.videoContainer}>
        {isVideoLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
        <VLCPlayer
          style={styles.videoPlayer}
          source={{ uri: streamUrl }} // Set VLCPlayer source to dynamic streamUrl
          resizeMode="cover"
          onPlaying={() => setIsVideoLoading(false)}
          onBuffering={() => {
            setIsVideoLoading(true);
            setTimeout(() => {
              setIsVideoLoading(false);
            }, 5000);
          }}
          onStopped={() => setIsVideoLoading(true)}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.recordButton, usertype !== 2 && (!selectedLimit || selectedLimit.remain === 0 || buttonLoading) ? styles.disabledButton : null]}
          onPress={handleRecordingPress}
          disabled={usertype !== 2 && (!selectedLimit || selectedLimit.remain === 0 || isLoadingUpload || buttonLoading)}
        >
          {buttonLoading || isLoadingUpload ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={[styles.innerCircle, isRecording && styles.innerCircleActive]} />
          )}
        </TouchableOpacity>
        <Text style={styles.recordingText}>{isRecording ? 'Recording' : 'Start'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
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
    position: 'absolute',
    bottom: 40,
    left: '50%',
    transform: [{ translateX: -40 }],
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
    textAlign: 'center',
  },
});

export default Player;
