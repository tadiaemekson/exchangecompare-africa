import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// In Android emulators, 127.0.0.1 refers to the emulator itself.
// Use 10.0.2.2 to connect to the host computer's localhost port 8000.
import Constants from 'expo-constants';

const getDefaultBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://127.0.0.1:8000/api';
  }

  // For Android emulator standard loopback if hostUri is not resolved
  if (Platform.OS === 'android' && !Constants.expoConfig?.hostUri) {
    return 'http://10.0.2.2:8000/api';
  }

  // Dynamically resolve host computer IP on local Wi-Fi for physical phones
  const host = Constants.expoConfig?.hostUri?.split(':').shift();
  if (host) {
    return `http://${host}:8000/api`;
  }

  return 'http://127.0.0.1:8000/api';
};

const api = axios.create({
  baseURL: getDefaultBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to attach authentication token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
