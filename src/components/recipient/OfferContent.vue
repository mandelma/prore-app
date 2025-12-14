<template>
    <div>
        <!-- <MDBContainer> -->
            <div style="display: flex; justify-content: right; padding: 7px;">
                <MDBBtnClose white @click="back"></MDBBtnClose>
            </div>
            <MDBTable  variant="dark">
                <tbody>
                    <tr>
                        <td>
                            Yritys
                        </td>
                        <td>
                            {{ offerContent.name }}
                        </td>
                    </tr>
                    <tr>
                        <td>Y-tunnus</td>
                        <td>{{ offerContent.provider.ide }}</td>
                    </tr>
                    <tr>
                        <td>
                            Osoite
                        </td>
                        <td>{{ offerContent.provider.address }}</td>
                    </tr>
                </tbody>
            </MDBTable>
            <div class="mb-3">
                <MDBBtn color="primary" @click="orderProvider" block>Tilaa</MDBBtn>
            </div>
            <div class="right-side">
                <MDBBtn color="dark"><i class="far fa-comment"></i></MDBBtn>
            </div>
            
        <!-- </MDBContainer> -->
        
    </div>
    
    
    
</template>
<script setup>
import {MDBBtnClose, MDBContainer, MDBTable, MDBBtn} from 'mdb-vue-ui-kit';
import { ref, computed } from 'vue';
import clientService from '@/service/recipients'
import { useClientStore } from '@/stores/recipientStore';
import { useLoginStore } from '@/stores/login';
import { useNotificationStore } from '@/stores/notificationStore';
import { storeToRefs } from 'pinia';
defineOptions({
    name: 'offer-content'
})
const {offerId} = defineProps({
    offerId: {type: String}
})
const clientStore = useClientStore();
const notificationStore = useNotificationStore();
const auth = useLoginStore();

const { bookings } = storeToRefs(clientStore);
const { user } = storeToRefs(auth);

const emit = defineEmits(['quit-content', 'quit-content-confirmed']);
const back = () => {
    emit('quit-content');
    console.log("Yees")
}
const offerContent = clientStore.getOfferById(offerId);

const orderProvider = async() => {
    console.log("Ordering the provider to the booking - " + offerContent.bookingID);

    const receiver = offerContent.sender;
    const myId = user.value.id;
    const bookingId = offerContent.bookingID;
    const header = "Sopimus tehty!";
    const proContent = `${user.value.firstName} on vahvistanut tilauksen - "${bookings.value.find(b => b.id === offerContent.bookingID).header}". Tarkemmat tiedot kalenterissa!`;
    const clientContent = `Tilaus on vahvistettu. Tiedot kalenterissa!`;

    const confirmed = await clientService.updateRecipientStatus(offerContent.bookingID, {status: 'confirmed'});
    const includeOffer = await clientService.addConfirmedOffer(offerContent.bookingID, offerContent);

    if (!includeOffer) return;

    const notification = {
        bookingId: bookingId,
        isNewMsg: true,
        isLink: true,
        title: header,
        content: proContent,
        reason: '',
        sender: user.value.firstName,
    }

    await clientStore.confirmOffer(offerContent);
    //await notificationStore.clientConfirmDealNotification(bookingId, offerContent?.sender, notification);
    await notificationStore.clientConfirmDealNotification(bookingId, offerContent.sender, notification);
    
    emit('quit-content-confirmed', offerContent.name);
}
</script>
<style scoped>
.right-side {
    display: flex;
    justify-content: right;
}
</style>