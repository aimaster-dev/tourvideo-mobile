import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Video from 'react-native-video';

const VideoPlaybackScreen = ({ navigation }) => {
  const videoRef = useRef(null);

  const handleRepeat = () => {
    if (videoRef.current) {
      videoRef.current.seek(0); // Restart the video
    }
  };

  const handleReturnToSignIn = () => {
    navigation.navigate('Signin');
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: 'https://api.emmysvideos.com/media/footers/Emmy_Videos_Footer.mp4' }} // Replace with your actual video URL
        style={styles.video}
        controls
        resizeMode="contain"
        paused={false}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleRepeat} style={styles.button}>
          <Text style={styles.buttonText}>Repeat Video</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReturnToSignIn} style={styles.button}>
          <Text style={styles.buttonText}>Return to Sign-In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1541',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: 300,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#287BF3',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default VideoPlaybackScreen;
