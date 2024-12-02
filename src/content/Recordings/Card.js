import {View, Text, Image, TouchableOpacity, Dimensions} from 'react-native';
import React from 'react';
import Entypo from 'react-native-vector-icons/Entypo';
import {styles} from './styles';

const Card = ({index, item, handlePress = () => {}}) => {
  return (
    <View
      style={[styles.cardContainer, {marginLeft: index % 2 !== 0 ? 10 : 0}]}>
      <View style={styles.thumbnailContainer}>
        <Image
          resizeMode="contain"
          source={{uri: item?.thumbnail}}
          style={styles.image}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.fileName}></Text>
        <TouchableOpacity onPress={handlePress}>
          <Entypo name="dots-three-vertical" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Card;
