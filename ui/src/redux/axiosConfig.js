import axios from 'axios';

const getToken = () => {
  const token = localStorage.getItem('userToken');
  return token ? token.replace(/^"(.*)"$/, '$1') : null;
};

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
