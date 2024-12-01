import {useContext} from 'react';
import {AuthContext} from '../context/AuthContext';
import axios from 'axios';

export const domain = `https://api.emmysvideos.com`;
const api = axios.create({
  baseURL: `${domain}/api/v1`,
});

export const useAPI = () => {
  const {logout} = useContext(AuthContext);
  api.interceptors.response.use(
    response => {
      return response;
    },
    async error => {
      if (error.response && error.response.status === 401) {
        console.error('Token expired or unauthorized access');
        await logout();
      }
      return Promise.reject(error);
    },
  );
  return api;
};
