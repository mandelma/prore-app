<template>
  <div>
    <div style="padding: 13px 0 20px 0;">
      <MDBToast
          v-model="mapsError"
          autohide
          :delay="3000"
          :stacking="false"
          position="top-center"
          toast="danger"
          icon="fas fa-exclamation-circle fa-lg me-2"
      >
        <template #title>{{ t('clientOffer.maps_error_title') }}</template>
        <button type="button" style="visibility: hidden;" class="btn-close ms-auto" aria-label="Close" @click="hideError"></button>
        <template #small></template>
          {{t('clientOffer.maps_error_message')}}
      </MDBToast>
    </div>

    <div v-if="!client.professional && !road">
      <MDBSpinner color="info" />
    </div>
    <div v-else style="border-top: 1px solid grey; width: 100%; background-color: #1a1a1a; padding: 13px; border-radius: 5px;">
      <h5 style="color: #dddddd; margin-bottom: 20px;">
        {{client.header}}
      </h5>
      <MDBTable borderless class="booking-table--stack" style="font-size: 12px; color: #dddddd; text-align: left;">
        <tbody>
        <tr>
          <td>
            {{ t('clientOffer.address') }}
          </td>
          <td>
            {{client.address}}
          </td>
        </tr>
        <tr>
          <td>
            {{ t('clientOffer.professional_needed') }}
          </td>
          <td>
            {{client?.professional?.[0]}}

          </td>
        </tr>
        <tr>
          <td>
            {{ t('clientOffer.date') }}
          </td>
          <td>
            {{formatDateTime(client.created, locale)}}
          </td>
        </tr>
        <tr>
          <td>
            {{ t('clientOffer.description') }}
          </td>
          <td>
            {{client.description}}
          </td>
        </tr>


        <tr v-if="client.customFields.length">
          <td>
            {{ t('clientOffer.additional_details') }}
          </td>

          <td>
            <MDBBtn
              type="button"
              outline
              color="info"
              size="sm"
              @click="showCustomFields = !showCustomFields"
            >
              {{
                showCustomFields
                  ? t('clientOffer.hide_details')
                  : t('clientOffer.show_details')
              }}
            </MDBBtn>
          </td>
        </tr>

        <tr v-if="showCustomFields && client.customFields.length">
          <td colspan="2">
            <div class="custom-fields-panel">
              <div
                v-for="field in displayCustomFields"
                :key="field.key"
                class="custom-field-row"
              >
                <span class="custom-field-label">
                  {{ getLocalizedValue(field.label) }}
                </span>

                <span class="custom-field-value">
                  {{ getCustomFieldDisplayValue(field) }}
                </span>
              </div>
            </div>
          </td>
        </tr>




        <tr v-if="client.isBudget">
          <td>
            {{ t('clientOffer.budget') }}
          </td>
          <td>
            {{client.budget ? `${client.budget.min} - ${client.budget.max} €` : t('clientOffer.no_budget')}}
          </td>
        </tr>
        <tr v-if="client.photos.length">
          <td>
            {{ t('clientOffer.photos') }}
          </td>
          <td>
            <!-- class="photo-media" -->
             <!-- @load="loadingImages[idx] = false"
                        @error="loadingImages[idx] = false" -->
            <div >
              <MDBLightbox> 
                <MDBRow class="g-2 mx-0">
                  <MDBCol
                    col="6" 
                    md="4"
                    v-for="(photo, idx) in client.photos"
                    :key="idx"
                    class="px-1"
                  >
                    <div class="lightbox-thumb">
                      <div v-if="loadingImages[idx]" class="spinner"></div>
                      <MDBLightboxItem
                        :src="photo.imageUrl || photo.imageId.imageUrl || photo.previewUrl"
                        :fullScreenSrc="photo.imageUrl || photo.imageId.imageUrl || photo.previewUrl"
                        :caption="photo.text || ''"
                        alt="Booking photo"
                        @load="handleImageLoaded(idx)"
                        @error="handleImageLoaded(idx)"
                      />
                      <!-- <div v-if="photo.text !== ''" class="photo-overlay">
                
                        <p>{{ photo.text }}</p>
                      </div> -->
                    </div>
                  </MDBCol>
                </MDBRow>
              </MDBLightbox>
            </div>
            
          </td>
        </tr>
        <tr>
          <td>
            {{ t('clientOffer.distance') }}
          </td>
          <td>
            {{roadDistance}} km
          </td>
        </tr>
        <tr>
          <td>
            {{ t('clientOffer.travel_time') }}
          </td>
          <td>
            {{roadDuration}}
          </td>
        </tr>
        <tr>
          <td>{{ t('clientOffer.location') }}</td>
          <td>
            <div id="map-container">
              <div id="client-location"></div>

              <!-- overlay while map is loading -->
              <div id="spinner" class="spinner-overlay">
                <div class="spinner"></div>
              </div>
            </div>
          </td>
        </tr>
        
        </tbody>
      </MDBTable>
      <div v-if="!openChat" style="display: flex; justify-content: right;">
        <MDBBtn :disabled="isDisabled" color="primary" class="mb-3" @click="onChat">
          <MDBIcon size="2x" ><i class="far fa-comment"></i></MDBIcon>
        </MDBBtn>

        
      </div>
      
      <div v-if="client.isIncludeOffers" class="offer-actions" >
        <div v-if="!client.offers.some(offer => offer.bookingID === client.id && offer.provider.id === providerId)">
          <MDBBtn
              :disabled="isDisabled"
              class="mb-3"
              block
              color="primary"
              size="lg"
              @click="makeOfferBtn(booking)"
          >
            {{ t('clientOffer.make_offer') }}
          </MDBBtn>

          <transition
              name="fade-slide"
              @before-enter="onResize"
              @enter="onResize"
              @after-enter="onUnlock"
              @before-leave="onResize"
              @leave="onResize"
              @after-leave="onUnlock"
          >
            <!-- class=" card card-body" -->
            <div v-show="isHandleOffer" >
              <div class="mt-3">
                <div  style="padding: 13px; ; font-size: 14px; margin-bottom: 20px;">
                  <div class="close-btn-wrap">
                    <MDBBtnClose white @click="isHandleOffer = false"/>
                  </div>

                  <form class="form-card">
                    <div class="offer-field">
                      <MDBInput 
                        style="margin-bottom: 5px;"
                        type="text" 
                        :label="t('clientOffer.offer_price')" 
                        @input="filterInput" 
                        :value="offerValueFiltered" 
                        v-model="offerPrice" 
                        
                      />
                      <span v-if="offerPriceWarning" class="text-danger">{{ t('clientOffer.offerExceedsBudget') }}</span>
                    </div>
                    
                    
                    <!-- <MDBInput
                      v-model="filteredOfferPrice"
                      type="text"
                      inputmode="decimal"
                      :label="t('clientOffer.offer_price')"
                      wrapperClass="mb-4"
                    /> -->
                    <div style="text-align: left; margin-bottom: 17px;">
                      <MDBRadio
                          :label="t('clientOffer.offer_at_client')"
                          name="area"
                          v-model="offerPlace"
                          value="go"
                      >

                      </MDBRadio>
                      <MDBRadio
                          :label="t('clientOffer.offer_at_my_place')"
                          name="area"
                          v-model="offerPlace"
                          value="here"
                      >

                      </MDBRadio>
                    </div>


                    <MDBTextarea
                        style=""
                        :label="t('clientOffer.offer_details')"
                        rows="3"
                        v-model="offerAbout"
                    >

                    </MDBTextarea>
                    <MDBBtn
                        :disabled="isDisabled"
                        v-if="offerPrice"
                        :label="t('clientOffer.make_offer')"
                        block size="lg"
                        outline="success"
                        style="margin-top: 12px;"
                        @click="createOffer"
                    >
                      {{ t('clientOffer.send_offer') }}
                    </MDBBtn>
                  </form>

                </div>
              </div>
            </div>
          </transition>

          <div>

          </div>

          <MDBBtn v-if="!isHandleOffer" :disabled="isDisabled" block outline="danger" @click="rejectFormBooking">
            {{ t('clientOffer.delete_order') }}
          </MDBBtn>
 
        </div>
      </div>
      <!--::With offers::-->
      <div v-else class="offer-actions" >
        <!--    <MDBBtn outline="success" block size="lg" @click="isQuitClientBooking = true">Varmista tilaus</MDBBtn>-->

        <MDBBtn
            v-if="!isQuitClientBooking"
            :disabled="isDisabled"
            block
            outline="success"
            size="lg"
            @click="confirmClientBooking()"
        >
            {{ t('clientOffer.confirm_order') }}
        </MDBBtn>

        <transition
            name="fade-slide"
            @before-enter="onResize"
            @enter="onResize"
            @after-enter="onUnlock"
            @before-leave="onResize"
            @leave="onResize"
            @after-leave="onUnlock"
          >
          <div v-if="isQuitClientBooking" style="padding: 13px; margin-top: 13px; border: 1px solid grey;" class="form-card">
          <div style="display: flex; justify-content: right; margin-bottom: 7px;">
            <MDBBtnClose white @click="undoRejectMapOffer"/>
          </div>

          <MDBTextarea
              style=""
              :label="t('clientOffer.reason')"
              rows="3"
              v-model="reason"
          >

          </MDBTextarea>
          <MDBBtn
              :disabled="reason.length < 3"
              block size="lg"
              color="success"
              style="margin-top: 12px;"
              @click="confirmRejectMapBooking"
          >
            {{ t('clientOffer.confirm_delete') }}
          </MDBBtn>
        </div>
        </transition>

        
<!--        :disabled="isDisableProNotMapBtns"-->
        <MDBBtn
            v-if="!isQuitClientBooking"
            
            :disabled="isDisabled"
            block
            outline="danger"
            size="lg"
            @click="quitMapOffer"
        >
          {{ t('clientOffer.delete_order') }}
        </MDBBtn>

        <!-- Spinner test -->
        <!-- <button @click="handleOrder">Place Order</button> -->

      </div>
    </div>

    

  </div>

  <ConfirmModal
    v-model="showDeleteModal"
    :title="cTitle"
    :message="cMessage"
    :confirm-text="t('clientOffer.deal_cancel_button')"
    :cancel-text="t('clientOffer.keep_button')"
    :danger="true"
    @confirm="handleConfirmRemoveClientBooking"
    @cancel="handleCancelRemoving"
  />

  <ConfirmDealModal
    v-model="showDealConfirm"
    :title="t('clientOffer.deal_title')"
    :message="dealMessage"
    :confirm-text="t('clientOffer.deal_confirm_button')"
    :cancel-text="t('clientOffer.deal_cancel_button')"
    :show-icon="true"
    @confirm= "confirmDeal"
    @cancel="cancelDeal" 
  />

  <!-- Overlay -->
    <div v-if="loading" class="on-overlay">
      <div class="on-spinner"></div>
    </div>
</template>

<script setup>
import {
  MDBTable, 
  MDBToast, 
  MDBBtn, 
  MDBSpinner, 
  MDBBtnClose, 
  MDBTextarea, 
  MDBInput, 
  MDBRadio, 
  MDBIcon, 
  MDBCollapse, 
  MDBPopconfirm,
  MDBRow,
  MDBCol,
  MDBLightbox,
  MDBLightboxItem
} from 'mdb-vue-ui-kit';
import { ref, nextTick, inject, toRefs, onMounted, onUnmounted, watch, computed } from 'vue';
import ConfirmModal from '../helpers/ConfirmModal.vue';
import ConfirmDealModal from '../helpers/ConfirmDealModal.vue';

import { useI18n } from 'vue-i18n';

import { formatDateTime } from '../helpers/datei18n.js';

import handleLocation from '../controllers/distance.js';
import { useNotificationStore } from '@/stores/notificationStore.js';
import { useConversationStore } from '@/stores/conversationStore.js';
import { useProStore } from '@/stores/providerStore.js';
import { useClientStore } from '@/stores/recipientStore.js';
import { useLoginStore } from '@/stores/login.js';
import { storeToRefs } from 'pinia';
import clientService from '@/service/recipients.js';
//import ChatWidget from '../ChatWidget.vue';
import socket from "@/socket";
import {loadGoogleMaps} from '../controllers/loadGoogleMap.js'
import { getChatWindowGeometry, getBottomRightAnchor } from '../helpers/chatGeometry.js';

defineOptions({
  name: 'client-offer'
});

const _props = defineProps({
  client: { type: Object, default: () => ({}) },
  open: { type: Boolean, default: false },
  isDisabled: {type: Boolean}
})


const emit = defineEmits(['toast', 'just-test', 'parent-open', 'handle-user-action', "open-chat"])

const { client, open } = toRefs(_props)
const { t, locale } = useI18n();
const sender = useLoginStore();
const notificationStore = useNotificationStore();
const conversationStore = useConversationStore();
const proStore = useProStore();
const clientStore = useClientStore();


const resizeParent = inject('resizeParent')
const unlockParent = inject('unlockParent')

// tiny wrappers (defensive)
function onResize () { if (typeof resizeParent === 'function') resizeParent() }
function onUnlock () { if (typeof unlockParent === 'function') unlockParent() }

const d = handleLocation;
const roadDistance = ref(null);
const roadDuration = ref(null);
const isHandleOffer = ref(false);
const { user } = storeToRefs(sender)
const { providerId, provider } = storeToRefs(proStore);
const { openChat } = storeToRefs(conversationStore);

const offerPrice = ref(null);
const offerPlace = ref('here');
const offerAbout = ref('');
const reason = ref('');
const isQuitClientBooking = ref(false);

const offerValueFiltered = ref('');

//const isChatWindow = ref(false);

const isMapLoading = ref(true);

const mapsError = ref(false);

const final = ref(null);

const loadingImages= ref({});

const profession = computed(() => _props.client?.professional?.[0]?.profession || '');
const offerPriceWarning = ref(false);
const showDeleteModal = ref(false);
const cTitle = ref("");
const cMessage = ref("");

const showCustomFields = ref(false);
const showDealConfirm = ref(false);

const dealMessage = computed(() =>
  t('clientOffer.deal_confirm', {
    name: client.value?.user?.firstName || ''
  })
)

onMounted(async() => {
  await validateMaps();
})

onUnmounted(() => {
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
});

watch(
  () => client.value?.photos,
  (photos) => {
    if (!photos) return;
    const newState = {};
    photos.forEach((_, idx) => {
      newState[idx] = true;
    })

    loadingImages.value = newState;
  },
  { immediate: true}
)

function handleImageLoaded(idx) {
  loadingImages.value[idx] = false

  onResize();

}

const bookingDetails = () => {
  console.log("Get booking details")
}

const displayCustomFields = computed(() => {
  if (!Array.isArray(_props.client?.customFields)) {
    return [];
  }

  return _props.client.customFields.filter(field => {
    const value = field.value;

    // Block to display textarea description
    if (field.type === 'textarea') return;

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== null &&
      value !== undefined &&
      value !== '';
  });
});

// Booking custom fields data display
const getCustomFieldDisplayValue = field => {
  const value = field?.value;

  const selectedOptions = Array.isArray(field?.selectedOptions)
    ? field.selectedOptions
    : [];

  switch (field?.type) {
    case 'boolean':
    case 'checkbox':
      return value
        ? t('clientOffer.common.yes')
        : t('clientOffer.common.no');

    case 'select':
    case 'multiselect':
      if (selectedOptions.length) {
        return selectedOptions
          .map(option => getLocalizedValue(option.label))
          .filter(Boolean)
          .join(', ');
      }

      return Array.isArray(value)
        ? value.join(', ')
        : String(value ?? '');

    case 'textarea': // block textarea value
      return

    default:
      if (Array.isArray(value)) {
        return value.join(', ');
      }

      return String(value ?? '');
  }
};

const getLocalizedValue = translations => {
  if (!translations) {
    return "";
  }

  return (
    translations[locale.value] ||
    translations.en ||
    translations.fi ||
    Object.values(translations).find(Boolean) ||
    ""
  );
};


const validateMaps = async() => {
  try {
    await loadGoogleMaps(); // your existing loader
    console.log("Map is inited in ClientOffer! ✅");

    console.log("CXC " + await d.findDistance([provider.value.latitude, provider.value.longitude], [client.value.latitude, client.value.longitude]));

    const road = await d.findDistance([provider.value.latitude, provider.value.longitude], [client.value.latitude, client.value.longitude]);

    if (road) {
      console.log("Distance is " + road.distance);
      console.log("Duration is " + road.duration);
      roadDistance.value = road.distance;
      roadDuration.value = road.duration;
    }

    const mapEl = document.getElementById("client-location");
    if (!mapEl) {
      throw new Error("#client-location not found in DOM");
    }

    const map = new google.maps.Map(mapEl, {
      zoom: 11,
      center: new google.maps.LatLng(
        client.value.latitude,
        client.value.longitude
      ),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    // optional: add a marker at the client location
    new google.maps.Marker({
      position: {
        lat: client.value.latitude,
        lng: client.value.longitude,
      },
      map,
    });

    // hide spinner when map is idle (fully rendered)
    google.maps.event.addListenerOnce(map, "idle", () => {
      const spinner = document.getElementById("spinner");
      if (spinner) spinner.style.display = "none";
    });
  } catch (err) {
    console.error("Google Maps failed to load ❌", err);
    mapsError.value = true;
    const spinner = document.getElementById("spinner");
    if (spinner) spinner.style.display = "none";
  }
}

const onCoToast = (icon, content, color) => {
  console.log("Toast works?")
  toastState.value = color;
  toastIcon.value = icon;
  toastContent.value = content;
  toastModel.value = true;
}

// for priceoffer validation with number input
/* watch(offerPrice, (value) => {
  if (value > 100) offerPrice.value = 100;
  if (value < 0) offerPrice.value = 0;
}); */

const MAX_PRICE = 100;

const filteredOfferPrice = computed({
  get() {
    return offerPrice.value;
  },

  set(value) {
    let filtered = String(value ?? "")
      .replace(",", ".")
      .replace(/[^0-9.]/g, "");

    // Lubab ainult ühe punkti
    const dotIndex = filtered.indexOf(".");

    if (dotIndex !== -1) {
      filtered =
        filtered.slice(0, dotIndex + 1) +
        filtered.slice(dotIndex + 1).replace(/\./g, "");
    }

    // ".5" → "0.5"
    if (filtered.startsWith(".")) {
      filtered = `0${filtered}`;
    }

    // Maksimaalselt kaks komakohta
    const [integerPart, decimalPart] = filtered.split(".");

    if (decimalPart !== undefined) {
      filtered = `${integerPart}.${decimalPart.slice(0, 2)}`;
    }

    const numericValue = Number(filtered);

    if (
      filtered !== "" &&
      Number.isFinite(numericValue) &&
      numericValue > MAX_PRICE
    ) {
      filtered = String(MAX_PRICE);
    }

    offerPrice.value = filtered;
  }
});


// For priceoffer with text input
const filterInput = ref((event) => {
  // Filter out non-digit characters
  const raw = event.target.value;

  // Only allow digits and a single dot
  let filtered = raw.replace(/[^0-9.]/g, '');

  // Only allow one dot
  const parts = filtered.split('.');
  if (parts.length > 2) {
    filtered = parts[0] + '.' + parts.slice(1).join('');
  }

  // Prevent leading dot (e.g., ".5" becomes "0.5")
  if (filtered.startsWith('.')) {
    filtered = '0' + filtered;
  }

  

  if (client.value.isBudget) {
    const maxPrice = client.value.isBudget ? client.value.budget.max : null;
    if (filtered > maxPrice) {
      filtered = maxPrice;
      offerPriceWarning.value = true;
      setTimeout(() => {
        offerPriceWarning.value = false;
      }, 3000)
    } 
  }
  

  // Update input field directly
  event.target.value = filtered;
  offerValueFiltered.value = filtered;
})

const onChat = async () => {
  console.log("Chat btn");
  console.log("otheruserId - ", client.value.author_id);
  const otherId = client.value.author_id;

  emit("open-chat", {
    otherId,
    bookingId: client.value.id,
    mode: "pro",
    anchor: getBottomRightAnchor()
  });
}

const makeOfferBtn = () => {
  console.log("Make offer!");
  isHandleOffer.value = true;
}

const loading = ref(false);

watch(loading, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
  document.documentElement.style.overflow = val ? 'hidden' : '';
});

async function handleOrder() {
  loading.value = true;

  try {
    await fakeApiCall();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

// simulate API
function fakeApiCall() {
  return new Promise((resolve) => setTimeout(resolve, 2000));
}

const clearPriceofferFields = () => {
  offerAbout.value = "";
  offerPlace.value = "";
  offerPrice.value = null;
}

const createOffer = async () => {
  if (loading.value) return;

  const price = Number(offerPrice.value);

  if (!Number.isFinite(price) || price <= 0) {
    emit("toast", {
      state: "warning",
      message: t(
        "clientOffer.notifications.invalid_offer_price"
      ),
      icon: "fas fa-exclamation-triangle fa-lg me-2",
      color: "warning"
    });

    return;
  }

  loading.value = true;

  const offer = {
    bookingID: client.value.id,
    sender: user.value.id,
    isNewOffer: true,
    name: provider.value.pName,
    placeOrGo: offerPlace.value,
    area: client.value.zone,
    cAddress: client.value.address,
    pAddress: provider.value.address,
    distance: roadDistance?.value,
    duration: roadDuration?.value,
    price,
    description: offerAbout.value,
    place: offerPlace.value,
    provider: providerId.value
  };

  const addressee = client.value.author_id;

  try {
    const result = await proStore.addProviderOffer(
      client.value.id,
      offer
    );

    if (!result?.success) {
      throw new Error("Offer creation failed.");
    }

    emit("toast", {
      state: "success",
      message: t(
        "clientOffer.notifications.offer_sent",
        {
          name: client.value?.user?.firstName || ""
        }
      ),
      icon: "fas fa-check fa-lg me-2",
      color: "success"
    });

    emit('parent-open');
    emit("handle-user-action");

    socket.emit(
      "client get offer",
      addressee,
      client.value.id,
      result.offer
    );
  } catch (error) {
    console.error("Offer creation failed:", error);

    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (
      status === 409 &&
      code === "MAX_OFFERS_REACHED"
    ) {
      emit("toast", {
        state: "warning",
        message: t(
          "clientOffer.notifications.offer_limit_reached"
        ),
        icon: "fas fa-exclamation-triangle fa-lg me-2",
        color: "warning"
      });
      
      await proStore.removeLocalBooking(client.value.id);
      //emit("handle-user-action");
      return;
    }

    if (
      status === 409 &&
      code === "BOOKING_NOT_ACTIVE"
    ) {
      emit("toast", {
        state: "warning",
        message: t(
          "clientOffer.notifications.booking_not_active"
        ),
        icon: "fas fa-exclamation-triangle fa-lg me-2",
        color: "warning"
      });

      clearPriceofferFields();

      emit("handle-user-action");
      return;
    }

    emit("toast", {
      state: "danger",
      message: t(
        "clientOffer.notifications.offer_failed"
      ),
      icon: "fas fa-times fa-lg me-2",
      color: "danger"
    });
    clearPriceofferFields();
  } finally {
    loading.value = false;
  }
};

// On single offer from map
const quitMapOffer = async () => {
  isQuitClientBooking.value = true;
  
}

const undoRejectMapOffer = () => {
  isQuitClientBooking.value = false;
  reason.value = "";
}

const confirmClientBooking = async () => {
  showDealConfirm.value = true;
}

const confirmDeal = async () => {
  loading.value = true;
  const bookingId = client.value.id;
  const receiver = client.value.author_id;
  const myself = user.value.id;
  
  const header = t('clientOffer.notifications.deal_created_title');
  const clientContent = t('clientOffer.notifications.deal_created_client', {
    provider: provider.value.pName,
    booking: client.value.header
  })
  const proContent = t('clientOffer.notifications.deal_created_provider', {
    booking: client.value.header
  });

  const offer = {
    bookingID: client.value.id,
    sender: user.value.id,
    isNewOffer: true,
    name: provider.value.pName,
    placeOrGo: offerPlace.value,
    area: client.value.zone,
    distance: roadDistance?.value,
    duration: roadDuration?.value,
    price: offerPrice.value,
    description: offerAbout.value,
    place: offerPlace.value,
    budget: client.value.budget,
  }    

  const notificationForClient = {
      bookingId: bookingId,
      isNewMsg: true,
      isLink: true,
      title: header,
      content: clientContent,
      reason: '',
      sender: provider.value.pName,
  };

  const notificationForPro = {
      bookingId: bookingId,
      isNewMsg: true,
      isLink: true,
      title: header,
      content: proContent,
      reason: '',
      sender: provider.value.pName,
  };

  const notes = {
    cNote: notificationForClient,
    pNote: notificationForPro

  }
  try {
    const confirmation =
      await clientService.confirmOffer(bookingId, {
        offer,
        confirmed_provider_user_id: myself
      });

    if (!confirmation?.success) {
      return;
    }

    emit("handle-user-action");

    emit("toast", {
      state: "success",
      message: t(
        "clientOffer.notifications.order_confirmed"
      ),
      icon: "fas fa-check fa-lg me-2",
      color: "success"
    });

    await proStore.onClientBooking(
      client.value.id,
      offer,
      myself,
      client.value.author_id,
      providerId.value,
      notes
    );

    socket.emit(
      "pro-confirm-client",
      receiver,
      providerId.value
    );
  } catch (error) {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (
      status === 409 &&
      code === "BOOKING_ALREADY_CONFIRMED"
    ) {
      emit("toast", {
        state: "warning",
        message: t(
          "clientOffer.notifications.already_confirmed"
        ),
        icon: "fas fa-exclamation-triangle fa-lg me-2",
        color: "warning"
      });

      emit("handle-user-action");
      return;
    }

    console.error("API error in child:", error);

    emit("toast", {
      state: "danger",
      message: t(
        "clientOffer.notifications.confirmation_failed"
      ),
      icon: "fas fa-times fa-lg me-2",
      color: "danger"
    });
  } finally {
    loading.value = false;
  }
}

const cancelDeal = () => {
  showDealConfirm.value = false;
};  

// Removing client map offer
const confirmRejectMapBooking = async () => {
  showDeleteModal.value = true;
  cTitle.value = t('clientOffer.delete_title');
  cMessage.value = t(clientOffer.delete_message);
  
}

// Removing client form offer
const rejectFormBooking = async () => {
  showDeleteModal.value = true;
  cTitle.value = t('clientOffer.delete_title');
  cMessage.value = t('clientOffer.delete_message');
 
}

// Removing booking after confirmation done
const handleConfirmRemoveClientBooking = async () => {
  console.log("Tilaus poisto confirmed!!!");
  const clientName = client.value?.user?.firstName || 'asiakkaan';
  const toastMessage = t('clientOffer.notifications.order_removed', {
    name: clientName
  });
  // Removing form booking
  if (client.value.isIncludeOffers) {
    isQuitClientBooking.value = true;
    console.log("Reject form booking--");
    const receiver = client.value.author_id;
    console.log("RECEIVER - " + receiver);
    emit('toast', {
      state: "info",
      message: toastMessage,
      icon: "fas fa-info-circle fa-lg me-2",
      color: "info"

    })
    console.log('grandchild emitted')
    await proStore.removeBookingPublicOffer(client.value.id, receiver);
    emit('handle-user-action');
    //onCoToast("fas fa-check fa-lg me-2", `Asiakkaan tilaus on poistettu!`, "success");
    
  } else {
    // removing map booking
    console.log("Quit offer user - " + client.value.author_id);
    console.log(Object.keys(client.value.user));
    const bookingId = client.value.id;
    const addressaat = client.value.author_id;
    const header = t('clientOffer.notifications.order_rejected_title');
    const noteContent = t('clientOffer.notifications.order_rejected', {
      provider: provider.value.pName,
      booking: client.value.header,
      reason: reason.value
    });
    
    console.log("111 - quit map offer")
    
    emit('toast', {
      state: "info",
      message: toastMessage,
      icon: "fas fa-info-circle fa-lg me-2",
      color: "info"

    })
    console.log('grandchild emitted')

    await proStore.removeMapOffer(bookingId, addressaat);
    emit('handle-user-action');
  
    await notificationStore.addNotification(bookingId, provider.value.pName, header, noteContent, addressaat);
    //onCoToast("fas fa-check fa-lg me-2", `Asiakkaan tilaus on poistettu!`, "success");
    
  }
}

const handleCancelRemoving = () => {
  console.log('Remove cancelled');
  undoRejectMapOffer();

}

</script>

<style scoped>

.fade-slide-enter-active, .fade-slide-leave-active { transition: all .2s ease; }
.fade-slide-enter-from,  .fade-slide-leave-to      { opacity: 0; transform: translateY(-4px); }

/* Small map container (e.g. 150x150 px) */
#map-container {
  position: relative;
  width: 150px;
  height: 150px;
  overflow: hidden;
}

@media (max-width: 470px){
  .booking-table--stack tbody tr{
    display: block;
    padding: .5rem 0;
    border-bottom: 1px solid rgba(255,255,255,.08);
  }

  .booking-table--stack tbody td{
    display: block;
    width: 100%;
    padding: .2rem 0;
  }

  /* first td becomes the label */
  .booking-table--stack tbody td:first-child{
    font-weight: 600;
    opacity: .9;
  }
}

/* The actual map div must fill the container */
#client-location {
  width: 100%;
  height: 100%;        /* important! */
}

/* Overlay spinner */
.spinner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0b1618;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* Booking custom fields */
.custom-fields-panel {
  margin-top: 6px;
  padding: 14px;
  border: 1px solid #3e4654;
  border-radius: 7px;
  background: #202633;
}

.custom-field-row {
  display: grid;
  grid-template-columns: minmax(130px, 40%) 1fr;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.custom-field-row:last-child {
  border-bottom: none;
}

.custom-field-label {
  color: #aeb7c5;
  font-weight: 600;
}

.custom-field-value {
  color: #f1f3f5;
  overflow-wrap: anywhere;
}

@media (max-width: 576px) {
  .custom-field-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

/* Photos */
.photos-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.photo-card {
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,.10);
  background: rgba(0,0,0,.02);
}

.photo-img {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

.lightbox-thumb{
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 8px;
}

.lightbox-thumb img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-media {
  position: relative;
}

.photo-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  background: rgba(0, 0, 0, 0.5);
  
  padding: 6px;
  border-radius: 0 0 8px 8px;
  font-size: 13px;
}

.photo-overlay p {
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
}

.spinner {
  width: 30px;
  height: 30px;
  border: 4px solid #ccc;
  border-top-color: #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


/* Popconfirm button color */
:deep(.pc-trigger-danger.btn-primary),
:deep(.pc-trigger-danger.btn-primary:hover),
:deep(.pc-trigger-danger.btn-primary:focus),
:deep(.pc-trigger-danger.btn-primary:active) {
background-color: #e05b69 !important;
border-color: #dc3545 !important;
box-shadow: 0 4px 9px -4px rgba(220, 53, 69, 0.55) !important;
}



.client-collapse {
  overflow: visible !important;
}

.client-collapse.collapse.show {
  height: auto !important;
  overflow: visible !important;
}

.client-collapse .card-body {
  overflow: visible;
  padding-bottom: 24px;
}




.offer-actions {
  width: 100%;
  /* margin-bottom: 20px; */
  padding-bottom: 24px;
}

.offer-field {
  margin-bottom: 13px;
}

@media (max-width: 767px) {
  .offer-actions {
    width: 100%;
    padding: 0 0 16px 0;
  }

.offer-actions .btn:not(.btn-close) {
  width: 100%;
}

  .offer-actions .form-card {
    width: 100%;
  }
}

.close-btn-wrap {
  display: flex;
  justify-content: flex-end; /* desktop = right */
  margin-bottom: 13px;
}

@media (max-width: 767px) {
  .close-btn-wrap {
    justify-content: flex-end; /* mobile = center */
  }
}

.spinner-overlay,
.on-overlay {
  pointer-events: none;
}

</style>