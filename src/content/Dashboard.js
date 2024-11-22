import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React from 'react';
import Header from '../components/Header';
import {Products} from '../constants/data';
import {Semibold} from '../constants/font';

const Dashboard = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <FlatList
        data={Products}
        contentContainerStyle={styles.list}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        renderItem={({item}) => {
          const IconComponent = item.icon;
          return (
            <TouchableOpacity
              style={styles.box}
              onPress={() => {
                if (item.screen) {
                  navigation.navigate(item.screen);
                } else {
                  Alert.alert(
                    'Coming Soon',
                    'Exciting updates are on the way! Stay tuned!',
                  );
                }
              }}>
              <View style={styles.iconContainer}>
                <IconComponent width={32} height={32} />
              </View>
              <Text style={styles.name}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1541',
    padding: 16,
  },
  list: {
    marginVertical: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    backgroundColor: '#575B72',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 72,
  },
  box: {
    flex: 1,
    margin: 8,
    padding: 16,
    backgroundColor: '#575B721A',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    color: '#9E9E9E',
    width: '100%',
    fontFamily: Semibold,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default Dashboard;
