<template>
  <div class="history">
    <div style="display: flex; justify-content: right; cursor: pointer;">
        <MDBBtnClose white @click="router.go(-1)" />
    </div>
    <!-- LIST VIEW -->
    <div v-if="!showDetails">
      <div class="history__header">
        <h3 class="history__title">Tilatut palvelut</h3>
        <p class="history__subtitle">
          Valitse tilaus nähdäksesi tiedot ja varataksesi uudelleen.
        </p>
      </div>

      <!-- MOBILE: cards -->
      <div class="history__cards d-md-none">
        <div
          v-for="b in recipientConfirmedBookings"
          :key="b.id"
          class="historyCard"
        >
          <div class="historyCard__top">
            <div>
              <div class="historyCard__date">{{ b.date }}</div>
              <div class="historyCard__company">{{ b.company }}</div>
              <div class="historyCard__service">{{ b.header }}</div>
            </div>

            <span class="badge badge-success historyCard__badge">Valmis</span>
          </div>

          <div class="historyCard__actions">
            <MDBBtn outline="info" size="sm" @click="openDetails(b)">Tiedot</MDBBtn>
            <MDBBtn color="info" size="sm" @click="bookAgain(b)">
              Varaa uudelleen
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
          <tr v-for="b in recipientConfirmedBookings" :key="b.id" class="historyTable__row">
            <td class="history__muted">{{ b.date }}</td>
            <td class="history__strong">{{ b.company }}</td>
            <td class="history__muted">{{ b.header }}</td>
            <td class="text-end">
              <MDBBtn outline="info" size="sm" class="ms-2" @click="openDetails(b)">Tiedot</MDBBtn>
              <MDBBtn color="info" size="sm" class="ms-2" @click="bookAgain(b)">Varaa uudelleen</MDBBtn>
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
            <div class="kv__v">{{ selectedBooking?.date }}</div>

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
            <MDBBtn outline="info" @click="goToProvider(selectedBooking?.provider_id)">
              Näytä profiili
            </MDBBtn>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

// MDB components (names may vary slightly in your setup)
import { MDBTable, MDBBtn, MDBBtnClose } from "mdb-vue-ui-kit"

defineOptions ({
    name: "client-history"
})

// props example (use what you already have)
const props = defineProps({
  recipientConfirmedBookings: { type: Array, default: () => [] }
})

const router = useRouter()

const showDetails = ref(false)
const selectedBooking = ref(null)

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
  router.push({ name: "booking-create", params: { providerId: b.provider_id } })
}

function goToProvider(providerId) {
  if (!providerId) return
  router.push({ name: "provider-profile", params: { id: providerId } })
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
  grid-template-columns: 1fr 1fr;
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

.historySection__actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}
</style>