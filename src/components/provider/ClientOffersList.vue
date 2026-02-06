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
        <template #title>PROKEIKKATORI</template>
        <button type="button" style="visibility: hidden;" class="btn-close ms-auto" aria-label="Close" @click="hideError"></button>
        <template #small></template>
        Luotto on vanhentunut, et voi enää toimia!
        <div style="float: right; padding: 10px;">
          <MDBBtn color="danger" @click="addCredit">Lisää luottoa</MDBBtn>
        </div>
      
      </MDBToast>
      <!-- !isOpenBooking -->
      <div v-if="safeOffers.length">
        <div v-for="(booking, index) in _props.clients " :key="index" >

          <!-- style="color: red; background-color: green;" -->
          <div v-if="!booking.visitors.some(id => id === providerId)" class="booking-row-new"  :class="[{ activePanel: booking.id === bookingID }]">
            <div class="line">
            <span class="left-item">
              {{timeAgo(booking.started)}}
            </span>
            <span v-if="!parentOpen" class="text-muted"><MDBBadge class="translate-middle p-1"  pill notification>{{ booking.status }}</MDBBadge></span>
            
              <span v-if="parentOpen && booking.id === bookingID" class="right-item">
              <MDBBtnClose  white @click="parentOpen=!parentOpen"/>
            </span>
            </div>
            <span  :class="{'strong-tilt-move-shake': isNoLimit && index === bookingIndex}">
              <span class="new_notification" @click="openBookingOffer(booking, index)">
                <b>{{booking.user.firstName.length < HEADER_LENGTH ?booking.user.firstName : booking.user.firstName.substr(0, HEADER_LENGTH) + "..."}}</b><br>

                <!-- {{booking.header.length < HEADER_LENGTH ? booking.header : booking.header.substr(0, HEADER_LENGTH) + "..."}} -->

                <span style="display: flex; justify-content: right; color: deepskyblue; cursor: pointer">

                {{booking.isIncludeOffers ? ( booking.offers.some(offer => offer.bookingID === booking.id && offer.provider.id === providerId)
                    ? "Tarjous lähetetty" : "Tee tarjous")  : "Varmista tilaus"}}
                </span>
                
              </span>
              
            </span>
            
            <div v-if="booking?.disabled" style=" padding-top: 33px;">
              <p style="color: red">{{ `${booking.user.firstName} on poistanut tilauksen!` }}<strong>Go</strong></p>
            </div>
            <MDBCollapse
                v-if="booking.id === bookingID"
                class="client-collapse"
                id="collapsibleContent1"
                :ref="setCollapseRoot"
                v-model="parentOpen"
            >
              <div ref="collapseEl" class="card-body mt-3">
                <client-offer
                    :open="childOpen"
                    @resize-parent="syncParentHeight"
                    @unlock-parent="unlockParentHeight"
                    :is-disabled="booking?.disabled"
                    :client="client"
                />

                
              </div>
            </MDBCollapse>
            
          </div>
          

          <div v-else class="booking-row-seen">
            <div class="line">
              <span class="left-item">
                {{timeAgo(booking.started)}}
              </span>
              <span v-if="!parentOpen" class="text-muted"><MDBBadge class="translate-middle p-1"  pill notification>{{ booking.status }}</MDBBadge></span>
              <span v-if="parentOpen && booking.id === bookingID" class="right-item">
                <MDBBtnClose style="color: red;" white @click="parentOpen=!parentOpen"/>
              </span>
              </div>
              
              <!-- ---{{ booking.offers }} -->
              
              <span  :class="{'strong-tilt-move-shake': isNoLimit && index === bookingIndex}">
                
                <span class="seen_notification" @click="openBookingOffer(booking, index)">
                  
                  <b>{{booking.user.firstName.length < HEADER_LENGTH ? booking.user.firstName : booking.user.firstName.substr(0, HEADER_LENGTH) + "..."}}</b><br>

                  <!-- {{booking.header.length < HEADER_LENGTH ? booking.header : booking.header.substr(0, HEADER_LENGTH) + "..."}} -->
                  
                  <span style="display: flex; justify-content: right; color: deepskyblue; cursor: pointer">
                    {{booking.isIncludeOffers ? (booking.offers.some(offer => offer.bookingID === booking.id && offer.provider.id === providerId) ? "Tarjous lähetetty" : "Tee tarjous")  : "Varmista tilaus"}}
                  </span>

                </span>

              </span>
              
              <div v-if="booking?.disabled" style=" padding-top: 33px;">
                <p style="color: red">{{ `${booking.user.firstName} on poistanut tilauksen!` }}<strong style="color: blue;">Gooooo</strong></p>
                <p>hhh</p>
              </div>

              <!-- @confirmed-order-toast="(...args) => { console.log('raw event in parent', args); handleConfirmedOrderToast() }" -->
              <MDBCollapse
                  v-if="booking.id === bookingID"
                  class="client-collapse"
                  id="collapsibleContent2"
                  :ref="setCollapseRoot"
                  v-model="parentOpen"
              >
              <!-- target a real DOM element to control height -->
              <div ref="collapseEl" class="card-body mt-3">
                <client-offer
                    :open="childOpen"
                    @resize-parent="syncParentHeight"
                    @unlock-parent="unlockParentHeight"
                    @confirmed-order-toast="handleConfirmedOrderToast"
                    :is-disabled="booking?.disabled"
                    @just-test="hJustTest"
                    :client="client"
                />

              </div>
            </MDBCollapse>
          </div>


        </div>

      </div>
      <div v-else>
        <MDBToast
          :stacking="false"
          autohide
          :delay="3000"
          v-model="isOrderConfirmed"
          position="top-center"
          toast="success"
          icon="fas fa-check fa-lg me-2"
        >
          <button type="button" style="visibility: hidden;" class="btn-close ms-auto" aria-label="Close" @click="hideError"></button>
          <template #title> PROKEIKKATORI </template>
          <!-- <template #small> 11 mins ago </template> -->
          {{ confirmedOrderMessage }}
        </MDBToast>
        <!-- <p style="text-align: right; color: forestgreen; padding-bottom: 50px;" @click="quitBookingOffers">Poistu</p>
        <h2>Ei tarjouksia!</h2> -->
      </div>

    </div>
  </MDBContainer>
</template>

<script setup>
import {MDBContainer, MDBRow, MDBCol, MDBToast, MDBBtn, MDBBtnClose, MDBCollapse} from'mdb-vue-ui-kit';
import {ref, toRefs, onMounted, onBeforeUnmount, provide, computed} from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useProStore } from '@/stores/providerStore.js';
import ClientOffer from './ClientOffer.vue'
import recipientService from '../../service/recipients.js';
import { useClientStore } from '@/stores/recipientStore.js';
import providerService from '../../service/providers.js'
defineOptions({
  name: 'client-offers-list'
});

/* defineProps({
  clients: { type: Array, default: () => [] }
}); */
const clientStore = useClientStore();
// credit: {type: Number}
const _props = defineProps({
  clients: { type: Array, default: () => [] },
  isPro: {type: Boolean},
  provider: {type: Object},
  offersIn: {type: Array, default: () => []}
})

const emit = defineEmits(['confirm-order-toast'])

// keep them reactive
const { offersIn, isPro } = toRefs(_props);



const router = useRouter();
const HEADER_LENGTH = ref(33);
const proStore = useProStore();
const { incomingOffers, providerId, proCredit } = storeToRefs(proStore);
const client = ref({});
const isNoLimit = ref(false);
const noLimitWarning = ref(false);
const isOpenBooking = ref(false);
const parentOpen = ref(false);
const childOpen = ref(false)
const collapseEl = ref(null)    // <div ref="collapseEl">
const bookingID = ref(0);
const bookingIndex = ref(0);

const isOrderConfirmed = ref(false);
const confirmedOrderMessage = ref("");

const safeOffers = computed(() => Array.isArray(incomingOffers.value) ? incomingOffers.value : [])


/** ✅ The actual collapse root DOM element (from <MDBCollapse>) */
const collapseRootEl = ref(null)

/** Setter used by :ref on MDBCollapse; Vue calls with el on mount and null on unmount */
function setCollapseRoot (compOrEl) {
  // MDBCollapse is a component → prefer .$el; if already element, use directly; null on unmount
  collapseRootEl.value = compOrEl?.$el ?? compOrEl ?? null
}

/* ---------- Height sync helpers (no async/await) ---------- */
let raf1 = 0, raf2 = 0

function resizeParent () {
  const el = collapseRootEl.value
  if (!parentOpen.value || !el) return
  if (raf1) cancelAnimationFrame(raf1)
  if (raf2) cancelAnimationFrame(raf2)

  // double rAF to measure after classes/styles applied
  raf1 = requestAnimationFrame(() => {
    raf2 = requestAnimationFrame(() => {
      const root = collapseRootEl.value
      if (!root || !parentOpen.value) return
      root.style.height = root.scrollHeight + 'px'
    })
  })
}

function unlockParent () {
  if (raf1) cancelAnimationFrame(raf1)
  if (raf2) cancelAnimationFrame(raf2)
  const el = collapseRootEl.value
  if (!el) return
  requestAnimationFrame(() => {
    const again = collapseRootEl.value
    if (again) again.style.height = ''
  })
}

/** Expose to child via inject */
provide('resizeParent', resizeParent)
provide('unlockParent', unlockParent)

/** Optional: keep in sync if inner content changes after open (images, async) */
let ro
onMounted(() => {
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(() => resizeParent())
    // Observe the root when it exists
    if (collapseRootEl.value) ro.observe(collapseRootEl.value)
  }
})
onBeforeUnmount(() => { ro && ro.disconnect() })

const hJustTest = () => {
  console.log("JUST TEST");
  emit('confirm-order-toast')
  isOrderConfirmed.value = true;
  confirmedOrderMessage.value = "Olet vahvistanut tilauksen!"
}

const handleConfirmedOrderToast = () => {
  console.log('Parent received confirmed-order-toast')
  console.log("EMIT in list");
  isOrderConfirmed.value = true;
  confirmedOrderMessage.value = "Olet vahvistanut tilauksen!"
}

function parseDmyTime(dmyStr) {
  // Example: "07/10/2025, 12:00"
  const [datePart, timePart] = dmyStr.split(', ')
  const [day, month, year] = datePart.split('/').map(Number)
  const [hours, minutes] = timePart.split(':').map(Number)

  return new Date(year, month - 1, day, hours, minutes)
}

const addVisitor = async(id, visitor) => {
  const visited = await recipientService.addVisitor(id, visitor);
  console.log("VISITOR id is " + visitor.visitor);
  //clientStore.addBookingVisitor(id, _props.provider.id);
  proStore.addVisitorForBooking(id, visitor);

  //this.$emit("join:visitor", id, visitor.visitor);
}

const openBookingOffer = async(booking, index) => {
  console.log("Credit " + proCredit.value);
  bookingIndex.value = index;
  if (proCredit.value > 0) {
    console.log("Opening page...");
    console.log("Header - " + client.value.header);
    bookingID.value = booking.id;
    
    parentOpen.value = !parentOpen.value;
    //client.value = booking;
    client.value = proStore.getIncomOfferById(booking.id);
    console.log("Client - " + {client})
    console.log("Here header: " + incomingOffers.value[0].header);
    //isOpenBooking.value = true;

    addVisitor(booking.id, {visitor: providerId.value});

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

const quitBookingOffers = () => {
  //isOpenBooking.value = false;
  router.go(-1);
}
const addCredit = () => {
  router.push('/pay-plan');
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
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  
  background: #161A22FF;
  /*box-shadow: 0.3em 0.3em 1em rgba(104,101,101,0.6);*/
  border-radius: 7px;
  box-shadow: 0.3em 0.3em 1em rgba(244, 163, 110, 0.35);
  padding: 10px;
  margin-bottom: 27px;
  font-size: 14px;
}
.booking-row-seen {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  border-radius: 7px;

  background: rgb(34, 41, 56);
  /*box-shadow: 0.3em 0.3em 1em rgba(104,101,101,0.6);*/
  box-shadow: 0.3em 0.3em 1em rgb(138, 138, 138);
  padding: 10px;
  margin-bottom: 27px;
  font-size: 14px;
}

.new_notification {
  font-size: 1rem;
  font-weight: bold;
  color: orange;

}
.seen_notification {
  font-size: 1rem;
  color: #ddd;
}

.client-collapse {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.activePanel {
  background: #283041;

}

.line {
  display: flex;
  justify-content: space-between; /* pushes items to edges */
  align-items: center;            /* vertically centers them */
}
.left-item {
  color: #66aab1;
  font-size: 11px;
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
/* Helps avoid margin-collapsing visual glitches inside height-animated blocks */
.card.card-body { display: flow-root; }
</style>