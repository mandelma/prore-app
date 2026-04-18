<template>
  <div class="history">
    <div v-if="!showDetails" style="display: flex; justify-content: right; cursor: pointer;">
        <MDBBtnClose white @click="router.go(-1)" />
    </div>
    <!-- LIST VIEW -->
    <div v-if="!showDetails">
      <div class="history__detailTop">
        <div class="history__header">
          <h3 class="history__title">Tilatut palvelut</h3>
          <p class="history__subtitle">
            Valitse tilaus nähdäksesi tiedot ja varataksesi uudelleen.
          </p>
        </div>
        <div class="search-wrap">
          <MDBInput size="sm" label="Hae yritys..." v-model="bookingQuery" />
        </div>
      </div>
      

      <!-- MOBILE: cards -->
      <div class="history__cards d-md-none">
        <div
          v-for="b in filteredBookingHistory"
          :key="b.id"
          class="historyCard"
        >
          <div class="historyCard__top">
            <div>
              <div class="historyCard__date">{{ formatDateTime(b.date) }}</div>
              <div class="historyCard__company">{{ b.company }}</div>
              <div class="historyCard__service">{{ b.header }}</div>
            </div>

            <span class="badge badge-success historyCard__badge">Valmis</span>
          </div>

          <div class="historyCard__actions">
            <MDBBtn outline="info" size="sm" @click="openDetails(b)">Tiedot</MDBBtn>
            <MDBBtn color="info" size="sm" @click="bookAgain(b)">
              Varaa
            </MDBBtn>
            <MDBBtn color="danger" size="sm" @click="delChRow(b?.id)">
              P
            </MDBBtn>
          </div>
        </div>
      </div>

      <!-- DESKTOP: table -->
      <MDBTable borderless class="historyTable d-none d-md-table">
        <thead>
          <tr>
            <th>Päivä</th>
            <th>Palveluntarjoaja</th>
            <th>Tehtävä</th>
            <th class="text-end">Toiminnot</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in filteredBookingHistory" :key="b.id" class="historyTable__row">
            <td class="history__muted">{{ formatDateTime(b.date) }}</td>
            <td class="history__strong">{{ b.company }}</td>
            <td class="history__muted">{{ b.header }}</td>
            <td class="text-end">
              <MDBBtn outline="info" size="sm" class="ms-2" @click="openDetails(b)">Tiedot</MDBBtn>
              <MDBBtn color="info" size="sm" class="ms-2" @click="bookAgain(b)">Varaa uudelleen</MDBBtn>
              <MDBBtn color="danger" size="sm" class="ms-2" @click="delChRow(b?.id)">P</MDBBtn>
            </td>
          </tr>
        </tbody>
      </MDBTable>
    </div>

    <!-- DETAILS VIEW -->
    <div v-else>
      <div class="history__detailTop">
        <MDBBtn outline="light" size="sm" @click="closeDetails">← Takaisin</MDBBtn>

        <MDBBtn color="info" @click="bookAgain(selectedBooking)">
          Varaa sama palveluntarjoaja uudelleen
        </MDBBtn>
      </div>

      <div class="history__grid">
        <!-- Booking details -->
        <section class="historySection">
          <h4 class="historySection__title">Varaus</h4>

          <div class="kv">
            <div class="kv__k">Päivämäärä</div>
            <div class="kv__v">{{ formatDateTime(selectedBooking?.date) }}</div>

            <div class="kv__k">Tehtävä</div>
            <div class="kv__v">{{ selectedBooking?.header }}</div>

            <div class="kv__k">Tila</div>
            <div class="kv__v">
              <span class="badge badge-success">Valmis</span>
            </div>

            <!-- Optional fields if you have them -->
            <template v-if="selectedBooking?.price">
              <div class="kv__k">Hinta</div>
              <div class="kv__v">{{ selectedBooking.price }} €</div>
            </template>

            <template v-if="selectedBooking?.notes">
              <div class="kv__k">Lisätiedot</div>
              <div class="kv__v">{{ selectedBooking.notes }}</div>
            </template>
          </div>
        </section>



        <!-- Provider details -->
        <section class="historySection">
          <h4 class="historySection__title">Palveluntarjoaja</h4>

          <div class="kv">
            <div class="kv__k">Yritys</div>
            <div class="kv__v">{{ selectedBooking?.company }}</div>

            <div class="kv__k">Y-tunnus</div>
            <div class="kv__v">{{ selectedBooking?.id_number }}</div>

            <div class="kv__k">Osoite</div>
            <div class="kv__v">{{ selectedBooking?.address }}</div>

            <div class="kv__k">Ammatit</div>
            <div class="kv__v">
              <div class="chips">
                <span
                  v-for="(pro, i) in (selectedBooking?.professional || [])"
                  :key="i"
                  class="chip"
                >
                  {{ pro }}
                </span>
              </div>
            </div>
          </div>

          <div class="historySection__actions">
            <MDBBtn outline="info" @click="goToProvider(selectedBooking?.deal)">
              Näytä profiili
            </MDBBtn>
          </div>
        </section>
      </div>
    </div>
  </div>

  <MDBModal
    tabindex="-1"
    class="modal-fade"
    v-model="providerProfileModal"
    removeBackdrop
    :keyboard="false"
    :focus="false"
    scrollable
  >
    <MDBModalHeader class="modal-header-custom">
      <MDBModalTitle >{{ selectedProvider?.name }}</MDBModalTitle>
    </MDBModalHeader>
    <MDBModalBody>

      <div class="modal-pro-first">
        <MDBIcon v-if="!selectedProvider?.user?.avatar?.isImage"  icon="user" class="icon" />
        <img
        v-else
          :src="selectedProvider?.user?.avatar?.imageUrl"
          class="rounded-circle"
          height="53"
          alt=""
          loading="lazy"
        />

        <div>
          <stars :rating="selectedProvider?.rating" />
          <p class="text-muted small" style="text-align: center;">{{ selectedProvider?.ratersCount }} arvioijaa</p>
        </div>
      </div>
      <offer-content :offerId="null" :bookingId="dealID" />
    </MDBModalBody>
    <MDBModalFooter>
      <div style="display: flex; justify-content: right;">
        <div style="display: flex; gap: 7px;">
          <MDBBtn color="danger" @click="providerProfileModal = false"> Peruuta </MDBBtn>
          
        </div>
      </div>
      
    </MDBModalFooter>
  </MDBModal>

  <MDBModal
    tabindex="-1"
    class="modal-fade"
    v-model="orderProviderModal"
    removeBackdrop
    :keyboard="false"
    :focus="false"
    scrollable
  >
    <MDBModalHeader class="modal-header-custom">
      <MDBModalTitle >{{ selectedProvider?.pName }}</MDBModalTitle>
    </MDBModalHeader>
    <MDBModalBody>

      <div class="modal-pro-first">
        <MDBIcon v-if="!selectedProvider?.user?.avatar?.isImage"  icon="user" class="icon" />
        <img
        v-else
          :src="selectedProvider?.user?.avatar?.imageUrl"
          class="rounded-circle"
          height="53"
          alt=""
          loading="lazy"
        />

        <div>
          <stars :rating="selectedProvider?.rating" />
          <p class="text-muted small" style="text-align: center;">{{ selectedProvider?.ratersCount }} arvioijaa</p>
        </div>
      </div>
      
      <RequestForm
        ref="requestFormRef"
        :target="selectedProvider"
        :is-open="orderProviderModal"
        @sendRequest="handleRequest"
      />
    </MDBModalBody>
    <MDBModalFooter>
      <div style="display: flex; justify-content: right;">
        <div style="display: flex; gap: 7px;">
          <MDBBtn color="danger" @click="orderProviderModal = false"> Peruuta </MDBBtn>
          
        </div>
      </div>
      
    </MDBModalFooter>
  </MDBModal>

  <ConfirmModal
    v-model="showDeleteModal"
    :title="cTitle"
    :message="cMessage"
    confirm-text="Poista"
    cancel-text="Pidä se"
    :danger="true"
    @confirm="handleRemoveRow"
    @cancel="handleCancelRemoving"
  />
</template>
<script setup>
import { ref, computed, watch, nextTick } from "vue"
import { useRouter } from "vue-router"
import { useClientArchiveStore } from "@/stores/cArchiveStore"
import { storeToRefs } from "pinia"
import providerService from '../../service/providers'
import Stars from "../Stars.vue"
import OfferContent from "./OfferContent.vue"
import RequestForm from "./RequestForm.vue"
import { useLoginStore } from "@/stores/login"
import { useClientStore } from "@/stores/recipientStore"
import ConfirmModal from "../helpers/ConfirmModal.vue"

// MDB components (names may vary slightly in your setup)
import { MDBTable, MDBBtn, MDBBtnClose, MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter, MDBInput } from "mdb-vue-ui-kit"

defineOptions ({
    name: "client-history"
})

// props example (use what you already have)
const props = defineProps({
  recipientConfirmedBookings: { type: Array, default: () => [] }
})

const router = useRouter()

const auth = useLoginStore();
const { user } = storeToRefs(auth);

const clientStore = useClientStore();

const cArchiveStore = useClientArchiveStore();
const showDetails = ref(false)
const selectedBooking = ref(null)

const { clientHistory } = storeToRefs(cArchiveStore);

const providerProfileModal = ref(false);
const orderProviderModal = ref(false);

const bookingQuery = ref("");
const selectedProvider = ref(null);
const dealID = ref(null);

const requestFormRef = ref(null)

const rowId = ref(null);

const showDeleteModal = ref(false);
const cTitle = ref("");
const cMessage = ref("");

watch(() => orderProviderModal.value, async (open) => {
  if (open) {
    await nextTick()
    /* setTimeout(() => {
      requestFormRef.value?.initAutocomplete()
    }, 100) */
  }
})

const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);

  return d.toLocaleString("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const filteredBookingHistory = computed(() => {
  const q = bookingQuery.value.trim().toLowerCase();
  if (!q) return clientHistory.value;

  return clientHistory.value.filter((b) => {
    const provider = (b?.company ?? "").toLowerCase();
    /* const last  = (c?.user?.lastName ?? "").toLowerCase();
    const status = (c?.status ?? "").toLowerCase();
    const email  = (c?.user?.email ?? c?.email ?? "").toLowerCase(); */

    return (
      provider.includes(q) 
      /* last.includes(q) ||
      email.includes(q) ||
      status.includes(q) */
    );
  });
});

function openDetails(b) {
  selectedBooking.value = b
  showDetails.value = true
}

function closeDetails() {
  showDetails.value = false
  selectedBooking.value = null
}

function bookAgain(b) {
  if (!b) return
  // Adjust route to your app
  console.log("--------- " + b?.deal?.provider?.profession[0])

  selectedProvider.value = b?.deal?.provider;
  /* const clientObject = {
    professional: b?.deal?.provider?.profession[0],
    title: "Uusi tilaus"
  }
  router.push({
    name: 'recipient-form',
    query: {
      content: JSON.stringify(clientObject)
    }
  }) */
  orderProviderModal.value = true;
}

const delChRow = (id) => {
  rowId.value = id;

  console.log("Got command to delete row " + id);
  cTitle.value = "Poistetaan rivi";
  cMessage.value = "Oletko varma, että haluat poistaa rivin?";
  showDeleteModal.value = true;
}


const handleRemoveRow = () => {
  console.log("Removing archieved row " + rowId.value);
}

const handleCancelRemoving = () => {
  console.log("Cancelled")
}

const goToProvider = async (deal) => {
  if (!deal) return
  //console.log("Booking offer - ", deal);

  const provider = deal?.provider;
  try {
    console.log("Provider id got - " + provider?.id)
    const providerUp = await providerService.getProvByProvId(provider.id);
    console.log("PPP ", providerUp)
    if (providerUp) selectedProvider.value = providerUp;

    //console.log("S provider rates count - " + selectedProvider.value.ratersCount)
  } catch (err) {
    console.log("Error happens when loading provider's data!" + err.message)
  }
  //selectedProvider.value = provider;
  if (!selectedProvider.value) return;

  console.log("Provider - ", selectedProvider.value);
  dealID.value = deal.bookingID;
  console.log("Deal id - " + deal.id);
  /* const provider = await providerService.getProvByProvId(providerId);
  if (!provider) return;
  console.log("Got provider - ", provider)
  selectedProvider.value = provider; */

  providerProfileModal.value = true;
  
  //router.push({ name: "provider-profile", params: { id: providerId } })
}

const parseDmyTime = (str) => {
  const m = str?.match(/^(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, dd, mm, yyyy, HH, MM] = m.map(Number);
  return new Date(yyyy, mm - 1, dd, HH, MM);
}
// Create a new booking
const handleRequest = async (payload) => {
  console.log("Handling request client history... ", payload);
  const userId = await auth.user.id;
  const receiverId = selectedProvider.value?.user?.id;
  console.log("Sending request to " + selectedProvider.value?.user?.username);

  const dateObj = parseDmyTime(payload.date);
  let ms;
  if (dateObj) {
      //o.value = dateObj;
      ms = dateObj.getTime();
      console.log("Milliseconds:", ms);  // e.g. 1758976800000
  } else {
      console.log("Invalid date string");
  }

  const request = {
    author_id: userId,
    created: dateObj,
    created_ms: ms,
    dateStr: payload.date,
    header: payload.header,
    agreement: false,
    address: payload.address,
    latitude: payload.myLat,
    longitude: payload.myLng,
    zone: 0,
    professional: selectedProvider.value?.profession[0],
    isIncludeOffers: false,
    description: payload.content,
    status: "active",
  }


  orderProviderModal.value = false;
  //rs_success_msg.value = "Tilaus lähetetty onnistuneesti!"
  //isRequestSent.value = true;


  clientStore.onRequest(receiverId, userId, selectedProvider.value, user.value, request);

}

</script>
<style scoped>
.history {
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  padding: 16px;
  color: rgba(255, 255, 255, 0.92);
}

/* Header */
.history__header {
  margin-bottom: 12px;
}

.history__title {
  margin: 0;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.history__subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
}

/* Desktop table */
.historyTable {
  font-size: 14px;
}

.historyTable thead th {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.6);
  padding: 10px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.historyTable__row td {
  padding: 12px 8px;
  vertical-align: middle;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.historyTable__row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.history__muted {
  color: rgba(255, 255, 255, 0.7);
}

.history__strong {
  font-weight: 600;
}

/* Mobile cards */
.history__cards {
  display: grid;
  gap: 12px;
}

.historyCard {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  padding: 14px;
}

.historyCard__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.historyCard__date {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.70);
}

.historyCard__company {
  font-size: 15px;
  font-weight: 700;
  margin-top: 2px;
}

.historyCard__service {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 2px;
}

.historyCard__badge {
  white-space: nowrap;
}

.historyCard__actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

/* Details */
.history__detailTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

@media (max-width: 520px) {
  .history__detailTop {
    flex-direction: column;
    align-items: stretch;
  }
}

/* Two columns on desktop, one on mobile */
.history__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 820px) {
  .history__grid {
    grid-template-columns: 1fr;
  }
}

.historySection {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  padding: 14px;
}

.historySection__title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.kv {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 10px 12px;
  align-items: start;
}

@media (max-width: 520px) {
  .kv {
    grid-template-columns: 1fr;
  }
}

.kv__k {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.kv__v {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.chip:hover {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
  cursor: default;
}

.historySection__actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}
.modal-pro-first {
  display: flex;
  justify-content: space-between;
}
</style>