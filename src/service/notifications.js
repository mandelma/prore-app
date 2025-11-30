import axios from 'axios';

//import backendUrl from '@/url_config';
//const baseUrl = `${backendUrl}/messages`;
//const baseUrl = `${backendUrl}/notifications`;

const baseUrl = "/api/notifications";

const getMessage = async () => {
    const messages = await axios.get(baseUrl);
    return messages.data;
}
const getUserNotifications = async (userId) => {
    const notifications = await axios.get(`${baseUrl}/${userId}`);
    return notifications.data;
}

const createMessage = async (user_id, message) => {
    const created = await axios.post(`${baseUrl}/${user_id}/notification`, message);
    return created.data;
}

const editMessage = async (id, status) => {
    const edited = await axios.put(`${baseUrl}/${id}/edit_message_status`, status);
    return edited.data;
}

const removeSelectedMessage = async (message_id) => {
    await axios.delete(`${baseUrl}/${message_id}/remove_message`);
    //return removeMessage.data;
}


export default { getMessage, getUserNotifications, createMessage, editMessage, removeSelectedMessage };