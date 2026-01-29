import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Replace 'localhost' with your computer's IP so the mobile app can reach the backend
export const API_URL = 'http://10.0.2.2:3000';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors (e.g., 401 Unauthorized)
    if (error.response?.status === 401) {
      // TODO: Log out user or refresh token
      console.log('Unauthorized access in mobile app');
    }
    return Promise.reject(error);
  }
);

export default client;
