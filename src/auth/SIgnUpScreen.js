import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Feather from "react-native-vector-icons/Feather"
import CheckBox from '@react-native-community/checkbox';
import {useAPI} from '../hooks/useAPI';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Toast from '../components/Toast';
import {useToast} from '../context/ToastContext';
import {Picker} from '@react-native-picker/picker';

const SignUpScreen = ({navigation}) => {
  const [selectedPlace, setSelectedPlace] = useState(null);
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
  const [isTourPlaceValid, setIsTourPlaceValid] = useState(true);
  const [tourPlaces, setTourPlaces] = useState([]);
  const [isp, setIsp] = useState([]);
    const [isIspValid, setIsIspValid] = useState(true);
  const [selectedISP, setSelectedISP] = useState(null);
  const [isAcceptedValid, setIsAcceptedValid] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: '',
  });
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {showToast} = useToast();

  const api = useAPI();

  const handleEmailChange = value => {
    setEmail(value);
    if (value) {
      setIsEmailValid(true); // Clear validation error when user types in email
    }
  };

  const handlePlaceChange = itemValue => {
    setIsp([]);
    const selected = tourPlaces.find(place => place.id == itemValue);
    console.log(selected.id, 'selected', itemValue);
    if (selected?.id) {
      fetchISP(selected);
    } else {
      setIsIspValid(false);
    }
    setSelectedPlace(selected);
    setIsTourPlaceValid(true);
  };

  const handleUserNameChange = value => {
    setFullName(value);
    if (value) {
      setIsUserNameValid(true); // Clear validation error when user types in user name
    }
  };

  const handlePhoneNumberChange = value => {
    setPhoneNumber(value);
    if (value) {
      setIsPhoneNumberValid(true); // Clear validation error when user types in user name
    }
  };

    const handleISPChange = (itemValue) => {
    const selected = isp?.isps?.find(place => place.id == itemValue);
    setSelectedISP(selected);
    setIsIspValid(true);
  };

  const handlePasswordChange = value => {
    setPassword(value);
    if (value) {
      setIsPasswordValid(true); // Clear validation error when user types in password
    }
  };

  const handleConfirmPasswordChange = value => {
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
    if (!fullName) {
      setIsUserNameValid(false);
      return;
    } else {
      setIsUserNameValid(true);
    }
    if (!email) {
      setIsEmailValid(false);
      return;
    } else {
      setIsEmailValid(true);
    }
    if (!phoneNumber) {
      setIsPhoneNumberValid(false);
      return;
    } else {
      setIsPhoneNumberValid(true);
    }
    if (!password) {
      setIsPasswordValid(false);
      return;
    } else {
      setIsPasswordValid(true);
    }
    if (!confirmPassword) {
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
      venue: selectedPlace ? [selectedPlace.id] : null,
      isp: selectedISP ? selectedISP.id : null,
    };
    console.log(requestData, 'request data in signup', selectedPlace, selectedISP);
    setIsSubmitting(true); // Set submitting state to true while making the request

    try {
      const response = await api.post('user/phone/register', requestData, {
        headers: {'Content-Type': 'application/json'},
      });

      if (response.data.status && response.data.past_registered) {
        navigation.navigate('Signin');
        showToast(response.data.data, 'success');
      } else if (response.data.status && response.data.data.user_id) {
        const userId = response.data.data.user_id;
        navigation.navigate('OTPCheck', {userId});
      } else {
        showToast(
          'Unexpected response from server. Please try again.',
          'error',
        );
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
        showToast(errorMessage, 'error');
        console.log('Signup error response:', errorData.data);
      } else {
        console.log('Signup error:', error.message);
        showToast(error.message, 'error');
      }
    } finally {
      setIsSubmitting(false); // Set submitting state to false after request is complete
    }
  };

  const fetchISP = async place => {
    try {
      console.log(place, 'selected place in fetch');
      const response = await api.get(`user/venue/${place?.id}/isps/`);
      console.log(response.data.data, 'get isp');
      setIsp(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tour places:', error);
    }
  };

  useEffect(() => {
    const fetchTourPlaces = async () => {
      try {
        const response = await api.get('tourplace/getall');
        setTourPlaces(response.data.data || []);
      } catch (error) {
        console.error('Error fetching tour places:', error);
      }
    };
    fetchTourPlaces();
  }, []);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView>
        {/* Logo */}
        <Image
          source={require('../../asset/img/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

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
          {!isUserNameValid && (
            <Text style={styles.requiredText}>Required*</Text>
          )}
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
          {!isPhoneNumberValid && (
            <Text style={styles.requiredText}>Required*</Text>
          )}
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#CCCCCC"
            onChangeText={handlePasswordChange}
            value={password}
            secureTextEntry={!showPassword}
          />
           <TouchableOpacity onPress={() => setShowPassword(!showPassword
            )}>
              <Feather name={showPassword ? "eye-off" : "eye"} color="white" size={16} />
            </TouchableOpacity>
          </View>
          {!isPasswordValid && (
            <Text style={styles.requiredText}>Required*</Text>
          )}
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#CCCCCC"
            onChangeText={handleConfirmPasswordChange}
            value={confirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
           <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword
            )}>
              <Feather name={showConfirmPassword ? "eye-off" : "eye"} color="white" size={16} />
            </TouchableOpacity>
            </View>
          {!isConformPasswordValid && (
            <Text style={styles.requiredText}>Required*</Text>
          )}
        </View>
        <View style={styles.inputContainer}>
          <Picker
            itemStyle={styles.picker}
            selectedValue={selectedPlace ? selectedPlace.id : null}
            style={styles.picker}
            onValueChange={handlePlaceChange}>
            <Picker.Item label="Select Venue" value={null} />
            {tourPlaces.map(place => (
              <Picker.Item
                key={place.id}
                label={place.venue_name}
                value={place.id}
              />
            ))}
          </Picker>
          {!isTourPlaceValid && (
            <Text style={styles.requiredText}>Required*</Text>
          )}
        </View>
        {isp?.isps?.length > 0 && (
          <View style={styles.inputContainer}>
            <Picker
              itemStyle={styles.picker}
              selectedValue={selectedISP ? selectedISP.id : null}
              style={styles.picker}
              onValueChange={handleISPChange}>
              <Picker.Item label="Select Business" value={null} />
              {isp?.isps?.map(place => (
                <Picker.Item
                  key={place.id}
                  label={place.name}
                  value={place.id}
                />
              ))}
            </Picker>
            {!isIspValid && <Text style={styles.requiredText}>Required*</Text>}
          </View>
        )}
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={isAccepted}
            onValueChange={setIsAccepted}
            style={styles.checkbox}
            tintColors={{true: '#F15927', false: '#FFFFFF'}}
          />
          <Text style={styles.checkboxText}>
            By continuing you accept our{' '}
            {/* <Text style={styles.link} onPress={() => navigation.navigate('PrivacyPolicy')}> */}
            <Text style={styles.link}>Privacy Policy</Text> &{' '}
            {/* <Text style={styles.link} onPress={() => navigation.navigate('TermsOfUse')}> */}
            <Text style={styles.link}>Term of Use</Text>
          </Text>
        </View>
        {!isAcceptedValid && <Text style={styles.requiredText}>Required*</Text>}
        {/* Sign Up Button */}
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={handleSignup}
          disabled={isSubmitting}>
          {isSubmitting && <ActivityIndicator size="small" />}
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Text
            onPress={() => navigation.navigate('Signin')}
            style={styles.loginLink}>
            Login
          </Text>
        </Text>
      </KeyboardAwareScrollView>
      {toast?.show && <Toast toast={toast} setToast={setToast} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    backgroundColor: '#0B1541', // Background color from the design
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  picker: {
    color: '#FFFFFF',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 30,
    alignSelf: 'center',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  createAccountText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
    flexDirection: 'row',
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
    marginVertical: 20,
    textAlign: 'center',
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
