import axios from 'axios';
const baseUrl = '/api/client_history'

const getClientHistory = async () => {
    const history = await axios.get(baseUrl);
    return history.data;
}

const updateClientHistory = async (history) => {
    const added = await axios.post(`${baseUrl}`, history);
    return added.data;
}
const updateStatus = async (id, status) => {
    const newStatus = await axios.put(`${baseUrl}/${id}`, status);
    return newStatus.data;
}

const updateRating = async (id, rating) => {
    const rate = await axios.put(`${baseUrl}/${id}/update_rating`, rating);
    return rate.data;
}
export default { getClientHistory, updateClientHistory, updateStatus, updateRating };