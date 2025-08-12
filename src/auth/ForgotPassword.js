import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Medium, Regular, Semibold} from '../constants/font';
import Toast from '../components/Toast';
import {useToast} from '../context/ToastContext';

const ForgotPassword = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const {showToast} = useToast();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../asset/img/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#CCCCCC"
              onChangeText={text => setEmail(text)}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#CCCCCC"
              onChangeText={text => setNewPassword(text)}
              value={newPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#CCCCCC"
              onChangeText={text => setConfirmPassword(text)}
              value={confirmPassword}
              secureTextEntry
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            if (!email) {
              showToast('Email field is empty', 'error');
            } else if (!newPassword) {
              showToast('New Password field is empty', 'error');
            } else if (newPassword !== confirmPassword) {
              showToast('Both the password should match', 'error');
            } else if (!confirmPassword) {
              showToast('Confirm password field is empty', 'error');
            } else {
              navigation.navigate('Signin');
              showToast('Password is changed successfully', 'success');
            }
          }}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1541',
    paddingTop: 40,
  },
  logoContainer: {
    alignSelf: 'center',
  },
  resetButton: {
    backgroundColor: '#287BF3',
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 30,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: '#1C2749',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  input: {
    color: '#FFFFFF',
    paddingVertical: 15,
    fontSize: 16,
    fontFamily: Regular,
  },
});

export default ForgotPassword;
