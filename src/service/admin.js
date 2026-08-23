import axios from "axios";
const baseUrl = "/api/admin";

const getDashboard = async (token) => {
    const result = await axios.get(`${baseUrl}/dashboard`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return result.data;
}


export default {
    getDashboard
}