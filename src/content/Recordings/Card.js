import {View, Text, Image, TouchableOpacity, Dimensions} from 'react-native';
import React from 'react';
import Entypo from 'react-native-vector-icons/Entypo';
import {Semibold} from '../../constants/font';

const Card = ({index, item, handlePress = () => {}}) => {
  return (
    <View
      style={{
        width: (Dimensions.get('screen').width - 50) / 2,
        marginLeft: index % 2 !== 0 ? 10 : 0,
        backgroundColor: 'white',
        marginBottom: 16,
        padding: 10,
        borderRadius: 10,
      }}>
      <View
        style={{
          height: 150,
          borderRadius: 10,
        }}>
        <Image
          resizeMode="contain"
          source={{uri: item?.thumbnail}}
          style={{width: '100%', height: '100%'}}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          style={{
            fontSize: 16,
            fontFamily: Semibold,
            textTransform: 'capitalize',
            marginVertical: 10,
          }}></Text>
        <TouchableOpacity onPress={handlePress}>
          <Entypo name="dots-three-vertical" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Card;
