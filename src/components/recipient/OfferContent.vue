<template>
    <div>
        <!-- <MDBContainer> -->
            <MDBTable  borderless class="client-content" style="">
                <tbody>
                    <tr>
                        <td class="c-td">
                            Yritys
                        </td>
                        <td class="text-muted">
                            {{ offerContent.name }}
                        </td>
                    </tr>
                    <tr>
                        <td class="c-td">Y-tunnus</td>
                        <td class="text-muted">{{ offerContent.provider.ide }}</td>
                    </tr>
                    <tr>
                        <td class="c-td">
                            Osoite
                        </td>
                        <td class="text-muted">{{ offerContent.provider.address }}</td>
                    </tr>
                    <tr v-if="offerContent.provider.pricePerHour !== ''">
                        <td class="c-td">
                            Tuntihinta
                        </td>
                        <td class="text-muted">
                            {{ offerContent.provider.priceByHour }} eur
                        </td>
                    </tr>
                    <tr>
                        <td class="c-td">
                            Tarjous hinta
                        </td>
                        <td class="text-muted">
                            {{ offerContent.price }} eur
                        </td>
                    </tr>
                    <tr>
                        <td class="c-td">
                            Kuvaus
                        </td>
                        <td class="text-muted">
                            {{ offerContent.provider.description }}
                        </td>
                    </tr>
                    <tr v-if="offerContent.provider.reference.length">
                        <td class="c-td">
                            Referenssit
                        </td>
                    </tr>
                    <tr v-if="offerContent.provider.reference.length">
                        <td colspan="2">
                            <MDBLightbox> 
                                <MDBRow class="g-2 mx-0">
                                    <MDBCol
                                    lg="4"
                                    md="4"
                                    sm="6"
                                    xs="6"
                                    v-for="(photo, idx) in offerContent.provider.reference"
                                    :key="idx"
                                    class="px-1"
                                    >
                                    <div class="lightbox-thumb">
                                        <MDBLightboxItem
                                            :src="photo.imageUrl || photo.previewUrl"
                                            :fullScreenSrc="photo.imageUrl || photo.previewUrl"
                                            alt="Pro reference"
                                        />
                                    </div>
                                    </MDBCol>
                                </MDBRow>
                            </MDBLightbox>
                        </td>
                    </tr>
                </tbody>
            </MDBTable>
            
            <div class="right-side">
                <MDBBtn color="primary" @click="onChat"><i class="far fa-comment"></i></MDBBtn>
            </div>
            
        <!-- </MDBContainer> -->
        
    </div>
    
    
    
</template>
<script setup>
    import {MDBBtnClose, MDBContainer, MDBTable, MDBBtn, MDBLightbox, MDBLightboxItem, MDBRow, MDBCol} from 'mdb-vue-ui-kit';
    import { ref, computed } from 'vue';
    import clientService from '@/service/recipients'
    import { useClientStore } from '@/stores/recipientStore';
    import { useLoginStore } from '@/stores/login';
    import { useNotificationStore } from '@/stores/notificationStore';
    import { useConversationStore } from '@/stores/conversationStore';
    import { storeToRefs } from 'pinia';
    defineOptions({
        name: 'offer-content'
    })
    const {offerId} = defineProps({
        offerId: {type: String}
    })
    const clientStore = useClientStore();
    const notificationStore = useNotificationStore();
    const conversationStore = useConversationStore();
    const auth = useLoginStore();

    const { bookings } = storeToRefs(clientStore);
    const { user } = storeToRefs(auth);
    const offerContent = clientStore.getOfferById(offerId);
    const emit = defineEmits(['quit-content', 'quit-content-confirmed']);
    const back = () => {
        emit('quit-content');
        console.log("Yees")
    }

    const onChat = () => {
        console.log("Chat btn");
        console.log("otheruserId - ", offerContent?.sender);
        const otherId = offerContent?.sender;
        conversationStore.openCreateRoom(otherId);
        conversationStore.openChatWidget();
    }

</script>
<style scoped>
.right-side {
    display: flex;
    justify-content: right;
}
.client-content {
    text-align: left;
}

.client-content .c-td {
    color: #ddd;
}

/* Lightbox thumb */
.lightbox-thumb{
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 8px;
}

/* MDBLightboxItem renders an img inside */
.lightbox-thumb img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

</style>