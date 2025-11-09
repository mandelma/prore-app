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
        <MDBBtn color="primary" class="mb-3">
          <MDBIcon size="2x" ><i class="far fa-comment"></i></MDBIcon>
        </MDBBtn>
      </div>
      <div v-if="client.isIncludeOffers" style="margin-bottom: 20px;">
        <div v-if="!client.offers.some(offer => offer.bookingID === client.id)">
          <MDBBtn
              :disabled="isDisableProNotOfferBtns"
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

                  <form>
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
                        :disabled="isDisableProNotOfferBtns"
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


<!--          <MDBCollapse-->
<!--              v-if="isHandleOffer"-->
<!--              class="card card-body"-->
<!--              id="collapsibleContent5"-->
<!--              v-model="isHandleOffer"-->
<!--          >-->

<!--          </MDBCollapse>-->

          <MDBBtn v-if="!isHandleOffer" :disabled="isDisableProNotOfferBtns" block outline="danger" @click="rejectFormBooking" size="lg">Poista tilaus</MDBBtn>
        </div>
      </div>

      <div v-else style="margin-bottom: 20px;">
        <!--    <MDBBtn outline="success" block size="lg" @click="isQuitClientBooking = true">Varmista tilaus</MDBBtn>-->

        <MDBBtn
            v-if="!isQuitClientBooking"
            :disabled="isDisableProNotMapBtns"
            block
            outline="success"
            size="lg"
            @click="confirmBooking(booking)"
        >
          Varmista tilaus
        </MDBBtn>

        <div v-if="isQuitClientBooking" style="padding: 13px; margin-top: 13px; border: 1px solid blue;">
          <div style="display: flex; justify-content: right; margin-bottom: 7px;">
            <MDBBtnClose white @click="isQuitClientBooking = false"/>
          </div>

          <MDBTextarea
              style=""
              label="Anna syy..."
              rows="3"
              v-model="reason"
          >

          </MDBTextarea>
          <MDBBtn
              v-if="reason.length > 1"
              :disabled="isDisableProNotMapBtns"
              block size="lg"
              outline="success"
              style="margin-top: 12px;"
              @click="confirmRejectBookingNoOffers(booking)"
          >
            Varmista
          </MDBBtn>
        </div>
<!--        :disabled="isDisableProNotMapBtns"-->
        <MDBBtn
            v-if="!isQuitClientBooking"

            block
            outline="danger"
            size="lg"
            @click="quitOffer"
        >
          Poista tilaus
        </MDBBtn>

      </div>
    </div>

  </div>
</template>

<script setup>
import {MDBTable, MDBToast, MDBBtn, MDBSpinner, MDBBtnClose, MDBTextarea, MDBInput, MDBRadio, MDBIcon, MDBCollapse} from 'mdb-vue-ui-kit';
import { ref, nextTick, inject, toRefs, onMounted, computed } from 'vue';
import handleLocation from '../controllers/distance.js';
import { useProStore } from '@/stores/providerStore.js';
import { useClientStore } from '@/stores/recipientStore.js';
import { useLoginStore } from '@/stores/login.js';
import { storeToRefs } from 'pinia';
import socket from "@/socket";

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
})

const { client, open } = toRefs(_props)

const sender = useLoginStore();
const proClient = useProStore();
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
const { providerId, provider } = storeToRefs(proClient);
const offerPrice = ref(null);
const offerPlace = ref('here');
const offerAbout = ref('');
const reason = ref('');
const isQuitClientBooking = ref(false);


// const parentCollapse = ref(null); // <MDBCollapse> component
// const parentContent  = ref(null); // inner content we measure

const mapsError = ref(false);
import {loadGoogleMaps} from '../controllers/loadGoogleMap.js'
const final = ref(null);

const profession = computed(() => _props.client?.professional?.[0]?.profession || '');
//const road = computed(async() => await d.findDistance([60.276451557679316, 24.858190796621688], [60.29733169999999, 25.0449442]))
onMounted(async() => {
  await validateMaps();
  // if (!window.google) {
  //   await loadGoogleMaps();
  //   console.log("Map is inited in ClientOffer!");
  // }
  console.log("CXC " + await d.findDistance([provider.value.latitude, provider.value.longitude], [client.value.latitude, client.value.longitude]));

  const road = await d.findDistance([provider.value.latitude, provider.value.longitude], [client.value.latitude, client.value.longitude]);

  if (road) {
    console.log("Distance is " + road.distance);
    console.log("Duration is " + road.duration);
    roadDistance.value = road.distance;
    roadDuration.value = road.duration;
  }
  //console.log("Distance is " + final.value.distance);
  //console.log("Duration is " + final.value.duration);

})
const validateMaps = async() => {
  try {
    await loadGoogleMaps();
    console.log("Map is inited in ClientOffer! ✅");
  } catch (err) {
    console.error('Google Maps failed to load ❌', err);
    mapsError.value = true;
  }
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
  const addressee = client.value.user.id;
  console.log("Addressee - " + addressee);
  //clientStore.addOffer(client.value.id, offer);
  proClient.addProviderOffer(client.value.id, addressee, offer);
  //socket.emit('client get offer', addressee, client.value.id, offer);

}
const quitOffer = () => {
  //isQuitClientBooking = true;
  console.log("Quit offer");
}

const rejectFormBooking = () => {
  console.log("Reject / poista");
  if (confirm("Oletko varmaa, että haluat poistaa tilauksen!?") === true) {

    isQuitClientBooking.value = true;
    console.log("Reject");
    proClient.removeBookingOffer(client.value.id)
    //emit('quit-booking-order');
    //this.$emit("rejectFormBooking", booking);

  } else {
    console.log("You canceled!")
  }
}
</script>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active { transition: all .2s ease; }
.fade-slide-enter-from,  .fade-slide-leave-to      { opacity: 0; transform: translateY(-4px); }
</style>