import {View, Text, StyleSheet, Image} from 'react-native';
import React from 'react';

const ImageViewer = ({route}) => {
  const {image} = route.params ?? {};
  return (
    <View style={styles.container}>
      <Image source={{uri: image}} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
    image: {
        flex: 1,
        resizeMode: 'contain',
    },
});

export default ImageViewer;
