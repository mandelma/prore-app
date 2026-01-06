import axios from 'axios';


const baseUrl = '/api/users';

const getUser = async (id) => {
    const user = await axios.get(`${baseUrl}/${id}`);
    return user.data;
}

const addUser = async newUser => {
    const user = await axios.post(`${baseUrl}`, newUser);
    return user.data;
};

const editEmail = async (id, email) => {
    const res = await axios.put(`${baseUrl}/${id}/updateEmail`, email);
    return res.data;
}

export default { getUser, addUser, editEmail };