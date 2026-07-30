import axios from 'axios';
const baseUrl = "/api/profession";

const getProfessions = async () => {
    const professions = await axios.get(baseUrl);
    return professions.data;
}

const findProfession = async (code) => {
    const profession = await axios.get(`${baseUrl}/${code}`);
    return profession.data;
}

export default {
    getProfessions,
    findProfession
}
