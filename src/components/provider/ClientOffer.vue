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

    <div v-if="!_props.client.professional && !road">
      <MDBSpinner color="info" />
    </div>
    <div v-else>
      <MDBTable borderless style="font-size: 12px; color: #dddddd; text-align: left;">
        <tbody>
        <tr>
          <td>
            Osoite:
          </td>
          <td>
            {{_props.client.address}}
          </td>
        </tr>
        <tr>
          <td>
            Tarvitaan ammattilaista:
          </td>
          <td>
            {{_props.client?.professional?.[0]}}

          </td>
        </tr>
        <tr>
          <td>
            Ajankohda:
          </td>
          <td>
            {{_props.client.date}}
          </td>
        </tr>
        <tr>
          <td>
            Tehtävän kuvaus:
          </td>
          <td>
            {{_props.client.description}}
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
            <MDBBtn color="primary">
              <MDBIcon ><i class="far fa-comment"></i></MDBIcon>
            </MDBBtn>
          </td>
        </tr>
        </tbody>
      </MDBTable>
      <div v-if="_props.client.isIncludeOffers" style="margin-bottom: 20px;">
        <div v-if="!_props.client.offers.some(offer => offer.provider.id === provider.id)">
          <MDBBtn
              :disabled="isDisableProNotOfferBtns"
              block
              outline="primary"
              size="lg"
              @click="makeOfferBtn(booking)"
          >
            Tee Hintatarjous
          </MDBBtn>

          <div v-if="isOffer" style="padding: 13px; margin-top: 13px; font-size: 14px; border: 1px solid blue; margin-bottom: 20px;">
            <div style="display: flex; justify-content: right; margin-bottom: 7px;">
              <MDBBtnClose white @click="isOffer = false"/>
            </div>

            <MDBInput white type="number" label="Tarjoa hintasi" v-model="priceOffer" wrapperClass="mb-4" />
            <div style="text-align: left; margin-bottom: 10px;">
              <MDBRadio
                  label="Tarjoan palvelu asiakkaan luona"
                  name="area"
                  v-model="place"
                  value="go"
              >

              </MDBRadio>
              <MDBRadio
                  label="Tarjoan palvelua paikalla"
                  name="area"
                  v-model="place"
                  value="here"
              >

              </MDBRadio>
            </div>


            <MDBTextarea
                white
                style=""
                label="Anna tarvittaessa lisäselvityksiä..."

                rows="3"
                v-model="aboutOffer"
            >

            </MDBTextarea>
            <MDBBtn
                :disabled="isDisableProNotOfferBtns"
                v-if="priceOffer"
                label="Anna hintatarjous"
                block size="lg"
                outline="success"
                style="margin-top: 12px;"
                @click="createOffer(booking)"
            >
              Lähetä
            </MDBBtn>

          </div>
          <MDBBtn :disabled="isDisableProNotOfferBtns" block outline="danger" @click="rejectFormBooking(booking)" size="lg">Poista tilaus</MDBBtn>
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
              white
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
import {MDBTable, MDBToast, MDBBtn, MDBSpinner, MDBBtnClose, MDBTextarea, MDBInput, MDBRadio, MDBIcon} from 'mdb-vue-ui-kit';
import { ref, onMounted, computed } from 'vue';
import handleLocation from '../controllers/distance.js';
defineOptions({
  name: 'client-offer'
});
const _props = defineProps({
  client: {type: Object, default: {}}
})
const d = handleLocation;
const roadDistance = ref(null);
const roadDuration = ref(null);
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
  console.log("CXC " + await d.findDistance([60.276451557679316, 24.858190796621688], [60.29733169999999, 25.0449442]));

  const road = await d.findDistance([60.276451557679316, 24.858190796621688], [60.29733169999999, 25.0449442]);

  if (road) {
    console.log("Distance is " + road.distance);
    console.log("Duration is " + road.duration);
    roadDistance.value = road.distance + " km";
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
  console.log("Make offer!")
}
const quitOffer = () => {
  //isQuitClientBooking = true;
  console.log("Quit offer");
}

const rejectFormBooking = () => {
  console.log("Reject / poista")
}
</script>

<style scoped>

</style>