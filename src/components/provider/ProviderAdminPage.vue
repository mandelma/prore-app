<!-- ProviderAdminPage.vue (Vue 3 + <script setup> + MDB5 Vue UI Kit)
     npm i mdb-vue-ui-kit
-->
<template>
  <MDBContainer v-if="!provider">
    <p>Loading...</p>
  </MDBContainer>
  <MDBContainer v-else fluid class="py-3 provider-admin">
    <!-- Top header (sticky on mobile) -->

    

    <div class="topbar d-flex align-items-center justify-content-between gap-2 mb-3">
      <div class="min-w-0">
        <div class="d-flex align-items-center gap-2 min-w-0">
          <h5 class="mb-0 text-wrap text-start">{{ provider.pName || "Provider" }}</h5>
          
        </div>
        <small class="text-muted d-block text-start">
          <!-- Need to add provider database updatedAt field -->
          • Päivitetty: {{ formatDateTime(provider.updatedAt) }}
        </small>
      </div>
      <div class="d-flex align-items-center gap-2 flex-shrink-0">
        <MDBBadge v-if="provider.status" :color="provider.status === 'Saatavilla' ? 'success' : 'warning'">
          {{ provider.status }}
        </MDBBadge>
      </div>
    </div>


    <!-- Quick stats -->
    <MDBRow class="g-2 mb-3">
      <MDBCol col="6" md="3">
        <MDBCard class="h-100">
          <MDBCardBody class="py-3">
            <div class="text-muted small">Tulevat asiakkaat</div>
            <div class="fs-5 fw-semibold">{{ clients.length }}</div>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
      <MDBCol col="6" md="3">
        <MDBCard class="h-100">
          <MDBCardBody class="py-3">
            <div class="text-muted small">Tehtävät asiakkaat</div>
            <div class="fs-5 fw-semibold">{{ confirmedClients.length }}</div>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
      <MDBCol col="6" md="3">
        <MDBCard class="h-100">
          <MDBCardBody class="py-3">
            <div class="text-muted small">Valmis tehtävät</div>
            <div class="fs-5 fw-semibold">{{ billing.openInvoices }}</div>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
      <MDBCol col="6" md="3">
        <MDBCard class="page-card">
          <MDBCardBody class="py-3">
            <div class="text-muted small">PRO Käyttöaika</div>
            <!-- <div class="fs-5 fw-semibold">{{ alerts.length }}</div> -->
             <div>

              <div
                class="fs-5 fw-semibold"
                v-if="credit <= 0"
              >
                <p>Käyttöaika on päättynyt!</p>
                <p style="color: orangered; font-size: 12px; text-decoration: underline; cursor: pointer;" @click="router.push('/pay-plan')">Lattaa aikaa!</p>
              </div>
              <div v-else-if="credit <= 3 &&
                credit > 0">
                <p>{{ credit }} päivää</p>
                <p style="color: orangered; font-size: 12px; text-decoration: underline; cursor: pointer;" @click="router.push('/pay-plan')">Lattaa lisää aikaa!</p>
              </div>
              <div v-else>
                <div v-if="((pro.proTime - new Date().getTime()) / 86400000).toFixed() === 'NaN'" class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <div v-else>
                  <p>{{ credit }} päivää</p>
                </div>
              </div>
            </div>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
    </MDBRow>
    <!-- Panel info {{ isPanelInfoEditSection }} -->
    <MDBRow class="g-3">
      <!-- Provider info (editable rows) -->
      <MDBCol md="5" lg="4">
        <MDBCard class="h-100">
          <MDBCardBody v-if="!isPanelInfoEditSection">
            <!-- <div style="display: flex; justify-content: right;">
              <MDBBtn color="primary" @click="isPanelInfoEditSection = true">Muokkaa</MDBBtn>
            </div> -->
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h6 class="mb-0">Palveluntarjoaja</h6>
              <div class="d-flex gap-2">
                
                <MDBBtn size="sm" color="primary" @click="isPanelInfoEditSection = true">
                  Muokkaa
                </MDBBtn>
              </div>
            </div>

            <div class="vstack gap-3">
    
              <div style="text-align: left;">
                <!-- <div class="text-muted info-panel" >{{ draftProvider.name }}</div> -->
                <div class="text-muted info-panel">{{ draftProvider.description }}</div>
                <div class="text-muted info-panel">{{ draftProvider.address }}</div>
                <div class="text-muted info-panel">Toimintaalue {{ draftProvider.range ? draftProvider.range + ' km' : 0 + ' km' }}</div>
                <div class="text-muted info-panel">{{ draftProvider.profession.join(", ") }}</div>
                <div class="text-muted info-panel">Tuntihinta {{ draftProvider.priceByHour }} euroa</div>
                <div class="info-panel">
                  Muistiinpanot
                  <p class="text-muted">{{draftProvider?.notes ? draftProvider.notes : "Ei muistinpanoja"}}</p>
                </div>
                
              </div>

              <MDBTable borderless style="color: #ddd;">
                <tbody>
                  <tr>
                    <td style="text-align: left;">
                      
                      Status kartalla:
                    </td>
                    <td>
                      <div style="padding: 7px; border: 1px solid lightseagreen; border-radius: 50px;">
                        {{ draftProvider.status }}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: left;">
                      Seuranta kartalla:
                    </td>
                    <td>
                      <div style="border: 1px solid orange; padding: 7px; border-radius: 50px;">Aktiivinen</div>
                    </td>
                  </tr>
                </tbody>
              </MDBTable>

             
            </div>
          </MDBCardBody>
          <MDBCardBody v-else>
            
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h6 class="mb-0 no-edit-panel" @click="isPanelInfoEditSection = false">Poistu</h6>
              <div class="d-flex gap-2">
                <MDBBtn size="sm" color="light" outline @click="resetProvider" :disabled="busy || !providerDirty">
                  Reset
                </MDBBtn>
                <MDBBtn size="sm" color="primary" @click="saveProvider" :disabled="busy || !providerDirty">
                  Save
                </MDBBtn>
              </div>
            </div>

            <div class="vstack gap-3">
              
              
              <!-- <MDBInput label="Name" v-model="draftProvider.name" @input="markDirty('provider')" /> -->
              <MDBInput label="Kuvaus" v-model="draftProvider.description" @input="markDirty('provider')" />

              <fieldset class="fs-box">
                <legend class="fs-legend">Osoite</legend>
                <div>
                  <p class="text-muted" style="color:cornflowerblue; font-size: 12px;; text-align: left;">{{ draftProvider.address }}</p>

                  <address-autocomplete
                    v-model="pmForm.address"
                    label="Anna uusi osoitteesi..."
                    @place="onPlaceSelected" 
                  />
                </div>
              </fieldset>
              


              <!-- Current professions list -->
              <fieldset class="fs-box">
                <legend class="fs-legend">Ammatit</legend>
                <div>
                  <MDBTable  style="font-size: 14px; color: #ddd; width: 100%; text-align: left;">
                    <tbody>
                      <tr v-for="(pro, index) in draftProvider.profession" :key="pro">
                        <td>{{ pro }}</td>
                        <td>
                          <MDBBtnClose
                            v-if="draftProvider.profession.length > 1"
                            white
                            @click="removeProfession(index)"
                            :disabled="draftProvider.profession.length === 1"
                            title="At least one profession is required"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </MDBTable>

                  <!-- Optional helper text when only one left -->
                  <!-- <p v-if="draftProvider.profession.length === 1" style="color:#aaa; font-size: 12px;">
                    Vähintään yksi ammatti pitää olla valittuna.
                  </p> -->

                  <div class="field-wrapper">
                    <Select
                      style="width: 100%;"
                      v-model="selectedProfession"
                      :options="professions"
                      filter
                      optionLabel="label"
                      optionValue="label"
                      optionGroupLabel="label"
                      optionGroupChildren="items"
                      placeholder="Anna uusi ammatti"
                      class="w-full md:w-[30rem]"
                      showClear
                      appendTo="body"
                      @update:modelValue="onProfessionPicked"
                    />
                  </div>
                </div>
                
              </fieldset>
              

              <!-- <MDBInput label="Ammatti" v-model="draftProvider.profession" @input="markDirty('provider')" /> -->
              <MDBInput label="Toiminta alue - km" v-model="draftProvider.range" :value="field" @input="filterInput" />
              <!-- <MDBInput label="Email" type="email" v-model="draftProvider.email" @input="markDirty('provider')" />
              <MDBInput label="Phone" v-model="draftProvider.phone" @input="markDirty('provider')" /> -->
              <MDBInput label="Tuntihinta" type="text" v-model="draftProvider.priceByHour" :value="field" @input="filterInput" />

              <MDBTextarea label="Muistiinpanot..." rows="3" v-model="draftProvider.notes"
                @input="markDirty('provider')" />

              <MDBRow class="g-2">
                <MDBCol col="6">
                  <label class="form-label mb-1">Status kartalla</label>
                  <select class="form-select" v-model="draftProvider.status" @change="markDirty('provider')">
                    <option>Saatavilla</option>
                    <option>Sovitaessa</option>
                  </select>
                </MDBCol>
                <MDBCol col="6">
                  <!-- <label class="form-label mb-1">Timezone</label>
                  <select class="form-select" v-model="draftProvider.timezone" @change="markDirty('provider')">
                    <option value="Europe/Helsinki">Europe/Helsinki</option>
                    <option value="Europe/Stockholm">Europe/Stockholm</option>
                    <option value="UTC">UTC</option>
                  </select> -->
                </MDBCol>
              </MDBRow>

              <div class="d-flex align-items-center justify-content-between p-2 rounded bg-secondary">
                <div class="small">
                  <div class="fw-semibold">Sijainti</div>
                  <div class="text-muted">Salli sijaintisi seuranta</div>
                </div>
                <div class="form-check form-switch m-0">
                  <input class="form-check-input" type="checkbox" role="switch" v-model="draftProvider.portalEnabled"
                    @change="markDirty('provider')" />
                </div>
              </div>
            </div>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>

      <!-- Clients + extra useful sections -->
      <MDBCol md="7" lg="8">
        <!-- Clients -->
         
        <MDBCard class="mb-3">
          <MDBCardBody>
            <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2">
              <h6 class="mb-0">Asiakkaat</h6>

              <div class="d-flex gap-2">
                <div class="search-wrap">
                  <MDBInput size="sm" label="Hakuasiakkaat..." v-model="clientQuery" />
                </div>
              </div>
            </div>


            <!-- Mobile list -->
            <div class="d-md-none vstack gap-2">
              <client-offers-list :clients="filteredClients"/>
              

              <div v-if="filteredClients.length === 0" class="text-muted small py-2">
                Etsimäsi tieto puuttuu.
              </div>
            </div>

            <!-- Table on md+ -->
            <div class="d-none d-md-block">
              <client-offers-list :clients="filteredClients"/>
              

              <div v-if="filteredClients.length === 0" class="text-muted small py-2">
                Etsimäsi tieto puuttuu.
              </div>
            </div>
          </MDBCardBody>
        </MDBCard>

        <!-- Extras: schedule + alerts + billing snapshot -->
        <MDBRow class="g-3 extras-row">
          <MDBCol class="extras-col" lg="6">
            <MDBCard v-if="isCalendar">
              <MDBCardBody>
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <h6 class="mb-0">Tulevät tehtävät</h6>
                  <p class="no-calendar" @click="isCalendar = false">Valmis</p>
                  <!-- <MDBBtn size="sm" color="light" outline @click="openSchedule">Hallita</MDBBtn> -->
                </div>
              <calendar />
              </MDBCardBody>
              
              
            </MDBCard>
            
            <MDBCard v-else class="h-100">
              <MDBCardBody>
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <h6 class="mb-0">Tulevät tehtävät</h6>
                  <MDBBtn size="sm" color="light" outline @click="openSchedule">Kalenteri</MDBBtn>
                </div>

                <div class="vstack gap-2">
                  <div v-for="a in proCalendarEvents.slice(0, 5)" :key="a.id"
                    class="p-2 rounded border d-flex justify-content-between align-items-start gap-2">
                    <div class="min-w-0">
                      <div class="fw-semibold text-truncate">{{ a.user.firstName }}</div>
                      <div class="small text-muted text-truncate">
                        {{ formatDateTime(a.created) }} <!-- • {{ a.header }} -->
                      </div>
                    </div>
                    <MDBBadge :color="a.status === 'confirmed' ? 'success' : 'warning'">
                      {{ a.status }}
                    </MDBBadge>
                  </div>

                  <div v-if="proCalendarEvents.length === 0" class="text-muted small">
                    Ei tuleviä tehtäviä.
                  </div>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          <MDBCol class="extras-col" lg="6">
            <MDBCard class="h-100">
              <MDBCardBody>
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <h6 class="mb-0">Referenssit</h6>
                  <MDBBtn size="sm" color="primary" @click="addAlert">
                    <MDBIcon icon="plus" class="me-1" /> Lisää kuva
                  </MDBBtn>
                </div>
                <div>
                  <pro-gallery :images="reference"/>
                </div>
                <!-- <div class="vstack gap-2">
                  <div v-for="t in alerts" :key="t.id"
                    class="p-2 rounded border d-flex justify-content-between align-items-start gap-2">
                    <div class="min-w-0">
                      <div class="fw-semibold text-truncate">{{ t.title }}</div>
                      <div class="small text-muted text-truncate">{{ t.detail }}</div>
                    </div>
                    <MDBBtn size="sm" color="light" outline @click="completeAlert(t)">Done</MDBBtn>
                  </div>

                  <div class="pt-2 border-top">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <div class="fw-semibold">Billing snapshot</div>
                        <div class="small text-muted">
                          Next payout: {{ billing.nextPayout ? formatDate(billing.nextPayout)
                            : "—" }}
                        </div>
                      </div>
                      <MDBBtn size="sm" color="light" outline @click="openBilling">View</MDBBtn>
                    </div>
                  </div>
                </div> -->
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBCol>
    </MDBRow>

    <toast-handler 
      v-model="toastModel"
      :toast-name="toastState"
      :icon-state="toastIcon"
      :text="toastContent"
    />

    <!-- Simple toast -->
    <div class="toast-wrap" v-if="toast.show">
      <div class="toast-card shadow-sm border rounded p-3 bg-white">
        <div class="d-flex justify-content-between align-items-start gap-3">
          <div class="min-w-0">
            <div class="fw-semibold">{{ toast.title }}</div>
            <div class="small text-muted">{{ toast.message }}</div>
          </div>
          <button class="btn btn-sm btn-link p-0" @click="toast.show = false">✕</button>
        </div>
      </div>
    </div>
  </MDBContainer>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, reactive, ref, watch, nextTick } from "vue";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBBtnClose,
  MDBInput,
  MDBTextarea,
  MDBTable,
  MDBBadge,
  MDBIcon,
  MDBModal,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
} from "mdb-vue-ui-kit";
import { useRouter } from 'vue-router'
import Select from 'primevue/select';
import ProGallery from "./ProGallery.vue";
import professionList from '@/components/controllers/professions';
import AddressAutocomplete from "../AddressAutocomplete.vue";
import Stars from "../Stars.vue";
import { loadGoogleMaps } from "../controllers/loadGoogleMap";
import { storeToRefs } from "pinia";
import { useProStore } from "@/stores/providerStore";

import ToastHandler from "../helpers/ToastHandler.vue";
import Calendar from "../Calendar.vue";
//import ClientOffer from "./ClientOffer.vue";
import ClientOffersList from "./ClientOffersList.vue";
import providerService from '../../service/providers'

const providerStore = useProStore();
const router = useRouter();
const { incomingOffers, proCalendarEvents, reference } = storeToRefs(providerStore);

const credit = computed(() => providerStore.proCredit);
const provider = computed(() => providerStore.provider);

const profession = ref("");
const professions = professionList;

const selectedProfession = ref(null);

//const reference = ref([]);

const addressEl = ref(null)
let autocomplete = null
let placeListener = null

const selectedPlace = ref(null);
const pmForm = reactive({
  address: "",
  lat: null,
  lng: null
})

const pmError = reactive({});

const mapError = ref(false);



// Local editable draft (always an object so inputs never crash)
const draftProvider = reactive(emptyProviderDraft());

const providerDirty = computed(() => dirty.provider);

const isPanelInfoEditSection = ref(false);

const isCalendar = ref(false);

const field = ref("");

const clientOpen = ref(false);

//const clients = ref([]);
const clientQuery = ref("");

const validateProAddress = () => {

  if (!pmForm.address) return;

  if (pmForm.lat === null || pmForm.lng === null) {
    return "Valitse osoite listasta (ei pelkkää kirjoitusta)";
  }

  return;
};



watch(selectedPlace, (place) => {
  if (!place) return;

  pmForm.address = place.address;
  pmForm.lat = place.lat;
  pmForm.lng = place.lng;

  pmError.address = ""
});

// When store provider changes (loaded from DB / refreshed), copy to draft
watch(
  () => providerStore.provider,
  (p) => {
    const pro = p ?? null; // because providerStore.provider is a ref
    console.log("Pro ", pro)
    if (!pro) {
      Object.assign(draftProvider, emptyProviderDraft());
      providerDirty.value = false;
      return;
    }
    Object.assign(draftProvider, mapProviderToDraft(pro));
    providerDirty.value = false;
  },
  { immediate: true, deep: false }
);

const clients = computed(
  () => incomingOffers.value
)

const confirmedClients = computed(() => proCalendarEvents.value);





// Call this on input/change
function markProviderDirty() {
  providerDirty.value = true;
}



onMounted(() => {
  console.log("Clients -- ", clients.value)
  console.log("Confirmed clients - ", confirmedClients);
})

function onPlaceSelected(p) {
  pmForm.address = p.address
  pmForm.lat = p.lat
  pmForm.lng = p.lng

  // if you want to store it directly to your draft provider
  draftProvider.address = p.address
  markDirty("provider")
}

async function onProfessionPicked (val) {
  if (!val) return

  const p = String(val).trim()
  if (!p) return

  // ensure array exists
  if (!Array.isArray(draftProvider.profession)) draftProvider.profession = []

  // avoid duplicates
  if (!draftProvider.profession.includes(p)) {
    draftProvider.profession.push(p)
    markDirty("provider")
  }

  await nextTick()
  selectedProfession.value = null
}

function removeProfession(index) {
  // prevent removing the last one
  if (draftProvider.profession.length <= 1) return

  draftProvider.profession.splice(index, 1)
  markDirty("provider")
}

function normalizeProfessions(val) {
  // already correct
  if (Array.isArray(val)) {
    // if it's ["A, B"] -> split
    if (val.length === 1 && typeof val[0] === 'string' && val[0].includes(',')) {
      return val[0]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    }
    // if it's ["A","B"] -> keep
    return val.map(v => String(v).trim()).filter(Boolean)
  }

  // string -> split by comma
  if (typeof val === 'string') {
    return val
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  }

  // null/undefined -> empty
  return []
}

function resetProvider() {
  const pro = provider.value ?? null;
  Object.assign(draftProvider, pro ? mapProviderToDraft(pro) : emptyProviderDraft());
  // reset address autocomplete input
  pmForm.address = draftProvider.address
  pmForm.lat = null
  pmForm.lng = null
  providerDirty.value = false;
}

async function saveProvider() {
  const pro = providerStore.provider ?? null;
  console.log("Provider - ", pro);
  if (!pro) return;

  onToast("fas fa-check fa-lg me-2", `${pro.pName} tiedot ovat päivitetty onnistuneesti!`, "success");
  busy.value = true;
  try {
    // Only send editable fields
    const payload = toPlain(draftProvider);

    payload.profession = normalizeProfessions(payload.profession)
    payload.updatedAt = new Date();
    
    // Save via store -> store updates provider.value with DB result
    const updatedMain = await providerStore.updateProviderPanel(pro.id, payload);

    if (updatedMain) {
      isPanelInfoEditSection.value = false;
    }

    // No need to manually update draft; watcher will sync when provider.value changes
    providerDirty.value = false;
  } finally {
    busy.value = false;
  }
}


// ---- helpers ----
function emptyProviderDraft() {
  return {
    name: "",
    
    address: "",
    profession: [],
    status: "xx",
    
    notes: "",
    
  };
}

/* name: pro?.pName ?? "",
 email: pro?.email ?? "",
 phone: pro?.phone ?? "",
 timezone: pro?.timezone ?? "Europe/Helsinki",
 portalEnabled: !!pro?.portalEnabled,*/

// Creating provider object   profession: pro?.profession.join(', ') ?? "",
function mapProviderToDraft(pro) {
  return {
    name: pro?.pName ?? "",
    description: pro?.description ?? "",
    profession: normalizeProfessions(pro.profession),
    range: pro?.range ?? "",
    priceByHour: pro?.priceByHour ?? "",
    
    
    address: pro?.address ?? "",
    isAvailable24_7: pro?.isAvailable24_7 ?? "Active",
    
    notes: pro?.notes ?? "",
    status: pro?.status ?? ""
  };
}

function toPlain(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/**
 * Props
 * - providerId: this page should be used only for the selected provider (e.g. route param)
 */
const props = defineProps({
  providerId: { type: [String, Number], required: true },
});
const providerId = computed(() => props.providerId);

// State
const busy = ref(false);

const providerx = reactive({
  id: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  status: "Active",
  timezone: "Europe/Helsinki",
  notes: "",
  portalEnabled: true,
  updatedAt: null,
});

/* const draftProvider = reactive({
  name: "",
  email: "",
  phone: "",
  address: "",
  status: "Active",
  timezone: "Europe/Helsinki",
  notes: "",
  portalEnabled: true,
}); */



const upcomingAppointments = ref([]);
const alerts = ref([]);
const billing = reactive({ openInvoices: 0, nextPayout: null });

const dirty = reactive({ provider: false });

const clientModalOpen = ref(false);
const newClient = reactive({ name: "", email: "", status: "Active" });

const toast = reactive({ show: false, title: "", message: "" });
let toastTimer = null;

// Derived

const hasDirty = computed(() => providerDirty.value);

const toastModel = ref(false)
const toastState = ref('')
const toastIcon = ref('')
const toastContent = ref('')

const filteredClients = computed(() => {
  const q = clientQuery.value.trim().toLowerCase();
  if (!q) return clients.value;

  return clients.value.filter((c) => {
    const first = (c?.user?.firstName ?? "").toLowerCase();
    const last  = (c?.user?.lastName ?? "").toLowerCase();
    const status = (c?.status ?? "").toLowerCase();
    const email  = (c?.user?.email ?? c?.email ?? "").toLowerCase();

    return (
      first.includes(q) ||
      last.includes(q) ||
      email.includes(q) ||
      status.includes(q)
    );
  });
});



/* watchEffect(() => {
  console.log("first rendered item keys:", Object.keys(filteredClients.value?.[0] || {}))
}) */

// Lifecycle


// bootstrap();

// Actions
async function bootstrap() {
  busy.value = true;
  try {
    const [p, cs, appts, ts, b] = await Promise.all([
      apiGetProvider(providerId.value),
      apiGetClients(providerId.value),
      apiGetAppointments(providerId.value),
      apiGetAlerts(providerId.value),
      apiGetBilling(providerId.value),
    ]);

    //assignProvider(p);
    //assignDraftProvider(p);
    //clients.value = cs;
    upcomingAppointments.value = appts;
    alerts.value = ts;
    billing.openInvoices = b.openInvoices;
    billing.nextPayout = b.nextPayout;

    dirty.provider = false;
  } catch (e) {
    notify("Error", "Failed to load provider page.");
    // eslint-disable-next-line no-console
    console.error(e);
  } finally {
    busy.value = false;
  }
}

function refreshAll() {
  bootstrap();
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
  field.value = filtered;

  markDirty('provider');
})

function markDirty(section) {
  if (section === "provider") dirty.provider = true;
}

/* function resetProvider() {
  assignDraftProvider(provider);
  dirty.provider = false;
  notify("Reset", "Provider info restored.");
} */

/* async function saveProvider() {
  if (!draftProvider.name?.trim()) {
    notify("Validation", "Provider name is required.");
    return;
  }
  if (draftProvider.email && !isValidEmail(draftProvider.email)) {
    notify("Validation", "Please enter a valid email.");
    return;
  }

  busy.value = true;
  try {
    const saved = await apiUpdateProvider(providerId.value, toPlain(draftProvider));
    assignProvider(saved);
    assignDraftProvider(saved);
    dirty.provider = false;
    notify("Saved", "Provider info updated.");
  } catch (e) {
    notify("Error", "Could not save provider info.");
    // eslint-disable-next-line no-console
    console.error(e);
  } finally {
    busy.value = false;
  }
} */

async function saveAll() {
  if (providerDirty.value) await saveProvider();
  else notify("Nothing to save", "No changes detected.");
}

function openClientModal() {
  newClient.name = "";
  newClient.email = "";
  newClient.status = "Active";
  clientModalOpen.value = true;
}

async function createClient() {
  if (!newClient.name.trim()) {
    notify("Validation", "Client name is required.");
    return;
  }
  if (newClient.email && !isValidEmail(newClient.email)) {
    notify("Validation", "Please enter a valid email.");
    return;
  }

  busy.value = true;
  try {
    const created = await apiCreateClient(providerId.value, toPlain(newClient));
    clients.value = [created, ...clients.value];
    clientModalOpen.value = false;
    notify("Client added", `${created.name} linked to provider.`);
  } catch (e) {
    notify("Error", "Could not add client.");
    // eslint-disable-next-line no-console
    console.error(e);
  } finally {
    busy.value = false;
  }
}

function viewClient(c) {
  notify("Client", `Open client: ${c.user.firstName}`);
  onToast('fas fa-info-circle fa-lg me-2', `Asiakas ${c.user.firstName} tiedot`, "info");
  // Example:
  // router.push({ name: "ClientDetail", params: { clientId: c.id } })
}

function messageClient(c) {
  notify("Message", `Start message to: ${c.name}`);
}

async function unlinkClient(c) {
  const ok = window.confirm(`Unlink ${c.name} from this provider?`);
  if (!ok) return;

  busy.value = true;
  try {
    await apiUnlinkClient(providerId.value, c.id);
    clients.value = clients.value.filter((x) => x.id !== c.id);
    notify("Unlinked", `${c.name} removed from provider.`);
  } catch (e) {
    notify("Error", "Could not unlink client.");
    // eslint-disable-next-line no-console
    console.error(e);
  } finally {
    busy.value = false;
  }
}

function openSchedule() {
  notify("Schedule", "Open schedule management (wire to your router).");
  isCalendar.value = true;
}

function openBilling() {
  notify("Billing", "Open billing page (wire to your router).");
}

function addAlert() {
  const id = `t_${Math.random().toString(16).slice(2)}`;
  alerts.value = [{ id, title: "New task", detail: "Follow up with provider about missing docs." }, ...alerts.value];
  notify("Added", "Task created.");
}

function completeAlert(t) {
  alerts.value = alerts.value.filter((x) => x.id !== t.id);
  notify("Done", "Task completed.");
}

// Helpers
/* function assignProvider(p) {
  provider.id = p.id ?? providerId.value;
  provider.name = p.name ?? "";
  provider.email = p.email ?? "";
  provider.phone = p.phone ?? "";
  provider.address = p.address ?? "";
  provider.status = p.status ?? "Active";
  provider.timezone = p.timezone ?? "Europe/Helsinki";
  provider.notes = p.notes ?? "";
  provider.portalEnabled = !!p.portalEnabled;
  provider.updatedAt = p.updatedAt ?? null;
} */

/* function assignDraftProvider(p) {
  draftProvider.name = p.name ?? "";
  draftProvider.email = p.email ?? "";
  draftProvider.phone = p.phone ?? "";
  draftProvider.address = p.address ?? "";
  draftProvider.status = p.status ?? "Active";
  draftProvider.timezone = p.timezone ?? "Europe/Helsinki";
  draftProvider.notes = p.notes ?? "";
  draftProvider.portalEnabled = !!p.portalEnabled;
} */

/* function toPlain(obj) {
  return JSON.parse(JSON.stringify(obj));
} */

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function formatDateTime(iso) {
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

/* function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
} */


const onToast = (icon, content, color) => {
  console.log("Toast work?")
  toastState.value = color;
  toastIcon.value = icon;
  toastContent.value = content;
  toastModel.value = true;
}

function notify(title, message) {
  toast.show = true;
  toast.title = title;
  toast.message = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.show = false), 3500);
}

// -------- Mock API layer (replace with your real calls) --------
/* async function apiGetProvider(id) {
  await sleep(120);
  return {
    id,
    name: "Nordic Wellness Clinic",
    email: "admin@nordicwellness.example",
    phone: "+358 40 123 4567",
    address: "Esplanadi 1, Helsinki",
    status: "Active",
    timezone: "Europe/Helsinki",
    notes: "VIP provider. Contract renews in March.",
    portalEnabled: true,
    updatedAt: new Date().toISOString(),
  };
} */

async function apiUpdateProvider(id, payload) {
  await sleep(180);
  return { ...payload, id, updatedAt: new Date().toISOString() };
}

async function apiGetClients(providerId) {
  await sleep(120);
  return [
    { id: "c1", name: "Aino Korhonen", email: "aino@example.com", lastVisit: "2025-12-18T10:00:00.000Z", status: "Active" },
    { id: "c2", name: "Mika Laine", email: "mika@example.com", lastVisit: "2025-11-02T14:00:00.000Z", status: "Active" },
    { id: "c3", name: "Sara Niemi", email: "", lastVisit: null, status: "Inactive" },
  ].map((c) => ({ ...c, providerId }));
}

async function apiCreateClient(providerId, payload) {
  await sleep(180);
  return {
    id: `c_${Math.random().toString(16).slice(2)}`,
    name: payload.name,
    email: payload.email,
    status: payload.status,
    lastVisit: null,
    providerId,
  };
}

async function apiUnlinkClient() {
  await sleep(120);
  return true;
}

async function apiGetAppointments() {
  await sleep(120);
  return [
    { id: "a1", clientName: "Aino Korhonen", startAt: "2026-01-08T09:30:00.000Z", service: "Consultation", status: "Confirmed" },
    { id: "a2", clientName: "Mika Laine", startAt: "2026-01-10T12:00:00.000Z", service: "Follow-up", status: "Pending" },
  ];
}

async function apiGetAlerts() {
  await sleep(100);
  return [
    { id: "t1", title: "Missing insurance info", detail: "Client Sara Niemi has incomplete insurance fields." },
    { id: "t2", title: "Verify bank details", detail: "Bank payout details need re-validation." },
  ];
}

async function apiGetBilling() {
  await sleep(100);
  return { openInvoices: 2, nextPayout: "2026-01-15T00:00:00.000Z" };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
</script>

<style scoped>
.provider-admin {
  text-align: center;
  max-width: 1200px;
}

.topbar {
  position: sticky;
  top: 63px;
  z-index: 10;
  background: rgba(73, 67, 67, 0.92);
  backdrop-filter: blur(6px);
  padding: 0.5rem 0.50rem;
}

.no-edit-panel {
  
  color: red;
  cursor: pointer;
}

.no-calendar {
  color: red;
  cursor: pointer;
}

.min-w-0 {
  min-width: 0;
}

.search-wrap :deep(.form-outline) {
  min-width: 180px;
}

/* Stack the two "extras" columns earlier than lg */
@media (max-width: 1200px) { /* choose your pixel */
  .extras-row > .extras-col {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

/* Toast */
.toast-wrap {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 1050;
  display: flex;
  justify-content: center;
}

.toast-card {
  width: min(520px, 100%);
}

.client-card {
  border-radius: 14px;
}


.info-panel {
  border-bottom: 1px solid #2A3444;
  padding: 12px 0;
}

.fs-box {
  border: 1px solid #888;
  border-radius: 6px;
  padding: 1rem;
  min-inline-size: 0; /* important for flex layouts */
}

.fs-legend {
  padding: 0 8px;
  font-size: 0.8rem;
  margin-left: 100px;
  color: #ccc;

  /* 🔑 reset fixes */
  float: unset;
  width: auto;
}

.edit-profession-panel {
  border: 1px solid orange;
  padding: 7px;
}

:deep(.form-select) {
  background-color: #0f172a; /* dark slate */
  color: #e5e7eb;           /* light text */
  border-color: #334155;
  border-radius: 12px;
}

:deep(.form-select:focus) {
  border-color: #38bdf8;
  box-shadow: 0 0 0 0.2rem rgba(56, 189, 248, 0.25);
  background-color: #0f172a;
  color: #e5e7eb;
}



:deep(.form-select option) {
  background-color: #020617;
  color: #78859e;
}

.pac-container {
  z-index: 99999 !important;
}
</style>
