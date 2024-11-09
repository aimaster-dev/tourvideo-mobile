import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from '@react-native-community/checkbox';

const SignInScreen = ({ navigation }) => {
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tourPlaces, setTourPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTourPlaceValid, setIsTourPlaceValid] = useState(true);
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [isPasswordValid, setIsPasswordValid] = useState(true);
    const [isAccepted, setIsAccepted] = useState(false);
    const [isAcceptedValid, setIsAcceptedValid] = useState(true);

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
      setIsTourPlaceValid(true);
    };

    const handleEmailChange = (value) => {
      setEmail(value);
      if (value) {
        setIsEmailValid(true);
      }
    };

    const handlePasswordChange = (value) => {
      setPassword(value);
      if (value) {
        setIsPasswordValid(true);
      }
    };

    const handleSignIn = async () => {
      if (!selectedPlace) {
        setIsTourPlaceValid(false);
        return;
      } else {
        setIsTourPlaceValid(true);
      }
      if(!email) {
        setIsEmailValid(false);
        return;
      } else {
        setIsEmailValid(true);
      }
      if (!password) {
        setIsPasswordValid(false);
        return;
      } else {
        setIsPasswordValid(true);
      }
      if (!isAccepted) {
        setIsAcceptedValid(false);
        return;
      } else {
        setIsAcceptedValid(true);
      }

      const requestData = {
        tourplace: selectedPlace.id,
        email: email,
        password: password,
      };
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
        navigation.navigate('Home', {
          user_id: response.data.data.user_id,
          usertype: response.data.data.usertype,
        });
      } catch (error) {
        if (error.response && error.response.status === 406){
          const userId = error.response.data.data.user_id;
          Alert.alert('Account not activated', 'Please activate your account.');
          navigation.navigate('OTPCheck', {userId});
        } else {
          console.log('Login error:', JSON.stringify(error.data));
          Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
        }
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
            {!isTourPlaceValid && <Text style={styles.requiredText}>Required*</Text>}
          </View>
        )}

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#CCCCCC"
            onChangeText={handleEmailChange}
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {!isEmailValid && <Text style={styles.requiredText}>Required*</Text>}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#CCCCCC"
            onChangeText={handlePasswordChange}
            value={password}
            secureTextEntry={true}
          />
          {!isPasswordValid && <Text style={styles.requiredText}>Required*</Text>}
        </View>
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={isAccepted}
            onValueChange={setIsAccepted}
            style={styles.checkbox}
            tintColors={{ true: '#F15927', false: '#FFFFFF' }}
          />
          <Text style={styles.checkboxText}>
            By continuing you accept our{' '}
            {/* <Text style={styles.link} onPress={() => navigation.navigate('PrivacyPolicy')}> */}
            <Text style={styles.link}>
              Privacy Policy
            </Text>{' '}
            &{' '}
            {/* <Text style={styles.link} onPress={() => navigation.navigate('TermsOfUse')}> */}
            <Text style={styles.link}>
              Term of Use
            </Text>
          </Text>
        </View>
        {!isAcceptedValid && <Text style={styles.requiredText}>Required*</Text>}
        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleSignIn}
          disabled={isSubmitting}
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
    requiredText: {
      color: 'red',
      fontSize: 12,
      marginTop: 5,
      marginLeft: 5,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 10,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: '#FFFFFF', // Set the default (unchecked) border color to white
      marginRight: 10,
      backgroundColor: 'transparent', // Keep the background transparent when unchecked
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxText: {
      color: '#FFFFFF',
      flex: 1,
      fontSize: 14,
    },
    link: {
      color: '#287BF3',
      fontWeight: 'bold',
    },
  });

  export default SignInScreen;
