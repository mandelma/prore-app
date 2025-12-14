const axios = require('axios');
//import axios from 'axios';

//import backendUrl from '@/url_config';
//const baseUrl = `${backendUrl}/messages`;
//const baseUrl = `${backendUrl}/messages`;
const baseUrl = '/api/messages';

const getMessage = async () => {
    const messages = await axios.get(baseUrl);
    return messages.data;
}

const createMessage = async (user_id, message) => {
    const created = await axios.post(`${baseUrl}/${user_id}/message`, message);
    return created.data;
}

const editMessage = async (id, status) => {
    const edited = await axios.put(`${baseUrl}/${id}/edit_message_status`, status);
    return edited.data;
}

const removeSelectedMessage = async (user_id, message_id) => {
    await axios.delete(`${baseUrl}/${user_id}/remove_message/${message_id}`);
    //return removeMessage.data;
}


export default { getMessage, createMessage, editMessage, removeSelectedMessage };