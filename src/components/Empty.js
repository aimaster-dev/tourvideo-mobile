import {View, Text, Image, StyleSheet} from 'react-native';
import React from 'react';
import {Semibold} from '../constants/font';

const Empty = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../asset/img/Empty.png')}
        resizeMode="contain"
        style={styles.image}
      />
      <Text style={styles.text}>No data available</Text>
    </View>
  );
};

export default Empty;

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  image: {width: 300, height: 300},
  text: {
    fontSize: 26,
    fontFamily: Semibold,
    textTransform: 'capitalize',
    color: 'white',
  },
});
