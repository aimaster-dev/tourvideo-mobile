import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CameraDetailScreen = ({ route }) => {
  const { id, camera_name, camera_ip, camera_port, camera_user_name, password, tourplace } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Camera ID: {id}</Text>
      <Text style={styles.label}>Camera Name: {camera_name}</Text>
      <Text style={styles.label}>Camera IP: {camera_ip}</Text>
      <Text style={styles.label}>Camera Port: {camera_port}</Text>
      <Text style={styles.label}>Username: {camera_user_name}</Text>
      <Text style={styles.label}>Password: {password}</Text>
      <Text style={styles.label}>Tour Place: {tourplace}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0B1541',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
  },
});

export default CameraDetailScreen;
