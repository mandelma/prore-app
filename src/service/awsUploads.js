//const axios = require('axios');
import axios from 'axios';
//import backendUrl from '@/url_config';
//const baseUrl = `${backendUrl}/aws_upload`;
const baseUrl = '/api/aws-uploads';

const uploadClientImage = async (newImageData) => {
    const result = await axios.post(`${baseUrl}/upload-client`, newImageData)
    return result.data
}

const editClientImage = async (id, key, newImage) => {
    const updated = await axios.put(`${baseUrl}/update_client/${id}/${key}`, newImage);
    return updated.data;
}

const uploadProImage = async (proImage) => {
    const proImg = await axios.post(`${baseUrl}/upload-pro`, proImage);
    return proImg.data;
}

const editProImage = async (id, key, newProImage) => {
    const updatedProImg = await axios.put(`${baseUrl}/update_pro/${id}/${key}/`, newProImage);
    return updatedProImg.data;
}

const uploadChatImage = async (formData) => {
    const chatImg = await axios.post(`${baseUrl}/upload-chat`, formData);
    return chatImg.data;
}

const uploadAvatarImage = async (id,avatarImage) => {
    const avatar_img = await axios.post(`${baseUrl}/upload-avatar/${id}`, avatarImage);
    return avatar_img.data;
}

const editAvatarImage = async (userId, key, newAvatar) => {
    const updatedAvatar = await axios.put(`${baseUrl}/update-avatar/${userId}/${key}`, newAvatar);
    return updatedAvatar.data;
}

const deleteAvatar = async (userId, key) => {
    const remove_avatar = await axios.put(`${baseUrl}/delete-avatar/${userId}/${key}`);
    return remove_avatar.data;
}

const deleteImage = async (id, key) => {
    await axios.delete(`${baseUrl}/delete-image/${id}/${key}`);
}

export default { uploadClientImage,
    editClientImage,
    uploadProImage,
    editProImage,
    uploadChatImage,
    uploadAvatarImage,
    editAvatarImage,
    deleteAvatar,
    deleteImage
};