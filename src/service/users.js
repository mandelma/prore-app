import axios from 'axios';

const baseUrl = '/api/users';

const addUser = async newUser => {
    const user = await axios.post(`${baseUrl}`, newUser);
    return user.data;
};

export default { addUser };