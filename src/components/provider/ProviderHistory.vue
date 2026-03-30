<template>
    <div class="history">
    <div v-if="!showDetails" style="display: flex; justify-content: right; cursor: pointer;">
        <MDBBtnClose white @click="router.go(-1)" />
    </div>
    <!-- LIST VIEW -->
    <div v-if="!showDetails">
      <div class="history__detailTop">
        <div class="history__header">
          <h3 class="history__title">Tarjotut palvelut</h3>
          <p class="history__subtitle">
            Valitse tilaus nähdäksesi tilauksen tiedot.
          </p>
        </div>
        <div class="search-wrap">
          <MDBInput size="sm" label="Haku..." v-model="clientQuery" />
        </div>
      </div>
      

      <!-- MOBILE: cards -->
      <div class="history__cards d-md-none">
        <div
          v-for="b in filteredClientsHistory"
          :key="b.id"
          class="historyCard"
        >
          <div class="historyCard__top">
            <div>
              <div class="historyCard__date">{{ formatDateTime(b.date) }}</div>
              <div class="historyCard__company">{{ b.name }}</div>
              <div class="historyCard__service">{{ b.header }}</div>
            </div>

            <span class="badge badge-success historyCard__badge">Valmis</span>
          </div>

          <div class="historyCard__actions">
            <MDBBtn outline="info" size="sm" @click="openDetails(b)">Tiedot</MDBBtn>
            <MDBBtn color="danger" size="sm" @click="removeRow(b)">
              Poista
            </MDBBtn>
          </div>
        </div>
      </div>

      <!-- DESKTOP: table -->
      <MDBTable borderless class="historyTable d-none d-md-table">
        <thead>
          <tr>
            <th>Päivä</th>
            <th>Asiakas</th>
            <th>Tehtävä</th>
            <th class="text-end">Toiminnot</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in filteredClientsHistory" :key="b.id" class="historyTable__row">
            <td class="history__muted">{{ formatDateTime(b.date) }}</td>
            <td class="history__strong">{{ b.name }}</td>
            <td class="history__muted">{{ b.header }}</td>
            <td class="text-end">
              <MDBBtn outline="info" size="sm" class="ms-2" @click="openDetails(b)">Tiedot</MDBBtn>
              <MDBBtn color="danger" size="sm" class="ms-2" @click="removeRow(b)">Poista</MDBBtn>
            </td>
          </tr>
        </tbody>
      </MDBTable>
    </div>

    <!-- DETAILS VIEW -->
    <div v-else>
      <div class="history__detailTop">
        <MDBBtn outline="light" size="sm" @click="closeDetails">← Takaisin</MDBBtn>

        
      </div>

      <div >
        <!-- Booking details -->
        <section class="historySection">
          <h4 class="historySection__title">Varaus</h4>

          <div class="kv">
            <div class="kv__k">Päivämäärä</div>
            <div class="kv__v">{{ formatDateTime(selectedRow?.date) }}</div>

            <div class="kv__k">Asiakas</div>
            <div class="kv__v">{{ selectedRow?.name }}</div>

            <div class="kv__k">Tehtävä</div>
            <div class="kv__v">{{ selectedRow?.header }}</div>

            <div class="kv__k">Kuvaus</div>
            <div class="kv__v">{{ selectedRow?.content }}</div>

            <div class="kv__k">Etäisyys</div>
            <div class="kv__v">{{ selectedRow?.distance }} km</div>

            <!-- <div class="kv__k">Tila</div>
            <div class="kv__v">
              <span class="badge badge-success">Valmis</span>
            </div> -->

            <!-- Optional fields if you have them -->
            <template v-if="selectedBooking?.price">
              <div class="kv__k">Hinta</div>
              <div class="kv__v">{{ selectedRow.price }} €</div>
            </template>

            <template v-if="selectedBooking?.notes">
              <div class="kv__k">Lisätiedot</div>
              <div class="kv__v">{{ selectedRow.notes }}</div>
            </template>
          </div>
        </section>



        <!-- Provider details -->
        <!-- <section class="historySection">
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
                  {{ pro }} xx
                </span>
              </div>
            </div>
          </div>

          <div class="historySection__actions">
            <MDBBtn outline="info" @click="goToProvider(selectedBooking?.deal)">
              Näytä profiili
            </MDBBtn>
          </div>
        </section> -->
      </div>
    </div>
  </div>
</template>
<script setup>
import { MDBBtn, MDBBtnClose, MDBInput } from 'mdb-vue-ui-kit';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProArchiveStore } from '@/stores/pArchiveStore';
import pArchiveService from '../../service/provider_history';

defineOptions({
  name: 'pro-archive'
})
const router = useRouter();
const proArchiveStore = useProArchiveStore();

const { providerHistory } = storeToRefs(proArchiveStore);

const clientQuery = ref("");
const showDetails = ref(false);
const selectedRow = ref(null);

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

const filteredClientsHistory = computed(() => {
  const q = clientQuery.value.trim().toLowerCase();
  if (!q) return providerHistory.value;

  return providerHistory.value.filter((c) => {
    const name = (c?.header ?? "").toLowerCase();
    /* const last  = (c?.user?.lastName ?? "").toLowerCase();
    const status = (c?.status ?? "").toLowerCase();
    const email  = (c?.user?.email ?? c?.email ?? "").toLowerCase(); */

    return (
      name.includes(q)
      /* last.includes(q) ||
      email.includes(q) ||
      status.includes(q) */
    );
  });
});

const openDetails = (booking) => {
  selectedRow.value = booking;
  showDetails.value = true;
}

const closeDetails = () => {
  showDetails.value = false;
  selectedRow.value = null;
}

const removeRow = async (booking) => {
  console.log("Removing archived booking " + booking.id);
  await pArchiveService.deleteProviderArchiveRow(booking.id);
  proArchiveStore.upsertArchive(booking.id);
  if (!providerHistory.length) router.push(-1);
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

/* pro archive search */
.search-wrap :deep(.form-outline) {
  min-width: 180px;
}

/* Desktop table */
.historyTable {
  width: 100%;
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
  /* width: 50%; */
  margin: 14px 0;
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