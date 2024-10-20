import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, PermissionsAndroid, Alert, Platform, Dimensions } from 'react-native';
import RNFS from 'react-native-fs';
import { FFmpegKit, FFmpegKitConfig } from 'ffmpeg-kit-react-native';
import { VLCPlayer } from 'react-native-vlc-media-player';

const Player = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [outputFilePath, setOutputFilePath] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false); // Fullscreen toggle
  const streamUrl = 'rtsp://admin:Korgi123@70.41.96.204:554'; // Your RTSP stream
  const [recordingStarted, setRecordingStarted] = useState(false);
  let alertShown = false;

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestPermissions();
    }
  }, []);

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

  const startRecording = async () => {
    const path = `${RNFS.DownloadDirectoryPath}/recording.mp4`;
    setOutputFilePath(path);
    setRecordingStarted(false);
    alertShown = false;
    // FFmpeg command to record the stream
    // const command = `-analyzeduration 50000000 -probesize 50000000 -i rtsp://admin:Korgi123@70.41.96.204:554 -c:v libx264 -c:a aac -b:a 128k `;
    const command = `-rtsp_transport tcp -analyzeduration 5000000 -probesize 5000000 -f rtsp -i rtsp://admin:Korgi123@70.41.96.204:554 -s 2560x1920 -r 20 -c:v h264 -c:a aac -b:a 128k -f mp4 ${path}`;
    // Execute FFmpegKit command to record the stream
    // FFmpegKit.executeAsync(command, async (session) => {
    //   const returnCode = await session.getReturnCode();
    //   const output = await session.getOutput();  // Log FFmpeg output
    //   console.log('FFmpeg output: ', output);
    //   if (returnCode.isValueSuccess()) {
    //     Alert.alert('Recording saved at:', path);
    //   } else {
    //     Alert.alert('Recording failed', output);  // Show the output in the alert
    //   }
    // });
    FFmpegKitConfig.enableLogCallback(log => {
      // Look for the frame log to determine when recording starts
      if (log.getMessage().includes('frame=') && !alertShown) {
        alertShown = true;
        console.log(recordingStarted);
        setRecordingStarted(true);
        Alert.alert('Recording started!');
      }
    });
    FFmpegKit.executeAsync(command, async (session) => {
      const returnCode = await session.getReturnCode();
      const output = await session.getOutput();  // Log FFmpeg output
      console.log('FFmpeg output: ', output);
      if (returnCode.isValueSuccess()) {
        Alert.alert('Recording saved at:', path);
      } else {
        Alert.alert('Recording failed', output);  // Show the output in the alert
      }
    });
    setIsRecording(true);
  };

  const stopRecording = async () => {
    if (isRecording) {
      FFmpegKit.cancel().then(() => {
        alertShown = false;
        setIsRecording(false);
        setRecordingStarted(false);
        Alert.alert('Recording stopped');
      });
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={styles.container}>
      <View style={isFullScreen ? { width: screenWidth, height: screenHeight } : styles.videoContainer}>
        {/* VLCPlayer to display the video stream */}
        <VLCPlayer
          style={{ flex: 1 }} // Fill the container
          source={{ uri: streamUrl }}
          resizeMode="fill" // Ensure video covers the view
          videoAspectRatio="16:9"
        />
        <View style={styles.buttonContainer}>
          <Button
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
            onPress={isRecording ? stopRecording : startRecording}
          />
          <Button
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            onPress={toggleFullScreen}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10, // Adjust this value to control the button position
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Player;
