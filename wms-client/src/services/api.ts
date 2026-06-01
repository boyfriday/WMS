import axios, { AxiosError, AxiosInstance } from 'axios';

const coreApi = axios.create({
  baseURL: '/api/core',
  headers: {
    'Content-Type': 'application/json',
  },
});

const orderApi = axios.create({
  baseURL: '/api/order',
  headers: {
    'Content-Type': 'application/json',
  },
});

const addAuthInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

addAuthInterceptor(coreApi);
addAuthInterceptor(orderApi);

export { coreApi, orderApi };
