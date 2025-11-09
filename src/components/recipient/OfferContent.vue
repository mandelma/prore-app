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
import { useClientStore } from '@/stores/recipientStore';
defineOptions({
    name: 'offer-content'
})
const {offerId} = defineProps({
    offerId: {type: String}
})
const clientStore = useClientStore();

const emit = defineEmits(['quit-content']);
const back = () => {
    emit('quit-content', false);
    console.log("Yees")
}
const offerContent = clientStore.getOfferById(offerId);

const orderProvider = async() => {
    console.log("Ordering the provider to the booking - " + offerContent.bookingID);

    await clientStore.confirmOffer(offerContent);
    
    emit('quit-content', true);
}
</script>
<style scoped>
.right-side {
    display: flex;
    justify-content: right;
}
</style>