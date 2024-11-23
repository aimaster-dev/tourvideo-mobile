import React, {createContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user_details');
      setUser(null);
    } catch (e) {
      console.log(e, 'error in logout');
    }
  };

  const checkIsAuthenticated = async () => {
    try {
      const data = await AsyncStorage.getItem('access_token');
      const user_data = await AsyncStorage.getItem('user_details');
      const parsed_data = JSON.parse(user_data);
      if (data && parsed_data) {
        setUser(parsed_data);
      }
      setIsLoading(false);
    } catch (e) {
      console.log(e, 'error in checking authentication');
    }
  };

  useEffect(() => {
    checkIsAuthenticated();
  }, []);

  return (
    <AuthContext.Provider value={{user, setUser, isLoading, logout}}>
      {children}
    </AuthContext.Provider>
  );
};
