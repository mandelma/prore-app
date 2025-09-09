//const axios = require('axios')
import axios from 'axios'
//import backendUrl from '@/url_config';
//const baseURL = `${backendUrl}/login`;
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

export default { login, verifyToken }