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
        <template #title>VIRHE LOMAKEELLA! </template>
        <button type="button" style="visibility: hidden;" class="btn-close ms-auto" aria-label="Close" @click="hideError"></button>
        <template #small></template>
        ⚠️ We couldn’t load Google Maps right now.
        Please check your network connection and try again later.
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
            Osoite:
          </td>
          <td>
            {{client.address}}
          </td>
        </tr>
        <tr>
          <td>
            Tarvitaan ammattilaista:
          </td>
          <td>
            {{client?.professional?.[0]}}

          </td>
        </tr>
        <tr>
          <td>
            Ajankohda:
          </td>
          <td>
            {{client.date}}
          </td>
        </tr>
        <tr>
          <td>
            Tehtävän kuvaus:
          </td>
          <td>
            {{client.description}}
          </td>
        </tr>
        <tr v-if="!client.isIncludeOffers">
          <td>
            Budjetti:
          </td>
          <td>
            {{client.budget ? `${client.budget.min} - ${client.budget.max} €` : "Ei budjettia"}}
          </td>
        </tr>
        <tr v-if="client.photos.length">
          <td>
            Kuvat tehtävästä:
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
            Etäisyys
          </td>
          <td>
            {{roadDistance}} km
          </td>
        </tr>
        <tr>
          <td>
            Matkan aikaa:
          </td>
          <td>
            {{roadDuration}}
          </td>
        </tr>
        <tr>
          <td>Sijainti</td>
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
        <tr>
          <td>

          </td>
          <td>
            <!-- <MDBBtn color="primary">
              <MDBIcon size="2x" ><i class="far fa-comment"></i></MDBIcon>
            </MDBBtn> -->
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
            Tee Hintatarjous
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
                    <MDBInput type="text" label="Tarjoa hintasi" @input="filterInput" :value="offerValueFiltered" v-model="offerPrice" wrapperClass="mb-4" />
                    <div style="text-align: left; margin-bottom: 10px;">
                      <MDBRadio
                          label="Tarjoan palvelu asiakkaan luona"
                          name="area"
                          v-model="offerPlace"
                          value="go"
                      >

                      </MDBRadio>
                      <MDBRadio
                          label="Tarjoan palvelua paikalla"
                          name="area"
                          v-model="offerPlace"
                          value="here"
                      >

                      </MDBRadio>
                    </div>


                    <MDBTextarea
                        style=""
                        label="Anna tarvittaessa lisäselvityksiä..."
                        rows="3"
                        v-model="offerAbout"
                    >

                    </MDBTextarea>
                    <MDBBtn
                        :disabled="isDisabled"
                        v-if="offerPrice"
                        label="Anna hintatarjous"
                        block size="lg"
                        outline="success"
                        style="margin-top: 12px;"
                        @click="createOffer"
                    >
                      Lähetä
                    </MDBBtn>
                  </form>

                  

                </div>
              </div>
            </div>
          </transition>


          

          <div>

          </div>

          <MDBBtn v-if="!isHandleOffer" :disabled="isDisabled" block outline="danger" @click="rejectFormBooking">
            Poista tilaus
          </MDBBtn>
 
          
          
          
        </div>
      </div>
      <!--:::With offers::-->
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
          Varmista tilaus
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
              label="Anna syy..."
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
            Varmista
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
          Poista tilaus
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
    confirm-text="Poista"
    cancel-text="Pidä se"
    :danger="true"
    @confirm="handleConfirmRemoveClientBooking"
    @cancel="handleCancelRemoving"
  />

  <ConfirmDealModal
    v-model="showDealConfirm"
    :title="'Sopimus!'"
    :message="dealMessage"
    confirm-text="Hienoa!"
    cancel-text="Peruuta"
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
/* defineProps({
  client: {type: Object, default: {}},
  open: {type: Boolean}
}) */

const _props = defineProps({
  client: { type: Object, default: () => ({}) },
  open: { type: Boolean, default: false },
  isDisabled: {type: Boolean}
})


const emit = defineEmits(['toast', 'just-test', "open-chat"])

const { client, open } = toRefs(_props)

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
// const _props = defineProps({
//   client: {type: Object, default: {}},
//   //parentCollapse: {type: null}
// })
const d = handleLocation;
const roadDistance = ref(null);
const roadDuration = ref(null);
const isHandleOffer = ref(false);
const { user } = storeToRefs(sender)
const { providerId, provider } = storeToRefs(proStore);
const { openChat } = storeToRefs(conversationStore);

const offerPrice = ref(null);
const offerPlace = ref('');
const offerAbout = ref('');
const reason = ref('');
const isQuitClientBooking = ref(false);

const offerValueFiltered = ref('');

//const isChatWindow = ref(false);

const isMapLoading = ref(true);


// const parentCollapse = ref(null); // <MDBCollapse> component
// const parentContent  = ref(null); // inner content we measure

const mapsError = ref(false);

const final = ref(null);

const loadingImages= ref({});

const profession = computed(() => _props.client?.professional?.[0]?.profession || '');
//const road = computed(async() => await d.findDistance([60.276451557679316, 24.858190796621688], [60.29733169999999, 25.0449442]))

const showDeleteModal = ref(false);
const cTitle = ref("");
const cMessage = ref("");

const showDealConfirm = ref(false);
const dealMessage = computed(() => {
  const clientName = client.value?.user?.firstName || 'asiakkaan';
  return `Olet vahvistamassa ${clientName} tilausta. Haluatko varmasti varmistaa tilauksen?`;
})

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

  /* requestAnimationFrame(() => {
    emit('resize-parent')
  }) */
}


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

  // Update input field directly
  event.target.value = filtered;
  offerValueFiltered.value = filtered;
})

/* function getChatWindowGeometry({ x, y, viewportW, viewportH, side }) {
  const isMobile = viewportW <= 640;

  const buttonW = 57;
  const buttonH = 67;
  const gap = 12;

  const sideMargin = isMobile ? 8 : 10;
  const topMargin = isMobile ? 8 : 10;
  const bottomMargin = isMobile ? 8 : 32;

  const winW = Math.min(360, viewportW - sideMargin * 2);
  const winH = Math.min(isMobile ? 420 : 520, viewportH - topMargin - bottomMargin);
  

  const leftOffset = side === "left"
    ? -winW - gap + buttonW
    : buttonW + gap;

  const topOffset = 0;

  return {
    buttonW,
    buttonH,
    gap,
    sideMargin,
    topMargin,
    bottomMargin,
    winW,
    winH,
    leftOffset,
    topOffset,
    absLeft: x + leftOffset,
    absTop: y + topOffset,
    absRight: x + leftOffset + winW,
    absBottom: y + topOffset + winH
  };
} */


/* const getBottomRightAnchor = () => {
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  const g = getChatWindowGeometry({
    x: viewportW,
    y: viewportH,
    viewportW,
    viewportH,
    side: "left",
  });

  return {
    x: viewportW - g.winW - g.sideMargin,
    y: viewportH - g.winH - g.bottomMargin,
    side: "left",
  };
}; */


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


  //conversationStore.openCreateRoom(otherId, client.value.id, "pro");
  //conversationStore.openChatWidget();
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


const createOffer = async () => {
  
  console.log("Creating offer! " + offerPrice.value);

  loading.value = true;

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
    provider: providerId.value
  }    
  console.log("Client in top: " + {client}.value);
  const addressee = client.value.author_id;
  console.log("Addressee - " + addressee);
  //clientStore.addOffer(client.value.id, offer);


  try {
    await proStore.addProviderOffer(client.value.id, addressee, offer);
    emit('toast', {
      state: "success",
      message: `${client.value?.user?.firstName} tilaus. Hintatarjous on lähetetty onnistuneesti!`,
      icon: "fas fa-check fa-lg me-2",
      color: "success"

    })
  } catch (error) {
    console.log("CL error " + error.message);
  } finally {
    loading.value = false;
  }
  
  //socket.emit('client get offer', addressee, client.value.id, offer);

}
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

  console.log("client user id: " + client.value.author_id);
  console.log("Client user name?? " + client.value.user.firstName);

  loading.value = true;

  const receiver = client.value.author_id;
  const myself = user.value.id;
  const bookingId = client.value.id;
  const header = "Sopimus tehty!";
  const clientContent = `${provider.value.pName} on vahvistanut tilauksen - "${client.value.header}". Tarkemmat tiedot kalenterissa!`;
  const proContent = `Tilaus "${client.value.header}" on vahvistettu. Tiedot kalenterissa!`;

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
    //provider: providerId.value
    provider: provider.value
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

  console.log('Button clicked in child')

  try {
    const confirmation = await clientService.updateRecipientStatus(bookingId, { status: 'confirmed' });
    const addConfirmation = await clientService.addConfirmedOffer(bookingId, {offer: offer, confirmed_provider_user_id: myself});

    if (!confirmation || !addConfirmation) return;
    emit('just-test');
    emit('toast', {
      state: "success",
      message: "Asiakkaan tilaus on varmistettu onnistuneesti!",
      icon: "fas fa-check fa-lg me-2",
      color: "success"

    })
    console.log('grandchild emitted')

    

    await proStore.onClientBooking(client.value.id, offer, myself, client.value.author_id, providerId.value, notes);

    socket.emit('pro-confirm-client', receiver, providerId.value);

    console.log('Child about to emit confirmed-order-toast (TEMP ALWAYS)')

    console.log('API results:', { confirmation, addConfirmation })
    //onCoToast("fas fa-check fa-lg me-2", `Asiakkaan tilaus on varmistettu onnistuneesti!`, "success");
    
  } catch (e) {
    console.error('API error in child:', e)
  } finally {
    loading.value = false;
  }
};

const cancelDeal = () => {
  showDealConfirm.value = false;
};  

// Removing client map offer
const confirmRejectMapBooking = async () => {
  showDeleteModal.value = true;
  cTitle.value = "Poistetaanko tilaus?";
  cMessage.value = "Oletko varma, että haluat poistaa asiakkaan tilauksen?";
  /* if (confirm("Oletko varmaa että tilaus poistetaan?")) {
    console.log("Quit offer user - " + client.value.author_id);
    console.log(Object.keys(client.value.user));
    const bookingId = client.value.id;
    const addressaat = client.value.author_id;
    const header = "Tilaus hylätty!"
    const noteContent = `${provider.value.pName} ei hyväksynyt lähettämääsi tilausta "${client.value.header}". Syyksi ilmoitettu: ${reason.value}!`;
    console.log("111")

    await proStore.removeMapOffer(bookingId, addressaat);
    console.log("222")
    await notificationStore.addNotification(bookingId, provider.value.pName, header, noteContent, addressaat);
  } else {
    console.log("Keskeytetty poistaminen!");
  } */
}

// Removing client form offer
const rejectFormBooking = async () => {
  showDeleteModal.value = true;
  cTitle.value = "Poistetaanko tilaus?";
  cMessage.value = "Oletko varma, että haluat poistaa asiakkaan tilauksen?";
  /* if (confirm("Oletko varmaa, että haluat poistaa tilauksen kokonaan?")) {
    isQuitClientBooking.value = true;
    console.log("Reject");
    const receiver = client.value.author_id;
    console.log("RECEIVER - " + receiver);
    await proStore.removeBookingPublicOffer(client.value.id, receiver);
  } else {
    console.log("Cancelled")
  } */
}

const handleConfirmRemoveClientBooking = async () => {
  console.log("Tilaus poisto confirmed!!!");
  const clientName = client.value?.user?.firstName || 'asiakkaan';
  const toastMessage = `${clientName} tilaus on poistettu!`;
  // removing only provider client booking not client itself
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
    //onCoToast("fas fa-check fa-lg me-2", `Asiakkaan tilaus on poistettu!`, "success");
    
  } else {
    console.log("Quit offer user - " + client.value.author_id);
    console.log(Object.keys(client.value.user));
    const bookingId = client.value.id;
    const addressaat = client.value.author_id;
    const header = "Tilaus hylätty!"
    const noteContent = `${provider.value.pName} ei hyväksynyt lähettämääsi tilausta "${client.value.header}". Syyksi ilmoitettu: ${reason.value}!`;
    
    console.log("111 - quit map offer")

    emit('toast', {
      state: "info",
      message: toastMessage,
      icon: "fas fa-info-circle fa-lg me-2",
      color: "info"

    })
    console.log('grandchild emitted')

    await proStore.removeMapOffer(bookingId, addressaat);
    console.log("222")
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
  height: 150px;       /* important! */
  overflow: hidden;    /* optional, keeps it clean in table cell */
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

/* .page-wrap{
  overflow-x: hidden;
} */

/* The actual map div must fill the container */
#client-location {
  width: 100%;
  height: 100%;        /* important! */
}

/* Overlay spinner */
.spinner-overlay {
  position: absolute;  /* overlay inside #map-container */
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
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden  ;
  
}




/* .spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ddd;
  border-top-color: #333;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
} */







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

</style>