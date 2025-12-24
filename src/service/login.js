
/* import axios from 'axios'

const baseURL = '/api/login';


//const baseURL = "/api/login"

const login = async loginData => {
    const response = await axios.post(baseURL, loginData)
    return response.data
}

const verifyToken = async (token) => {
    const decodedToken = await axios.post(`${baseURL}/${token}`);
    return decodedToken.data;
}

export default { login, verifyToken } */

import { authApi } from "./api";

const login = async (loginData) => {
  const response = await authApi.post("/login", loginData); // -> /api/login
  return response.data;
};

// ✅ match backend: POST /api/login/:token
const verifyToken = async (token) => {
  const response = await authApi.post(`/login/${token}`);
  return response.data;
};

export default { login, verifyToken };