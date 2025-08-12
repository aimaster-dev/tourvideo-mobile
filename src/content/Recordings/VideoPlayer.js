import {View, StyleSheet, ActivityIndicator, Dimensions} from 'react-native';
import React, {useState} from 'react';
import Video from 'react-native-video';

const VideoPlayer = ({route}) => {
  const {streamUrl} = route.params ?? {};
  const [loading, setLoading] = useState(true);
  return (
      <View style={styles.container}>
      <View style={styles.videoContainer}>
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="white" />
          </View>
        )}
        <Video
          source={{uri: streamUrl}}
          style={styles.videoPlayer}
          controls
          resizeMode="contain"
          paused={false}
          repeat={true}
          muted={false}
          onLoad={() => console.log('loaded')}
          onProgress={e => {
            // console.log('progress', e);
            if (loading) {
              setLoading(false);
            }
          }}
          onEnd={() => {
            console.log('ended');
            setLoading(false);
          }}
          onError={() => {
            console.log('error');
            setLoading(false);
          }}
          onBuffer={() => {
            console.log('buffering');
            setLoading(true);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: '45%',
    left: '45%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#0B1541',
    // padding: 16,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
});

export default VideoPlayer;
