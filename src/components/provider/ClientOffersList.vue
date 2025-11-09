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
        <div v-for="(booking, index) in safeOffers " :key="index" >


          <div v-if="!booking.visitors.some(id => id === provider.id)" class="booking-row-new"  :class="[{ activePanel: booking.id === bookingID }]">
            <div class="line">
            <span class="left-item">
              {{timeAgo(booking.started)}}
            </span>
              <span v-if="parentOpen && booking.id === bookingID" class="right-item">
              <MDBBtnClose white @click="parentOpen=!parentOpen"/>
            </span>
            </div>
            <span  :class="{'strong-tilt-move-shake': isNoLimit && index === bookingIndex}">
              <span class="new_notification" @click="openBookingOffer(booking, index)">
                <b>{{booking.user.username.length < HEADER_LENGTH ?booking.user.username : booking.user.username.substr(0, HEADER_LENGTH) + "..."}}</b><br>

                {{booking.header.length < HEADER_LENGTH ? booking.header : booking.header.substr(0, HEADER_LENGTH) + "..."}}

                <span style="display: flex; justify-content: right; color: deepskyblue; cursor: pointer">

                {{booking.isIncludeOffers ? ( booking.offers.some(offer => offer.bookingID === booking.id)
                    ? "Tarjous lähetetty" : "Tee tarjous")  : "Varmista tilaus"}}
                </span>
              </span>
            </span>
            <MDBCollapse
                v-if="booking.id === bookingID"
                id="collapsibleContent1"
                :ref="setCollapseRoot"
                v-model="parentOpen"
            >
              <div ref="collapseEl" class="card-body mt-3">
                <client-offer
                    :open="childOpen"
                    @resize-parent="syncParentHeight"
                    @unlock-parent="unlockParentHeight"
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
                <span v-if="parentOpen && booking.id === bookingID" class="right-item">
                <MDBBtnClose white @click="parentOpen=!parentOpen"/>
              </span>
              </div>
              
              <!-- ---{{ booking.offers }} -->
              
              <span  :class="{'strong-tilt-move-shake': isNoLimit && index === bookingIndex}">
                
                <span class="seen_notification" @click="openBookingOffer(booking, index)">
                  
                  <b>{{booking.user.username.length < HEADER_LENGTH ? booking.user.username : booking.user.username.substr(0, HEADER_LENGTH) + "..."}}</b><br>

                  {{booking.header.length < HEADER_LENGTH ? booking.header : booking.header.substr(0, HEADER_LENGTH) + "..."}}
                  
                  <span style="display: flex; justify-content: right; color: deepskyblue; cursor: pointer">
                    {{booking.isIncludeOffers ? (booking.offers.some(offer => offer.bookingID === booking.id) ? "Tarjous lähetetty" : "Tee tarjous")  : "Varmista tilaus"}}
                  </span>

              </span>

            </span>
            <MDBCollapse
                v-if="booking.id === bookingID"
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
const clientStore = useClientStore();

const _props = defineProps({
  isPro: {type: Boolean},
  provider: {type: Object},
  offersIn: {type: Array, default: () => []},
  credit: {type: Number}
})

// keep them reactive
const { offersIn, isPro, credit } = toRefs(_props);



const router = useRouter();
const HEADER_LENGTH = ref(23);
const proStore = useProStore();
const { incomingOffers, providerId } = storeToRefs(proStore);
const client = ref({});
const isNoLimit = ref(false);
const noLimitWarning = ref(false);
const isOpenBooking = ref(false);
const parentOpen = ref(false);
const childOpen = ref(false)
const collapseEl = ref(null)    // <div ref="collapseEl">
const bookingID = ref(0);
const bookingIndex = ref(0);

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


// // ——— Height sync helpers (sync + rAF; no async/await) ———
// let raf1 = 0, raf2 = 0
//
// function resizeParent () {
//   // bail if closed or element missing
//   if (!parentOpen.value || !collapseEl.value) return
//
//   // cancel any pending frames
//   if (raf1) cancelAnimationFrame(raf1)
//   if (raf2) cancelAnimationFrame(raf2)
//
//   // double-rAF to measure AFTER Vue/transition writes
//   raf1 = requestAnimationFrame(() => {
//     raf2 = requestAnimationFrame(() => {
//       const el = collapseEl.value
//       if (!el || !parentOpen.value) return
//       el.style.height = el.scrollHeight + 'px'
//     })
//   })
// }
//
// function unlockParent () {
//   if (raf1) cancelAnimationFrame(raf1)
//   if (raf2) cancelAnimationFrame(raf2)
//   requestAnimationFrame(() => {
//     const el = collapseEl.value
//     if (!el) return
//     el.style.height = '' // let MDB manage height next time
//   })
// }
//
// // Expose to children via provide/inject
// provide('resizeParent', resizeParent)
// provide('unlockParent', unlockParent)
//
// // Optional: keep synced if content grows after open (images, async)
// let ro
// onMounted(() => {
//   if ('ResizeObserver' in window && collapseEl.value) {
//     ro = new ResizeObserver(() => resizeParent())
//     ro.observe(collapseEl.value)
//   }
// })
// onBeforeUnmount(() => { ro && ro.disconnect() })

function parseDmyTime(dmyStr) {
  // Example: "07/10/2025, 12:00"
  const [datePart, timePart] = dmyStr.split(', ')
  const [day, month, year] = datePart.split('/').map(Number)
  const [hours, minutes] = timePart.split(':').map(Number)

  return new Date(year, month - 1, day, hours, minutes)
}

// async function syncParentHeight () {
//   await nextTick()
//   if (!parentOpen.value || !collapseEl.value) return
//   // lock parent to its content height during child transition
//   collapseEl.value.style.height = collapseEl.value.scrollHeight + 'px'
// }
//
// function unlockParentHeight () {
//   if (!collapseEl.value) return
//   // clear inline height after transition completes
//   collapseEl.value.style.height = ''
// }

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

const openBookingOffer = async(booking, index) => {
  console.log("Credit " + credit.value);
  bookingIndex.value = index;
  if (credit.value > 0) {
    console.log("Opening page...");
    console.log("Header - " + client.value.header);
    bookingID.value = booking.id;
    
    parentOpen.value = !parentOpen.value;
    //client.value = booking;
    client.value = proStore.getIncomOfferById(booking.id);
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