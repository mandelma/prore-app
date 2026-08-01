<template>
    <div>
        <div style="display: flex; justify-content: left;">
            <div v-if="!isFeedback">
                <MDBBtn v-if="offerContent?.provider?.feedback.length" color="info" block @click="goToFeedback">{{ t('offerContent.received_feedback') }}</MDBBtn>
            </div>
            
            <MDBBtn v-else-if="isFeedback" outline="light" size="sm" style="margin-bottom: 13px;" @click="isFeedback = false">← {{ t('offerContent.back') }}</MDBBtn>
        </div>
        
        
        <!-- <MDBContainer> -->
            <div v-if="isFeedback" v-html="feedbackHtml"></div>
            <MDBTable v-else borderless class="client-content" style="">
                <tbody>
                    <tr>
                        <td class="c-td">
                            {{ t('offerContent.company') }}
                        </td>
                        <td class="text-muted">
                            {{ offerContent?.name }}
                        </td>
                    </tr>
                    <tr>
                        <td class="c-td">
                            {{ t('offerContent.description') }}
                        </td>
                        <td class="text-muted">
                            {{ offerContent?.provider?.description }}
                        </td>
                    </tr>
                    <tr>
                        <td class="c-td">{{ t('offerContent.business_id') }}</td>
                        <td class="text-muted">{{ offerContent?.provider?.ide }}</td>
                    </tr>
                    <tr>
                        <td class="c-td">
                            {{ t('offerContent.address') }}
                        </td>
                        <td class="text-muted">{{ offerContent?.provider?.address }}</td>
                    </tr>
                    <tr>
                        <td class="c-td">
                            {{ t('offerContent.distance') }}
                        </td>
                        <td class="text-muted">
                            {{ offerContent?.distance }} km.
                        </td>
                    </tr>
                    <tr v-if="offerContent?.provider?.pricePerHour !== ''">
                        <td class="c-td">
                            {{ t('offerContent.hourly_rate') }}
                        </td>
                        <td class="text-muted">
                            {{ offerContent?.provider?.priceByHour }} eur
                        </td>
                    </tr>
                    <tr>
                        <td class="c-td">
                            {{ t('offerContent.offer_price') }}
                        </td>
                        <td class="text-muted">
                            {{ offerContent?.price }} eur
                        </td>
                    </tr>
                    <tr v-if="offerContent?.description !== ''">
                        <td colspan="2" class="text-muted">
                            {{ offerContent?.description }}
                        </td>
                    </tr>
                    
                    <tr v-if="offerContent?.provider?.reference.length">
                        <td class="c-td">
                            {{ t('offerContent.references') }}
                        </td>
                    </tr>
                    <tr v-if="offerContent?.provider?.reference.length">
                        <td colspan="2">
                            <MDBLightbox> 
                                <MDBRow class="g-2 mx-0">
                                    <MDBCol
                                    lg="4"
                                    md="4"
                                    sm="6"
                                    xs="6"
                                    v-for="(photo, idx) in offerContent?.provider?.reference"
                                    :key="idx"
                                    class="px-1"
                                    >
                                    
                                    <div class="lightbox-thumb">
                                        <MDBLightboxItem
                                            :src="photo.imageId?.imageUrl || photo.imageUrl || photo.previewUrl" 
                                            :fullScreenSrc="photo.imageId?.imageUrl || photo.imageUrl || photo.previewUrl"
                                            :alt="t('offerContent.reference_alt')"
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

        <!-- offer content: {{ offerContent }} -->
        
    </div>
    
    
    
</template>
<script setup>
    import {MDBBtnClose, MDBContainer, MDBTable, MDBBtn, MDBLightbox, MDBLightboxItem, MDBRow, MDBCol} from 'mdb-vue-ui-kit';
    import { ref, computed, watch } from 'vue';
    import { useI18n } from 'vue-i18n';
    import clientService from '@/service/recipients'
    import providerService from '@/service/providers';
    import { useClientStore } from '@/stores/recipientStore';
    import { useLoginStore } from '@/stores/login';
    import { useNotificationStore } from '@/stores/notificationStore';
    import { useConversationStore } from '@/stores/conversationStore';
    import { getBottomRightAnchor } from '../helpers/chatGeometry.js';
    import Feedback from '../provider/Feedback.vue';
    import { useRouter } from 'vue-router';
    import { storeToRefs } from 'pinia';
    defineOptions({
        name: 'offer-content'
    })
    /* const {bookingId, offerId} = defineProps({
        bookingId: {type: String},
        offerId: {type: String}
    }) */
    const { t } = useI18n();
    const clientStore = useClientStore();
    const notificationStore = useNotificationStore();
    const conversationStore = useConversationStore();
    const auth = useLoginStore();
    const isFeedback = ref(false);

    const router = useRouter();

    const { bookings } = storeToRefs(clientStore);
    const { user } = storeToRefs(auth);

    const props = defineProps({
        bookingId: {
            type: String,
            default: null
        },
        offerId: {
            type: String,
            default: null
        }
    });

    const offerContent = ref(null);
    const isOfferLoading = ref(false);
    const offerError = ref(null);

    const loadOfferContent = async () => {
        offerContent.value = null;
        offerError.value = null;
        isOfferLoading.value = true;

        try {
            let offer = null;

            if (props.bookingId) {
            const booking = clientStore.getBookingById(props.bookingId);

            if (!booking?.confirmedOffer) {
                throw new Error('Confirmed offer was not found');
            }

            offer = booking.confirmedOffer;
            } else if (props.offerId) {
            offer = clientStore.getOfferById(props.offerId);

            if (!offer) {
                throw new Error('Offer was not found');
            }
            }

            if (!offer) {
            return;
            }

            /*
            * Tee koopia, et mitte muuta kogemata Pinia store'is
            * olevat algset offer-objekti.
            */
            const normalizedOffer = {
            ...offer
            };

            /*
            * Provider võib olla:
            * 1. juba täielik objekt;
            * 2. ainult MongoDB ObjectId string;
            * 3. üldse puudu.
            */
            const providerId =
            typeof offer.provider === 'string'
                ? offer.provider
                : offer.provider?._id;

            if (
            providerId &&
            typeof offer.provider !== 'object'
            ) {
            const provider =
                await providerService.getProvByProvId(providerId);

            normalizedOffer.provider = provider ?? null;
            } else {
            normalizedOffer.provider = offer.provider ?? null;
            }

            offerContent.value = normalizedOffer;
        } catch (error) {
            console.error('Failed to load offer content:', error);

            offerError.value =
            error instanceof Error
                ? error.message
                : 'Failed to load offer';
        } finally {
            isOfferLoading.value = false;
        }
        };

        watch(
        () => [props.bookingId, props.offerId],
        loadOfferContent,
        {
            immediate: true
        }
    );

    const emit = defineEmits(['quit-content', 'quit-content-confirmed', 'open-chat']);
    const back = () => {
        emit('quit-content');
        console.log("Yees")
    }

    const onChat = () => {
        console.log("Chat btn");
        console.log("offerContent - ", offerContent.value);
        console.log("otheruserId - ", offerContent.value?.sender);
        const otherId = offerContent.value?.sender;
        
        emit("open-chat", {
            otherId,
            bookingId: null,
            mode: "client",
            anchor: getBottomRightAnchor()
        });
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
            <span class="feedback-sender">${escapeHtml(f.sender || t('offerContent.unknown_sender'))}</span>
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