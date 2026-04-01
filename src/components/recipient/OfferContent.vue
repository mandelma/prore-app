<template>
    <div>
        <div style="display: flex; justify-content: left;">
            <MDBBtn v-if="!isFeedback" color="info" block @click="goToFeedback">Vastaanotettu palaute</MDBBtn>
            <MDBBtn v-else outline="light" size="sm" style="margin-bottom: 13px;" @click="isFeedback = false">← Takaisin</MDBBtn>
        </div>
        
        
        <!-- <MDBContainer> -->
            <div v-if="isFeedback" v-html="feedbackHtml"></div>
            <MDBTable v-else borderless class="client-content" style="">
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
                    <tr>
                        <td class="c-td">
                            Etäisyys
                        </td>
                        <td class="text-muted">
                            {{ offerContent.distance }} km.
                        </td>
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
    import Feedback from '../provider/Feedback.vue';
    import { useRouter } from 'vue-router';
    import { storeToRefs } from 'pinia';
    defineOptions({
        name: 'offer-content'
    })
    const {bookingId, offerId} = defineProps({
        bookingId: {type: String},
        offerId: {type: String}
    })

    const clientStore = useClientStore();
    const notificationStore = useNotificationStore();
    const conversationStore = useConversationStore();
    const auth = useLoginStore();
    const isFeedback = ref(false);

    const router = useRouter();

    const { bookings } = storeToRefs(clientStore);
    const { user } = storeToRefs(auth);

    const offerContent = computed(() => {
        let result = null;
        if (bookingId) {
            result = clientStore.getBookingById(bookingId).offer;
        } else {
            result = clientStore.getOfferById(offerId)
        }
        return result;
    })

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

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, ch => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
        }[ch]));
    }

    //.slice(0, 5)
    const feedbackHtml = computed(() => {
    const feedback = offerContent.value?.provider?.feedback ?? []

    return feedback
        .filter(f => f && f.text && f.text.trim() !== '')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(f => `
        <div class="feedback-item">
            <div class="feedback-meta">
            <span class="feedback-sender">${escapeHtml(f.sender || 'Tuntematon')}</span>
            <span class="feedback-date">${new Date(f.date).toLocaleString('fi-FI')}</span>
            </div>
            <div class="feedback-text">${escapeHtml(f.text)}</div>
        </div>
        `)
        .join('')
    })
    
    const goToFeedback = () => {
        isFeedback.value = true;
        //router.push({name: 'pro-feedback', params: {id: offerContent?.provider?.id}})
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

:deep(.feedback-section) {
  margin-top: 12px;
  border-top: 1px solid #e5e5e5;
  padding-top: 10px;
}

:deep(.feedback-title) {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}

:deep(.feedback-list) {
  max-height: 220px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 6px;
}

:deep(.feedback-item) {
  background: #f7f7f7;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  padding: 8px 10px;
  margin-bottom: 8px;
}


:deep(.feedback-meta) {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

:deep(.feedback-sender) {
  color: blue;
  font-weight: 600;
  font-size: 13px;
}

:deep(.feedback-date) {
  font-size: 11px;
  color: #666;
  white-space: nowrap;
}

:deep(.feedback-text) {
  font-size: 13px;
  line-height: 1.35;
  color: #333;
  word-break: break-word;
}

</style>