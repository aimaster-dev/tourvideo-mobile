import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import axios from 'axios';

const SignUpScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to handle the signup request
  const handleSignup = async () => {
    // Validation: Check if all fields are filled and passwords match
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    const requestData = {
      username: fullName,
      email: email,
      phone_number: phoneNumber,
      password: password,
      usertype: 3,
      level: 0,
    };

    setIsSubmitting(true); // Set submitting state to true while making the request

    try {
      const response = await axios.post('https://api.emmysvideos.com/api/v1/user/register', requestData, {
        headers: { 'Content-Type': 'application/json' },
      });

      Alert.alert('Success', 'Account created successfully!');
      console.log(response.data);
      navigation.navigate('Signin');
    } catch (error) {
        if (error.response) {
            const errorData = error.response.data;
            // Extract the error message from the response
            let errorMessage = '';
            if (errorData.data && errorData.data.email) {
              errorMessage = errorData.data.email.join(' '); // Join the array of error messages (if there are multiple)
            } else {
              errorMessage = 'Error creating account. Please check your input.';
            }
            console.log('Signup error response:', errorData);
            Alert.alert('Signup Failed', errorMessage);
          } else {
            console.log('Signup error:', error.message);
            Alert.alert('Signup Failed', 'An unknown error occurred.');
          }
    } finally {
      setIsSubmitting(false); // Set submitting state to false after request is complete
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../../asset/img/logo.png')} style={styles.logo} resizeMode="contain" />

      {/* Welcome Text */}
      <Text style={styles.welcomeText}>Hey there,</Text>
      <Text style={styles.createAccountText}>Create an Account</Text>

      {/* Full Name Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#CCCCCC"
          onChangeText={setFullName}
          value={fullName}
        />
      </View>

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

      {/* Phone Number Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#CCCCCC"
          onChangeText={setPhoneNumber}
          value={phoneNumber}
          keyboardType="phone-pad"
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

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#CCCCCC"
          onChangeText={setConfirmPassword}
          value={confirmPassword}
          secureTextEntry={true}
        />
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={styles.signUpButton}
        onPress={handleSignup}
        disabled={isSubmitting} // Disable button while submitting
      >
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Login Link */}
      <Text style={styles.loginText}>
        Already have an account?{' '}
        <Text onPress={() => navigation.navigate('Signin')} style={styles.loginLink}>
          Login
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
    marginBottom: 10,
  },
  createAccountText: {
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
  signUpButton: {
    width: '100%',
    backgroundColor: '#287BF3', // Blue button from the design
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    color: '#FFFFFF',
    marginTop: 20,
  },
  loginLink: {
    color: '#287BF3',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;