import axios from "axios";
const baseUrl = "/api/mail";

const sendEmail = async (name, email, message) => {
    const emailResponse = await axios.post(`${baseUrl}`, { name, email, message });
    return emailResponse.data;
}

export default {
    sendEmail
}