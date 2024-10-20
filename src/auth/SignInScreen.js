import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignInScreen = ({ navigation }) => {
    const [selectedPlace, setSelectedPlace] = useState(null); // To store the full selected place object
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tourPlaces, setTourPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); // To handle the submit loading state

    // Fetch the tour places from the API
    useEffect(() => {
      const fetchTourPlaces = async () => {
        try {
          const response = await axios.get('https://api.emmysvideos.com/api/v1/tourplace/getall');
          setTourPlaces(response.data.data || []);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching tour places:', error);
          setLoading(false);
        }
      };

      fetchTourPlaces();
    }, []);

    const handlePlaceChange = (itemValue) => {
      const selected = tourPlaces.find((place) => place.id === itemValue);
      setSelectedPlace(selected);
    };

    const handleSignIn = async () => {
      if (!selectedPlace || !email || !password) {
        Alert.alert('Error', 'Please select a tour place, email, and password.');
        return;
      }

      const requestData = {
        tourplace: selectedPlace.id,
        email: email,
        password: password,
      };
      console.log(requestData);
      setIsSubmitting(true);

      try {
        const response = await axios.post('https://api.emmysvideos.com/api/v1/user/login', requestData, {
          headers: { 'Content-Type': 'application/json' },
        });

        Alert.alert('Success', 'Login successful!');
        console.log(response.data);
        const accessToken = response.data.data.access;
        const refreshToken = response. data.data.refresh;
        await AsyncStorage.setItem('access_token', accessToken);
        await AsyncStorage.setItem('refresh_token', refreshToken);
        navigation.navigate('Home');
      } catch (error) {
        console.error('Login error:', error);
        Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <View style={styles.container}>
        {/* Logo */}
        <Image source={require('../../asset/img/logo.png')} style={styles.logo} resizeMode="contain" />

        {/* Welcome Text */}
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.signinText}>Signin an Account</Text>

        {/* Select Tour Place */}
        {loading ? (
          <ActivityIndicator size="large" color="#287BF3" />
        ) : (
          <View style={styles.inputContainer}>
            <Picker
              selectedValue={selectedPlace ? selectedPlace.id : null}
              style={styles.picker}
              onValueChange={handlePlaceChange}
            >
              <Picker.Item label="Select Tour Place" value={null} />
              {tourPlaces.map((place) => (
                <Picker.Item key={place.id} label={place.place_name} value={place.id} />
              ))}
            </Picker>
          </View>
        )}

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#CCCCCC"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#CCCCCC"
            onChangeText={setPassword}
            value={password}
            secureTextEntry={true}
          />
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleSignIn}
          disabled={isSubmitting} // Disable button while submitting
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.signInButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Signup Link */}
        <Text style={styles.signupText}>
          Don't have an account?{' '}
          <Text onPress={() => navigation.navigate('Signup')} style={styles.signupLink}>
            Signup
          </Text>
        </Text>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#0B1541', // Background color from the design
      paddingHorizontal: 20,
    },
    logo: {
      width: 180,
      height: 118,
      marginBottom: 30,
    },
    welcomeText: {
      color: '#FFFFFF',
      fontSize: 18,
    },
    signinText: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    inputContainer: {
      width: '100%',
      backgroundColor: '#1C2749',
      borderRadius: 10,
      marginBottom: 15,
      paddingHorizontal: 10,
    },
    input: {
      color: '#FFFFFF',
      paddingVertical: 15,
      fontSize: 16,
    },
    picker: {
      color: '#FFFFFF',
    },
    signInButton: {
      width: '100%',
      backgroundColor: '#287BF3', // Blue button from the design
      paddingVertical: 15,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    signInButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    signupText: {
      color: '#FFFFFF',
      marginTop: 20,
    },
    signupLink: {
      color: '#287BF3',
      fontWeight: 'bold',
    },
  });

  export default SignInScreen;
