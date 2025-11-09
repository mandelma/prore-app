//const axios = require('axios');
import axios from 'axios';
//import backendUrl from '@/url_config';
//const baseUrl = `${backendUrl}/offer`;
const baseUrl = "/api/offer";

const addOffer = async (offer) => {
    const new_offer = await axios.post(baseUrl, offer);
    return new_offer.data;
}

const editStatus = async (id, status) => {
    const edited = await axios.put(`${baseUrl}/${id}`, status);
    return edited.data;
}
const removeBookingOffer = async (offerID, bookingID) => {
    await axios.delete(`${baseUrl}/${offerID}/remove_by_offerID/${bookingID}`);
}
const deleteBookingOffers = async (booking_id) => {
    await axios.delete(`${baseUrl}/${booking_id}`);
}

export default {
    addOffer,
    editStatus,
    removeBookingOffer,
    deleteBookingOffers
}