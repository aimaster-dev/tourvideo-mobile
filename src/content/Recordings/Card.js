import {View, Text, Image, TouchableOpacity, Dimensions} from 'react-native';
import React from 'react';
import Entypo from 'react-native-vector-icons/Entypo';
import {styles} from './styles';
import { domain } from '../../hooks/useAPI';
import moment from 'moment';

const Card = ({index, thumbnail, handlePress = () => {}}) => {
  return (
    <View
      style={[styles.cardContainer]}>
      <View style={styles.thumbnailContainer}>
        <Image
          source={{uri: thumbnail}}
          style={styles.image}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text numberOfLines={1} style={styles.fileName}>1880_Town_{moment().format('MMM_Do_YY_h_mm_a')}.mp4</Text>
        <TouchableOpacity onPress={handlePress}>
          <Entypo name="dots-three-vertical" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Card;
