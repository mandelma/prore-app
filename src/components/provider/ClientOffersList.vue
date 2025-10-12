<template>
  <MDBContainer>
    <div style="padding-top: 17px;">

      <MDBToast
          v-model="noLimitWarning"
          autohide
          :delay="10000"
          :stacking="false"
          position="top-center"
          toast="danger"
          icon="fas fa-exclamation-circle fa-lg me-2"
      >
        <template #title>LUOTTO!! </template>
        <button type="button" style="visibility: hidden;" class="btn-close ms-auto" aria-label="Close" @click="hideError"></button>
        <template #small></template>
        Luotto on vanhentunut, et voi enää toimia!
        <div style="float: right; padding: 10px;">
          <MDBBtn color="danger" @click="addCredit">Lisää luottoa</MDBBtn>
        </div>

      </MDBToast>

      <div v-if="!isOpenBooking">
        <div v-for="(booking, index) in incomingOffers " :key="index" >



<!--          <div v-if="collapse1" style="display: flex; justify-content: right;">-->
<!--            <MDBBtnClose white @click="collapse1=!collapse1"/>-->
<!--          </div>-->
          <div v-if="!booking.visitors.some(id => id === provider.id)" class="booking-row-new"  :class="[{ activePanel: booking.id === bookingID }]">
            <div class="line">
            <span class="left-item">
              {{timeAgo(booking.started)}}
            </span>
              <span v-if="collapse1 && booking.id === bookingID" class="right-item">
              <MDBBtnClose white @click="collapse1=!collapse1"/>
            </span>
            </div>
            <span  :class="{'strong-tilt-move-shake': isNoLimit && index === 0}">
              <span class="new_notification" @click="openBookingOffer(booking, index)">
                <b>{{booking.user.username.length < HEADER_LENGTH ?booking.user.username : booking.user.username.substr(0, HEADER_LENGTH) + "..."}}</b><br>

                {{booking.header.length < HEADER_LENGTH ? booking.header : booking.header.substr(0, HEADER_LENGTH) + "..."}}

                <span style="display: flex; justify-content: right; color: deepskyblue; cursor: pointer">

                {{booking.offers ? ( booking.offers.some(offer => offer.provider.id === userIsProvider.id || offer.provider.id === userIsProvider.id)
                    ? "Tarjous lähetetty" : "Tee tarjous")  : "Varmista tilaus"}}
                </span>
              </span>
            </span>
            <MDBCollapse
                v-if="booking.id === bookingID"
                id="collapsibleContent1"
                v-model="collapse1"
            >
              <div class="mt-3">
                <client-offer
                    :client="client"
                />

                <p>{{booking.header}}</p>
              </div>
            </MDBCollapse>
          </div>

          <div v-else class="booking-row-seen">
            <div class="line">
              <span class="left-item">
                {{timeAgo(booking.started)}}
              </span>
                <span v-if="collapse1 && booking.id === bookingID" class="right-item">
                <MDBBtnClose white @click="collapse1=!collapse1"/>
              </span>
              </div>
              <span  :class="{'strong-tilt-move-shake': isNoLimit && index === bookingIndex}">
                <span class="seen_notification" @click="openBookingOffer(booking, index)">

                  <b>{{booking.user.username.length < HEADER_LENGTH ? booking.user.username : booking.user.username.substr(0, HEADER_LENGTH) + "..."}}</b><br>

                  {{booking.header.length < HEADER_LENGTH ? booking.header : booking.header.substr(0, HEADER_LENGTH) + "..."}}

                  <span style="display: flex; justify-content: right; color: deepskyblue; cursor: pointer">
                  {{booking.offers ? (  booking.offers.some(offer => offer.provider.id === userIsProvider.id) ? "Tarjous lähetetty" : "Tee tarjous")  : "Varmista tilaus"}}
                </span>

              </span>

            </span>
            <MDBCollapse
                v-if="booking.id === bookingID"
                id="collapsibleContent2"
                v-model="collapse1"
            >
              <div class="mt-3">
                <client-offer
                    :client="client"
                />

              </div>
            </MDBCollapse>
          </div>


        </div>

      </div>
      <div v-else>
        <p style="text-align: right; color: forestgreen; padding-bottom: 50px;" @click="quitBookingOffer">Poistu</p>
        <h2>Booking info</h2>
      </div>

    </div>
  </MDBContainer>
</template>

<script setup>
import {MDBContainer, MDBRow, MDBCol, MDBToast, MDBBtn, MDBBtnClose, MDBCollapse} from'mdb-vue-ui-kit';
import {ref, toRefs, computed} from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useProStore } from '@/stores/providerStore.js';
import ClientOffer from './ClientOffer.vue'
import recipientService from '../../service/recipients.js';
import { useClientStore } from '@/stores/recipientStore.js';
defineOptions({
  name: 'client-offers-list'
});
const clientStore = useClientStore();

const _props = defineProps({
  isPro: {type: Boolean},
  provider: {type: Object},
  offersIn: {type: Array, default: () => []},
  credit: {type: Number}
})

// keep them reactive
const { offersIn, isPro, credit } = toRefs(_props);

const safeOffers = computed(() =>
    Array.isArray(offersIn.value) ? offersIn.value : []
)

const router = useRouter();
const HEADER_LENGTH = ref(13);
const proStore = useProStore();
const { incomingOffers } = storeToRefs(proStore);
const client = ref({});
const isNoLimit = ref(false);
const noLimitWarning = ref(false);
const isOpenBooking = ref(false);
const collapse1 = ref(false);
const bookingID = ref(0)

function parseDmyTime(dmyStr) {
  // Example: "07/10/2025, 12:00"
  const [datePart, timePart] = dmyStr.split(', ')
  const [day, month, year] = datePart.split('/').map(Number)
  const [hours, minutes] = timePart.split(':').map(Number)

  return new Date(year, month - 1, day, hours, minutes)
}

// const parseDmyTime = (str) => {
//   const m = str?.match(/^(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2})$/);
//   if (!m) return null;
//   const [, dd, mm, yyyy, HH, MM] = m.map(Number);
//   return new Date(yyyy, mm - 1, dd, HH, MM);
//
//
//   // const date = new Date()              // current date
//   // const formatted = date.toLocaleDateString('en-US', {
//   //   year: 'numeric',
//   //   month: '2-digit',
//   //   day: '2-digit'
//   // })
//   // console.log(formatted)               // → 09/26/2025
//   //
//   // date.toLocaleDateString('en-GB')     // → 26/09/2025
//   // date.toLocaleDateString('de-DE')     // → 26.09.2025
// }

const addVisitor = async(id, visitor) => {
  const visited = await recipientService.addVisitor(id, visitor);
  console.log("VISITOR id is " + visitor.visitor);
  //clientStore.addBookingVisitor(id, _props.provider.id);
  proStore.addVisitorForBooking(id, visitor);

  //this.$emit("join:visitor", id, visitor.visitor);
}

const openBookingOffer = (booking) => {
  console.log("Credit " + credit.value);
  if (credit.value > 0) {
    console.log("Opening page...");
    console.log("Header - " + client.value.header);
    bookingID.value = booking.id;
    collapse1.value = !collapse1.value;
    client.value = booking;
    console.log("Here header: " + incomingOffers.value[0].header);
    //isOpenBooking.value = true;

    addVisitor(booking.id, {visitor: _props.provider.id});

    const dateObj = parseDmyTime(booking.date);
    console.log("T.A - " + timeAgo(dateObj));
  } else {
    noLimitWarning.value = true;
    isNoLimit.value = true;
    setTimeout(() => {
      isNoLimit.value = false;
    }, 2000);
  }
}


const quitBookingOffer = () => {
  isOpenBooking.value = false;
}
const addCredit = () => {
  router.push('pay-plan');
}

const timeAgo = (iso) => {
  let diffMs = Date.now() - new Date(iso).getTime()
  diffMs = Math.max(0, diffMs) // prevent negative time
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins} minuuttia sitten`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} tuntia sitten`
  const days = Math.floor(hrs / 24)
  return `${days} päivää sitten`

}

</script>

<style scoped>
.booking-row-new {
  background: #161A22FF;
  /*box-shadow: 0.3em 0.3em 1em rgba(104,101,101,0.6);*/
  box-shadow: 0.3em 0.3em 1em rgba(244, 163, 110, 0.35);
  padding: 10px;
  margin-bottom: 27px;
  font-size: 14px;
}
.booking-row-seen {
  background: #354057FF;
  /*box-shadow: 0.3em 0.3em 1em rgba(104,101,101,0.6);*/
  box-shadow: 0.3em 0.3em 1em rgb(138, 138, 138);
  padding: 10px;
  margin-bottom: 27px;
  font-size: 14px;
}

.activePanel {
  background: #354057;

}

.line {
  display: flex;
  justify-content: space-between; /* pushes items to edges */
  align-items: center;            /* vertically centers them */
}
.left-item {
  color: grey;
  font-size: 11px;
}

.new_notification {
  font-size: 1rem;
  font-weight: bold;
  color: #d55b5b;

}
.seen_notification {
  font-size: 1rem;
}
span {

  /*background: #48abe0;*/
  /*color: white;*/
  /*padding: 1.5rem;*/
  /*font-size: 2rem;*/
  display: inline-block;
}
span.strong-tilt-move-shake {
  animation: tilt-n-move-shaking 0.15s;
}

@keyframes tilt-n-move-shaking {
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(5px, 5px) rotate(5deg); }
  50% { transform: translate(0, 0) rotate(0deg); }
  75% { transform: translate(-5px, 5px) rotate(-5deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}
</style>