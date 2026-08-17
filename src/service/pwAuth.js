import axios from "axios";
const baseUrl = '/api/reset_pw'

const forgot = async (email) => {
    const result = await axios.post(`${baseUrl}/forgot_auth`, email);
    return result.data;
}

const reset = async (token) => {
    const result = await axios.get(`${baseUrl}/reset_auth/${token}`);
    return result.data;
}

// Reset password
const resetAuth = async (auth_data) => {
    const pw = await axios.post(`${baseUrl}/reset_auth`, auth_data);
    return pw.data;
}

export default { forgot, reset, resetAuth };