import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import OtpInputs from 'react-native-otp-inputs';  // For handling OTP inputs
import axios from 'axios';  // To handle API requests
import { useNavigation } from '@react-navigation/native';

const OTPScreen = ({ route }) => {
  const { userId = 0 } = route.params || {};
  const [otp, setOtp] = useState('');  // State for the OTP
  const [loading, setLoading] = useState(false);  // To manage loading state
  const [error, setError] = useState(false); // To manage verification error state
  const [success, setSuccess] = useState(false); // To manage verification success state
  const [resending, setResending] = useState(false); // To manage resend state
  const [resendSuccess, setResendSuccess] = useState(false); // To track if resend succeeded
  const [resendError, setResendError] = useState(false); // To track if resend failed
  const navigation = useNavigation();

  const handleOTPChange = (code) => {
    setOtp(code);
    setError(false);  // Reset the error state when user changes OTP
    setSuccess(false); // Reset success state when OTP is changed
    setResendSuccess(false); // Reset resend success state when OTP changes
    setResendError(false); // Reset resend error when OTP is changed
    if (code.length === 6) {
      verifyOTP(code);
    }
  };

  const verifyOTP = async (code) => {
    setLoading(true);
    setError(false);
    setSuccess(false);

    try {
      const response = await axios.get(`https://api.emmysvideos.com/api/v1/user/phone/activate/${code}`);
      if (response.data.status) {
        setSuccess(true);
        navigation.navigate('Signin');
      } else {
        setError(true);
      }
    // eslint-disable-next-line no-catch-shadow, no-shadow
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setResending(true);  // Start resending
    setLoading(true);  // Start loading
    setError(false);  // Reset error state
    setSuccess(false); // Reset success state
    setResendError(false); // Reset resend error

    try {
      // Send request to resend OTP
      const response = await axios.get(`https://api.emmysvideos.com/api/v1/user/phone/resend/${userId}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Handle success
      if (response.status === 201 && response.data.status) {
        setResendSuccess(true);
      } else {
        setResendError(true);
      }
    // eslint-disable-next-line no-catch-shadow, no-shadow
    } catch (error) {
      // Handle error response from the server or network issues
      setResendError(true);
    } finally {
      setResending(false);  // Stop resending
      setLoading(false);  // Stop loading
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Verify Code</Text>
        <Text style={styles.subtitle}>Verification code sent to your contact number</Text>
      </View>

      {/* OTP Input */}
      <OtpInputs
        handleChange={handleOTPChange}
        numberOfInputs={6}
        autofillFromClipboard={false}
        inputStyles={styles.otpInput}
        style={styles.otpContainer}
      />

      {/* Resend Code */}
      <TouchableOpacity onPress={resendOTP} style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn’t receive OTP?</Text>
        <Text style={styles.resendButton}>Resend code</Text>
      </TouchableOpacity>

      {/* Show loading, success, or verification/resend failed message */}
      {loading ? (
        <Text style={styles.loadingText}>{resending ? 'Resending...' : 'Verifying OTP...'}</Text>
      ) : error ? (
        <Text style={styles.errorText}>Verification Failed</Text>
      ) : success ? (
        <Text style={styles.successText}>Success!</Text>
      ) : resendSuccess ? (
        <Text style={styles.successText}>Resend Code Success</Text>
      ) : resendError ? (
        <Text style={styles.errorText}>Resend Code Failed</Text>
      ) : null}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1541',  // Dark Blue background
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#bbb',
    fontSize: 14,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  otpInput: {
    backgroundColor: '#2C3D75',
    color: '#fff',
    fontSize: 22,
    borderRadius: 10,
    padding: 10,
    textAlign: 'center',
    width: 50,
    height: 50,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    color: '#bbb',
    fontSize: 14,
  },
  resendButton: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 5,
  },
  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
  },
  errorText: {
    color: 'red',  // Red color for error message
    marginTop: 20,
    fontSize: 16,
  },
  successText: {
    color: 'green',  // Green color for success message
    marginTop: 20,
    fontSize: 16,
  },
});

export default OTPScreen;
