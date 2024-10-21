import React, { useState, useEffect } from 'react';
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
  const [isLoadingUpload, setIsLoadingUpload] = useState(false);  // Loading status for video upload
  const streamUrl = `rtsp://${camera_user_name}:${password}@${camera_ip}:${camera_port}`;
  const [recordingStarted, setRecordingStarted] = useState(false);
  const [recordingLimits, setRecordingLimits] = useState([]);
  const [selectedLimit, setSelectedLimit] = useState(null);
  const [loadingLimits, setLoadingLimits] = useState(true);
  let alertShown = false;
  const path = `${RNFS.DownloadDirectoryPath}/recording.mp4`;

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestPermissions();
    }
    fetchRecordingLimits();
  }, []);
  
  console.log(camera_ip, camera_port, tourplace_id);

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
      const response = await axios.get('https://api.emmysvideos.com/api/v1/price/getprice', {
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
    setOutputFilePath(path);
    setRecordingStarted(false);
    alertShown = false;

    console.log(`Starting recording for ${selectedLimit.record_time} seconds.`);

    const command = `-rtsp_transport tcp -i ${streamUrl} -t ${selectedLimit.record_time} -c copy ${path}`;

    // Start the FFmpegKit process
    FFmpegKitConfig.enableLogCallback(log => {
      if (log.getMessage().includes('frame=') && !alertShown) {
        alertShown = true;
        console.log('First frame detected. Recording started.');

        setRecordingStarted(true);
        Alert.alert('Recording started!');

        // Automatically stop recording after record_time seconds from first frame
        console.log(`Will stop recording after ${selectedLimit.record_time * 1000} milliseconds.`);
        setTimeout(async () => {
          console.log('Time limit reached. Stopping recording...');
          await stopRecording();  // Stop the recording
        }, selectedLimit.record_time * 1000);  // Convert record_time to milliseconds
      }
    });

    FFmpegKit.executeAsync(command, async (session) => {
      const returnCode = await session.getReturnCode();
      const output = await session.getOutput();  // Log FFmpeg output
      console.log('FFmpeg output: ', output);
      if (returnCode.isValueSuccess()) {
        Alert.alert('Recording saved at:', path);
      } else {
        console.error('Recording failed:', output);
      }
    });

    setIsRecording(true);
  };

  const stopRecording = async () => {
    console.log('Calling stopRecording...');

    // Always call FFmpegKit.cancel() to stop the recording, regardless of isRecording
    console.log('Calling FFmpegKit.cancel() to stop the recording...');
    FFmpegKit.cancel().then(() => {
      console.log('FFmpegKit session successfully canceled.');

      // Set the flags after FFmpegKit.cancel() completes
      alertShown = false;
      setIsRecording(false);
      setRecordingStarted(false);
      Alert.alert('Recording stopped');

      // Delay the video upload by 2 seconds for safety
      setTimeout(async () => {
        console.log('Starting video upload after 2 seconds delay...');
        setIsLoadingUpload(true);  // Set loading state for upload

        try {
          await uploadVideoToServer(path);
          console.log('Video upload finished.');

          // Remove the recorded file after upload completes
          try {
            await RNFS.unlink(path);
            console.log('Recording file deleted:', path);
          } catch (error) {
            console.error('Error deleting file:', error);
          }

        } catch (uploadError) {
          console.error('Video upload error:', uploadError);
        }

        setIsLoadingUpload(false); // Remove loading state after upload completes
      }, 2000);  // 2-second delay for safety
    }).catch(error => {
      console.error('Error canceling FFmpegKit session:', error);
    });
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
      uri: `file://${videoPath}`,  // Prepend with 'file://' for local file path
      type: 'video/mp4',  // Adjust MIME type if needed
      name: 'recording.mp4',
    });
    formData.append('tourplace_id', tourplace_id.toString());  // The ID from route parameters
    formData.append('pricing_id', selectedLimit ? selectedLimit.id.toString() : '1');  // Pass selected pricing ID

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
      Alert.alert('Video uploaded successfully!');
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
              const selected = recordingLimits.find(limit => limit.id === itemValue);
              setSelectedLimit(selected);
            }}
          >
            <Picker.Item label="Select Recording Time Limit" value={null} />
            {recordingLimits.map((limit) => (
              <Picker.Item
                key={limit.id}
                label={`${limit.title} / $${limit.price} / ${limit.record_time}s / ${limit.record_limit} videos`}
                value={limit.id}
              />
            ))}
          </Picker>
        </View>
      )}

      {/* Video Player */}
      <VLCPlayer
        style={styles.videoPlayer}
        source={{ uri: streamUrl }}
        resizeMode="cover"
      />

      {/* Recording Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.recordButton, !selectedLimit || selectedLimit.record_limit === 0 ? styles.disabledButton : null]}
          onPress={handleRecordingPress}
          disabled={!selectedLimit || selectedLimit.record_limit === 0 || isLoadingUpload}
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
  videoPlayer: {
    flex: 1,
    width: '100%',
    height: '100%',
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
    opacity: 0.5, // Disabled button style
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
