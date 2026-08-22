import axios from 'axios';

/*
 * La URL del backend ya no esta escrita a mano: viene de REACT_APP_API_URL, de
 * modo que apuntar a un entorno distinto no exige tocar codigo.
 *
 * El puerto por defecto es 4000 y no 3000 porque el 3000 lo ocupa el propio
 * servidor de desarrollo de React.
 */
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

export default axiosInstance;
