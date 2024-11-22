import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../hooks/useLogout';

const api = axios.create({
  baseURL: 'https://api.emmysvideos.com/api/v1/',
});

api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    if (error.response && error.response.status === 403) {
      console.error('Token expired or unauthorized access');
      await AsyncStorage.removeItem('access_token');
      await logout()
    }
    return Promise.reject(error);
  },
);

export default api;
