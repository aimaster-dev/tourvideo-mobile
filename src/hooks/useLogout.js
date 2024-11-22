import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

export const useLogout = () => {
  const navigation = useNavigation();
  
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user_details');
      navigation.replace('Signin');
    } catch (e) {
      console.log(e, 'error in logout');
    }
  };
  return handleLogout;
};
