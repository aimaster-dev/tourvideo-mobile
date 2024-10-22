import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, PermissionsAndroid, Alert, Platform, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import RNFS from 'react-native-fs';
import { FFmpegKit, FFmpegKitConfig } from 'ffmpeg-kit-react-native';
import { VLCPlayer } from 'react-native-vlc-media-player';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Player = ({ route }) => {
  const { tourplace_id, camera_name, camera_ip, camera_port, camera_user_name, password, tourplace } = route.params;

  const [isRecording, setIsRecording] = useState(false);
  const [outputFilePath, setOutputFilePath] = useState('');
  const [isLoadingUpload, setIsLoadingUpload] = useState(false);
  const [recordingStarted, setRecordingStarted] = useState(false);
  const [recordingLimits, setRecordingLimits] = useState([]);
  const [selectedLimit, setSelectedLimit] = useState(null);
  const [loadingLimits, setLoadingLimits] = useState(true);
  const streamUrl = `rtsp://${camera_user_name}:${password}@${camera_ip}:${camera_port}`;
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [recordingStopped, setRecordingStopped] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  // To track the session reference
  const currentSessionRef = useRef(null);

  const path = `${RNFS.DownloadDirectoryPath}/recording_${Date.now()}.mp4`;  // Unique filename

  let alertShown = false;

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestPermissions();
    }
    fetchRecordingLimits();

    // Setup FFmpeg log callback once
    FFmpegKitConfig.enableLogCallback(log => {
      if (log.getMessage().includes('frame=') && !alertShown && !recordingStopped) {
        alertShown = true;
        console.log('First frame detected. Recording started.');
        setRecordingStarted(true);
        Alert.alert('Recording started!');

        // Automatically stop recording after record_time seconds from first frame
        console.log(`Will stop recording after ${selectedLimit.record_time * 1000} milliseconds.`);
        setTimeout(async () => {
          console.log('Time limit reached. Stopping recording...');
          await stopRecording();  // Stop the recording
        }, (selectedLimit.record_time + 4) * 1000);  // Convert record_time to milliseconds
      }
    });

    return () => {
      // Cleanup: Prevent log callback from continuing after unmount
      alertShown = false;
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

  const startRecording = async () => {
    if (isRecording || currentSessionRef.current) {
      console.log('Another session is running, skipping...');
      return;
    }

    setIsRecording(true);
    setRecordingStopped(false);

    console.log(`Starting recording for ${selectedLimit.record_time} seconds.`);

    const command = `-re -rtsp_transport tcp -i ${streamUrl} -t ${selectedLimit.record_time + 4} -fflags nobuffer -flags low_delay -c copy ${path}`;

    // eslint-disable-next-line no-shadow
    const session = await FFmpegKit.executeAsync(command, async (session) => {
      const returnCode = await session.getReturnCode();
      const output = await session.getOutput();
      console.log('FFmpeg output: ', output);
      if (returnCode.isValueSuccess()) {
        Alert.alert('Recording saved at:', path);
        handleVideoUpload();
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

      handleVideoUpload();
    }).catch(error => {
      console.error('Error canceling FFmpegKit session:', error);
    });
  };

  const handleVideoUpload = async () => {
    // Delay the video upload by 2 seconds for safety
    setTimeout(async () => {
      console.log('Starting video upload after 2 seconds delay...');
      setIsLoadingUpload(true);

      try {
        if (!uploadInProgress) {
          setUploadInProgress(true);
          await uploadVideoToServer(path);
          console.log('Video upload finished.');

          // Remove the recorded file after upload completes
          try {
            await RNFS.unlink(path);
            console.log('Recording file deleted:', path);
            Alert.alert('Video uploaded successfully!');
          } catch (error) {
            console.error('Error deleting file:', error);
          }
          setUploadInProgress(false);
        }
      } catch (uploadError) {
        console.error('Video upload error:', uploadError);
        setUploadInProgress(false);
      }

      setIsLoadingUpload(false);
    }, 2000);
  };

  const handleRecordingPress = async () => {
    if (isRecording) {
      await stopRecording();
    } else if (selectedLimit && selectedLimit.record_limit > 0) {
      await startRecording();
    } else {
      Alert.alert('Invalid Selection', 'Please select a valid recording option.');
    }
  };

  const uploadVideoToServer = async (videoPath) => {
    const formData = new FormData();
    formData.append('video_path', {
      uri: `file://${videoPath}`,
      type: 'video/mp4',
      name: 'recording.mp4',
    });
    formData.append('tourplace_id', tourplace_id.toString());
    formData.append('pricing_id', selectedLimit ? selectedLimit.id.toString() : '1');

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

  return (
    <View style={styles.container}>
      {/* Recording Time Limit Picker */}
      {loadingLimits ? (
        <ActivityIndicator size="large" color="#FFFFFF" />
      ) : (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedLimit ? selectedLimit.id : null}
            style={styles.picker}
            onValueChange={(itemValue) => {
              const selected = recordingLimits.find(limit => limit.price_id === itemValue);
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

      {/* Video Player with loading indicator */}
      <View style={styles.videoContainer}>
        {isVideoLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
        <VLCPlayer
          style={styles.videoPlayer}
          source={{ uri: streamUrl }}
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

      {/* Recording Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.recordButton, !selectedLimit || selectedLimit.remain === 0 ? styles.disabledButton : null]}
          onPress={handleRecordingPress}
          disabled={!selectedLimit || selectedLimit.remain === 0 || isLoadingUpload}
        >
          {isLoadingUpload ? (
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
    position: 'absolute',
    top: 20,
    left: 10,
    right: 10,
    zIndex: 2,
    backgroundColor: '#1C2749',
    borderRadius: 10,
    padding: 5,
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
    zIndex: 1, // Ensure it's on top of the player
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: to dim the background during loading
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
