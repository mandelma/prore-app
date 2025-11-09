import axios from 'axios';
//import backendUrl from '@/url_config';
//const baseUrl = `${backendUrl}/offers`;
const baseUrl = '/api/timeoffers';

const getOffers = async () => {
    const offers = await axios.get(baseUrl);
    return offers.data;
}

const addFirstOffer = async (offer) => {
    const newOffer = await axios.post(`${baseUrl}`, offer);
    return newOffer.data;
}

const addAdditionalTimeOffer = async (id, timeOffer) => {
    const additionalOffer = await axios.post(`${baseUrl}/${id}`, timeOffer);
    return additionalOffer.data;
}

const removeTimeOffer = async (providerId, offerId) => {
    const removedTimeRange = await axios.delete(`${baseUrl}/${providerId}/timeoffer/${offerId}`);
    return removedTimeRange.data;
}

const updateTimetableEvent = async (id, timeOffer) => {
    const updated = await axios.put(`${baseUrl}/${id}`, timeOffer)
    return updated.data
}

export default { getOffers, addFirstOffer, addAdditionalTimeOffer, removeTimeOffer, updateTimetableEvent };