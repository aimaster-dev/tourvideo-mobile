import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import axios from 'axios';
import CheckBox from '@react-native-community/checkbox';

const SignUpScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserNameValid, setIsUserNameValid] = useState(true);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isConformPasswordValid, setIsConformPasswordValid] = useState(true);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isAcceptedValid, setIsAcceptedValid] = useState(true);


  const handleEmailChange = (value) => {
    setEmail(value);
    if (value) {
      setIsEmailValid(true); // Clear validation error when user types in email
    }
  };

  const handleUserNameChange = (value) => {
    setFullName(value);
    if (value) {
      setIsUserNameValid(true); // Clear validation error when user types in user name
    }
  };

  const handlePhoneNumberChange = (value) => {
    setPhoneNumber(value);
    if (value) {
      setIsPhoneNumberValid(true); // Clear validation error when user types in user name
    }
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (value) {
      setIsPasswordValid(true); // Clear validation error when user types in password
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (value) {
      setIsConformPasswordValid(true); // Clear validation error when user types in password
    }
  };

  // Function to handle the signup request
  const handleSignup = async () => {
    // if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
    //   Alert.alert('Error', 'Please fill all fields.');
    //   return;
    // }
    if(!fullName) {
      setIsUserNameValid(false);
      return;
    } else {
      setIsUserNameValid(true);
    }
    if(!email) {
      setIsEmailValid(false);
      return;
    } else {
      setIsEmailValid(true);
    }
    if(!phoneNumber) {
      setIsPhoneNumberValid(false);
      return;
    } else {
      setIsPhoneNumberValid(true);
    }
    if(!password) {
      setIsPasswordValid(false);
      return;
    } else {
      setIsPasswordValid(true);
    }
    if(!confirmPassword) {
      setIsConformPasswordValid(false);
      return;
    } else {
      setIsConformPasswordValid(true);
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (!isAccepted) {
      setIsAcceptedValid(false);
      return;
    } else {
      setIsAcceptedValid(true);
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
      const response = await axios.post('https://api.emmysvideos.com/api/v1/user/phone/register', requestData, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data.status && response.data.data.user_id) {
        const userId = response.data.data.user_id;
        navigation.navigate('OTPCheck', { userId });
      } else {
        Alert.alert('Signup Failed', 'Unexpected response from server. Please try again.');
      }
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
          onChangeText={handleUserNameChange}
          value={fullName}
        />
        {!isUserNameValid && <Text style={styles.requiredText}>Required*</Text>}
      </View>

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

      {/* Phone Number Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#CCCCCC"
          onChangeText={handlePhoneNumberChange}
          value={phoneNumber}
          keyboardType="phone-pad"
        />
        {!isPhoneNumberValid && <Text style={styles.requiredText}>Required*</Text>}
      </View>

      {/* Password Input */}
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

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#CCCCCC"
          onChangeText={handleConfirmPasswordChange}
          value={confirmPassword}
          secureTextEntry={true}
        />
        {!isConformPasswordValid && <Text style={styles.requiredText}>Required*</Text>}
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
  requiredText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
});

export default SignUpScreen;
