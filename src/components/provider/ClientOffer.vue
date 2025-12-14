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
    <div v-else style="border-top: 1px solid grey;">

      <MDBTable borderless style="font-size: 12px; color: #dddddd; text-align: left;">
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
        <tr>
          <td>
            Kuvat tehtävästä:
          </td>
          <td>

          </td>
        </tr>
        <tr>
          <td>
            Etäisyys
          </td>
          <td>
            {{roadDistance}}
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
      <div style="display: flex; justify-content: right;">
        <MDBBtn :disabled="isDisabled" color="primary" class="mb-3" @click="onChat">
          <MDBIcon size="2x" ><i class="far fa-comment"></i></MDBIcon>
        </MDBBtn>
      </div>
      <div v-if="client.isIncludeOffers" style="margin-bottom: 20px;">
        <div v-if="!client.offers.some(offer => offer.bookingID === client.id)">
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
            <div v-show="isHandleOffer"  class=" card card-body">
              <div class="mt-3">
                <div  style="padding: 13px; ; font-size: 14px; margin-bottom: 20px;">
                  <div style="display: flex; justify-content: right; margin-bottom: 13px;">
                    <MDBBtnClose white @click="isHandleOffer = false"/>
                  </div>

                  <form class="form-card">
                    <MDBInput type="number" label="Tarjoa hintasi" v-model="offerPrice" wrapperClass="mb-4" />
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
      <div v-else style="margin-bottom: 20px;">
        <!--    <MDBBtn outline="success" block size="lg" @click="isQuitClientBooking = true">Varmista tilaus</MDBBtn>-->

        <MDBBtn
            v-if="!isQuitClientBooking"
            :disabled="isDisableProNotMapBtns"
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
            
            block
            outline="danger"
            size="lg"
            @click="quitMapOffer"
        >
          Poista tilaus
        </MDBBtn>

      </div>
    </div>

  </div>
</template>

<script setup>
import {MDBTable, MDBToast, MDBBtn, MDBSpinner, MDBBtnClose, MDBTextarea, MDBInput, MDBRadio, MDBIcon, MDBCollapse, MDBPopconfirm} from 'mdb-vue-ui-kit';
import { ref, nextTick, inject, toRefs, onMounted, computed } from 'vue';
import handleLocation from '../controllers/distance.js';
import { useNotificationStore } from '@/stores/notificationStore.js';
import { useProStore } from '@/stores/providerStore.js';
import { useClientStore } from '@/stores/recipientStore.js';
import { useLoginStore } from '@/stores/login.js';
import { storeToRefs } from 'pinia';
import clientService from '@/service/recipients.js';
import socket from "@/socket";
import {loadGoogleMaps} from '../controllers/loadGoogleMap.js'

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

const emit = defineEmits(['confirmed-order-toast', 'just-test'])

const { client, open } = toRefs(_props)

const sender = useLoginStore();
const notificationStore = useNotificationStore();
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
const offerPrice = ref(null);
const offerPlace = ref('here');
const offerAbout = ref('');
const reason = ref('');
const isQuitClientBooking = ref(false);

const isMapLoading = ref(true);


// const parentCollapse = ref(null); // <MDBCollapse> component
// const parentContent  = ref(null); // inner content we measure

const mapsError = ref(false);

const final = ref(null);

const profession = computed(() => _props.client?.professional?.[0]?.profession || '');
//const road = computed(async() => await d.findDistance([60.276451557679316, 24.858190796621688], [60.29733169999999, 25.0449442]))




onMounted(async() => {
  await validateMaps();
  // if (!window.google) {
  //   await loadGoogleMaps();
  //   console.log("Map is inited in ClientOffer!");
  // }

  
  //console.log("Distance is " + final.value.distance);
  //console.log("Duration is " + final.value.duration);

})
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

const onChat = () => {
  console.log("Chat btn");
}

const makeOfferBtn = () => {
  console.log("Make offer!");
  isHandleOffer.value = true;
}
const createOffer = () => {
  
  console.log("Creating offer! " + offerPrice.value);


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
  proStore.addProviderOffer(client.value.id, addressee, offer);
  //socket.emit('client get offer', addressee, client.value.id, offer);

}
// On single offer from map
const quitMapOffer = async () => {
  isQuitClientBooking.value = true;
  
}

const confirmRejectMapBooking = async () => {
  if (confirm("Oletko varmaa että tilaus poistetaan?")) {
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
  }
}

const undoRejectMapOffer = () => {
  isQuitClientBooking.value = false;
  reason.value = "";
}

const confirmClientBooking = async () => {
  // author_id ???
  console.log("client user id: " + client.value.author_id);
  console.log("Client user name?? " + client.value.user.firstName);
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
    provider: providerId.value
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
    const confirmation = await clientService.updateRecipientStatus(bookingId, { status: 'confirmed' })
    const addConfirmation = await clientService.addConfirmedOffer(bookingId, offer)

    if (!confirmation || !addConfirmation) return;

    emit('just-test')

    await proStore.onClientBooking(client.value.id, offer, myself, client.value.author_id, notes);

    console.log('Child about to emit confirmed-order-toast (TEMP ALWAYS)')

    console.log('API results:', { confirmation, addConfirmation })
  } catch (e) {
    console.error('API error in child:', e)
  }

  
  //emit('confirmed-order-toast')


  /* const confirmation = await clientService.updateRecipientStatus(bookingId, {status: 'confirmed'});
  const addConfirmation = await clientService.addConfirmedOffer(bookingId, offer);
  
  
  if (!confirmation  || !addConfirmation) return;
  

  await proStore.onConfirmClientBooking(client.value.id, offer, myself, client.value.author_id, notes);

  console.log('Child about to emit confirmed-order-toast')

  emit('onConfirmedOrderToast'); */






  
  //await notificationStore.localConfirmDealNotification(bookingId, myself, client.value.author_id, notes);

  
  //socket.emit('on client request confirm', receiver, bookingId, offer);
}

const rejectFormBooking = async () => {
  if (confirm("Oletko varmaa, että haluat poistaa tilauksen kokonaan?")) {
    isQuitClientBooking.value = true;
    console.log("Reject");
    const receiver = client.value.author_id;
    console.log("RECEIVER - " + receiver);
    await proStore.removeBookingPublicOffer(client.value.id, receiver);
  } else {
    console.log("Cancelled")
  }
  

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

</style>