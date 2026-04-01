import {View, Text, Image, TouchableOpacity, Dimensions} from 'react-native';
import React from 'react';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {styles} from './styles';
import {useNavigation} from '@react-navigation/native';
import {domain} from '../../hooks/useAPI';

const Card = ({item, index, thumbnail, handlePress = () => {}}) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => {
        if (item.video_path) {
          navigation.navigate('VideoPlayer', {
            streamUrl: `${domain}/${item.video_path}`,
          });
        } else if (item.image_path) {
          navigation.navigate('ImageViewer', {
            image: `${domain}/${item.image_path}`,
          });
        }
      }}
      style={[styles.cardContainer, {marginLeft: index % 2 === 0 ? 0 : 10}]}>
      <View style={styles.thumbnailContainer}>
        <Image
          source={{
            uri: thumbnail ?? 'https://i.ibb.co/sFrjmt8/ic-launcher-round.png',
          }}
          style={styles.image}
        />
        {item.video_path && (
          <FontAwesome
            name="play-circle"
            size={48}
            color="#0075FFE5"
            style={styles.play}
          />
        )}
      </View>
      <View style={styles.contentContainer}>
        <Text numberOfLines={1} style={styles.fileName}></Text>
        <TouchableOpacity onPress={handlePress}>
          <Entypo name="dots-three-vertical" size={24} color="grey" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default Card;
