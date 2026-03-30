import axios from 'axios';
//import backendUrl from '@/url_config';
//const baseUrl = `${backendUrl}/pro_history`;
const baseUrl = '/api/pro_history'

let token = null;

const setProSideToken = (newToken) => {
    token = newToken
}

const getProHistory = async () => {
    const history = await axios.get(baseUrl, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return history.data;
}

const updateProHistory = async (history) => {
    const added = await axios.post(`${baseUrl}`, history);
    return added.data;
}

const deleteProviderArchiveRow = async (id) => {
    const deleteRow = await axios.delete(`${baseUrl}/${id}`);
    return deleteRow.data;
}

export default { setProSideToken, getProHistory, updateProHistory, deleteProviderArchiveRow };