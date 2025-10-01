import axios from 'axios';
//import backendUrl from '@/url_config';
//const baseUrl = `${backendUrl}/recipients`;
const baseUrl = '/api/recipients';

const getRecipients = async () => {
    const results = await axios.get(baseUrl);
    return results.data;
}

const getOwnBookings = async (id) => {
    const ownResults = await axios.get(`${baseUrl}/user/${id}`);
    return ownResults.data;
}

const getBookingById = async (id) => {
    const booking = await axios.get(`${baseUrl}/booking/${id}`);
    return booking.data;
}

const addRecipient = async (id, newRecipient) => {
    const recipient = await axios.post(`${baseUrl}/${id}`, newRecipient);
    return recipient.data;
}
// Update booking status
const updateRecipient = async (id, update) => {
    const updated = await axios.put(`${baseUrl}/${id}`, update);
    return updated.data;
}
// edit booking address
const editBookingAddress = async (id, address) => {
    const newAddress = await axios.put(`${baseUrl}/${id}/editBookingAddress`, address);
    return newAddress.data;
}

// Edit description
const editDescription = async (id, description) => {
    const edited = await axios.put(`${baseUrl}/${id}/description`, description);
    return edited.data;
}

// Add confirmed provider
const addProviderData = async (id, proID) => {
    const result = await axios.post(`${baseUrl}/${id}/addOrdered/${proID}`);
    return result.data;
}
// Add visitor
const addVisitor = async (id, visitor) => {
    const newVisitor = await axios.put(`${baseUrl}/${id}/visitor`, visitor);
    return newVisitor.data;
}
// Remove confirmed provider
const removeProviderData = async (id, proID) => {
    const removed = await axios.put(`${baseUrl}/${id}/pro/${proID}`);
    return removed.data;
}
// const addProviderID = async (id, provID) => {
//     const added = await axios.put(`${baseUrl}/${id}`, provID);
//     return added.data;
// }

// add offer
const createOffer = async (bookingID, offerID) => {
    const offer = await axios.post(`${baseUrl}/${bookingID}/offer/${offerID}`);
    return offer.data;
}

// Update booking date
const newDate = async (id, date) => {
    const updated = await axios.put(`${baseUrl}/${id}/updateDate`, date);
    return updated.data;
}

const addImage = async (recipientID, imageID) => {
    const imageAdded = await axios.post(`${baseUrl}/${recipientID}/addImage/${imageID}`);
    return imageAdded.data;
}

const removeImage = async (recipientID, imageID) => {
    const imageRemoved = await axios.delete(`${baseUrl}/${recipientID}/image/${imageID}`);
    return imageRemoved.data;
}

const feedbackClient = async (id, isClient) => {
    const client = await axios.put(`${baseUrl}/client/${id}`, isClient);
    return client.data;
}
// Delete booking
const removeBooking = async (id) => {
    await axios.delete(`${baseUrl}/${id}`);
}

export default {
    getRecipients,
    getOwnBookings,
    getBookingById,
    addRecipient,
    updateRecipient,
    editBookingAddress,
    editDescription,
    addProviderData,
    addVisitor,
    removeProviderData,
    createOffer,
    //addProviderID,
    newDate,
    addImage,
    removeImage,
    feedbackClient,
    removeBooking
}