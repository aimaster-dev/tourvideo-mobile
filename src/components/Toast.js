import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {useToast} from '../context/ToastContext'; // Adjust path as needed

const Toast = () => {
  const {toast} = useToast();
  const bottom = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animate = () => {
    if (toast.show) {
      Animated.sequence([
        Animated.timing(bottom, {
          toValue: 20,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.delay(2000), 
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]).start(() => {
        bottom.setValue(-1000);
        opacity.setValue(1);
      });
    }
  };

  useEffect(() => {
    animate();
  }, [toast.show]);

  if (!toast.show) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom,
          opacity,
          backgroundColor: toast.type === 'error' ? '#FF3333' : '#4BB543',
        },
      ]}>
      <Text style={styles.message}>{toast.message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 10,
    zIndex: 1000,
  },
  message: {
    color: 'white',
    fontSize: 16,
  },
});

export default Toast;
