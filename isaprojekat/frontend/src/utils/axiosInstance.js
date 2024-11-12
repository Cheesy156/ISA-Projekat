import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // To avoid looping if refresh fails

      try {
        // Attempt to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', { refresh: refreshToken });
        console.log('Token refreshed');
        // Store the new token and retry the original request
        const newToken = response.data.access;
        localStorage.setItem('authToken', newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed
        console.error("Refresh token is invalid or expired. Redirecting to login.");
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      }
    }

    // If error is not due to expired token, reject as usual
    return Promise.reject(error);
  }
);

export default api;