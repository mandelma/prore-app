<template>
  <div >
    <FullCalendar ref="calendarRef" height="auto" contentHeight="auto" aspectRatio={0.75} :options="options" />
    

  </div>

  <!-- Creating event modal in day view-->
  <MDBModal
      v-model="showCreate" center
      centered
      tabindex="-1"

      :modelValue="true"
      removeBackdrop
      :keyboard="false"
      :focus="false"
  >
    <MDBModalHeader class="modal-header-custom">
      <MDBModalTitle>Uusi merkintä</MDBModalTitle>
    </MDBModalHeader>
    <MDBModalBody>
      <div class="space-y-3">
        
        <MDBSelect 
          
          v-model:options="stateOptions" 
          
          label="Valitse merkinnän tyyppi" 
          style="margin-bottom: 20px;"
        />

        <!-- Option {{ stateOptions[1].selected }} -->

        <MDBInput v-if="stateOptions[1].selected" v-model="form.title" label="Otsikko" wrapperClass="mb-4" />

        <MDBTextarea v-if="stateOptions[1].selected" v-model="form.note" label="Kuvaus... *" rows="3" wrapperClass="mb-4"/>

        <div class="text-sm opacity-80">
          <div><strong>Aloitus:</strong> {{ formatLocalDate(form.start) }}</div>
          <div><strong>Loppu:</strong>   {{ formatLocalDate(form.end) }}</div>
          <!-- <div><strong>Loppu:</strong>   {{ form.end?.toLocaleString() }}</div> -->
        </div>
      </div>
    </MDBModalBody>
    <MDBModalFooter class="footer-buttons">
      <MDBBtn color="danger" outline @click="showCreate=false">Poistu</MDBBtn>
      
      <MDBBtn color="primary" @click="saveEvent">Tallentaa</MDBBtn>
    </MDBModalFooter>
  </MDBModal>


  <!-- Edit event   :modelValue="true"-->
  <MDBModal
    v-model="showEdit" center
    centered
    tabindex="-1"

    :modelValue="true"
    removeBackdrop
    :keyboard="false"
    :focus="false"
  > 
    <!-- v-if="event_state === 'vacation' || event_state === 'time'"  v-if="event_state === 'vacation' || event_state === 'time' && !selectedEvent.allDay" -->
    <MDBModalHeader class="modal-header-custom">
      <MDBModalTitle> {{ event_state === 'vacation' ? 'Muokkaa muistinpanoa' : 'Muokkaa aikamerkintää' }}</MDBModalTitle>
    </MDBModalHeader>
    <MDBModalBody>
      <div class="space-y-3">
        <!--  -->
        <div v-if="event_state === 'vacation'">
          <MDBInput v-model="editForm.title" label="Otsikko" wrapperClass="mb-4" />
          <MDBTextarea v-model="editForm.note" label="Note" rows="3" />
        </div>
        
        
        <div v-else-if="event_state === 'time'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          
            <div><strong>Aloitus:</strong> {{ formatLocalDate(editForm.start) }}</div>

            <div class="field-wrapper">
                <MDBDateTimepicker
                    size="lg"
                    label="Valitse start"
                    v-model="editForm.start"
                    :valueType="'date'"
                
                    :datepicker="{
                    ...L,
                    format: 'YYYY-MM-DD'
                  }"
                  
                    :timepicker="{
                    ...L,
                    hoursFormat: 24
                  }"

                    :key="reInitKey"
                    disablePast
                />
                
            </div>

            <div><strong>Loppu:</strong>   {{ formatLocalDate(editForm.end) }}</div>

            <div class="field-wrapper">
                <MDBDateTimepicker
                    size="lg"
                    label="Valitse loppu"
                    v-model="editForm.end"
                    :valueType="'date'" 
                    
                    :datepicker="{
                    ...L,
                    format: 'YYYY-MM-DD'
                  }"
                  
                    :timepicker="{
                    ...L,
                    hoursFormat: 24
                  }"

                    :key="reInitKey"
                    disablePast
                />
                
            </div>

          </div>

        </div>

        <div class="text-sm opacity-80">
          <!-- <div><strong>Loppu:</strong>   {{ form.end?.toLocaleString() }}</div> -->
        </div>

        
      </div>
    </MDBModalBody>
    <MDBModalFooter class="footer-buttons">
      <MDBBtn color="secondary" outline @click="showEdit=false">Peruuta</MDBBtn>
      <MDBBtn color="primary" @click="saveEventEdits">Tallentaa</MDBBtn>
    </MDBModalFooter>
  </MDBModal>

  <!-- Opening client and provider event edit -->
  <MDBModal
    v-model="showEventEdit"
    centered
    tabindex="-1"
    removeBackdrop
    :keyboard="false"
    :focus="false"
  >
    <MDBModalHeader class="modal-header-custom">
      <MDBModalTitle>Muokkaa tarjousta</MDBModalTitle>
    </MDBModalHeader>

    <MDBModalBody>
      <MDBInput
        v-model="editOfferForm.title"
        label="Palvelu"
        wrapperClass="mb-4"
      />

      <MDBTextarea
        v-model="editOfferForm.note"
        label="Kuvaus"
        rows="3"
        wrapperClass="mb-4"
      />

      <MDBInput
        v-model="editOfferForm.address"
        label="Sijainti"
        wrapperClass="mb-4"
      />

      <MDBInput
        v-model="editOfferForm.priceOffer"
        label="Hinta-arvio"
        type="number"
        wrapperClass="mb-4"
      />
    </MDBModalBody>

    <MDBModalFooter class="footer-buttons">
      <MDBBtn color="secondary" outline @click="showEventEdit = false">
        Peruuta
      </MDBBtn>

      <MDBBtn color="primary" @click="saveOfferEdit">
        Tallenna
      </MDBBtn>
    </MDBModalFooter>
  </MDBModal>

  <!-- Open time event edit -->
  <MDBModal
    v-model="showTimeEventEdit"
    centered
    tabindex="-1"
    removeBackdrop
    :keyboard="false"
    :focus="false"
  >
    <MDBModalHeader class="modal-header-custom">
      <MDBModalTitle>Muokkaa saattavillaoloaikaa</MDBModalTitle>
    </MDBModalHeader>

    <MDBModalBody>
      <p>Time event edit form...</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        <div><strong>Aloitus:</strong> {{ formatLocalDate(editForm.start) }}</div>

        <div class="field-wrapper">
            <MDBDateTimepicker
                size="lg"
                label="Valitse start"
                v-model="editForm.start"
                :valueType="'date'"
            
                :datepicker="{
                ...L,
                format: 'YYYY-MM-DD'
              }"
              
                :timepicker="{
                ...L,
                hoursFormat: 24
              }"

                :key="reInitKey"
                disablePast
            />
            
        </div>

        <div><strong>Loppu:</strong>   {{ formatLocalDate(editForm.end) }}</div>

        <div class="field-wrapper">
            <MDBDateTimepicker
                size="lg"
                label="Valitse loppu"
                v-model="editForm.end"
                :valueType="'date'" 
                
                :datepicker="{
                ...L,
                format: 'YYYY-MM-DD'
              }"
                
                :timepicker="{
                ...L,
                hoursFormat: 24
              }"

                :key="reInitKey"
                disablePast
            />
            
        </div>

      </div>
    </MDBModalBody>

    <MDBModalFooter class="footer-buttons">
      <MDBBtn color="secondary" outline @click="showTimeEventEdit = false">
        Peruuta
      </MDBBtn>

      <MDBBtn color="primary" @click="saveTimeEventEdit">
        Tallenna
      </MDBBtn>
    </MDBModalFooter>

  </MDBModal>
  
  <!-- Opening provider time event -->
  <MDBModal
    v-model="showTimeEventModal"
    tabindex="-1"
    centered
    :modelValue="true"
    removeBackdrop
    :keyboard="false"
    :focus="false"
    scrollable
  >
    <MDBModalHeader class="modal-header-custom">
      <MDBModalTitle>{{ formatDateTitle(selectedEvent?.start) }}</MDBModalTitle>
    </MDBModalHeader>

    <MDBModalBody class="event-modal-body">
      

      <h2 class="event-title">
        {{ selectedEvent?.allDay ? 'Koko päivän saattavilla' : 'Saattavilla:' }}
      </h2>

      <div class="event-date">
        {{
          selectedEvent?.start && selectedEvent?.end &&
          formatLocalDate(selectedEvent.start).split(' ')[0] === formatLocalDate(selectedEvent.end).split(' ')[0]
            ? 'klo: ' + formatLocalTime(selectedEvent.start) + ' - ' + formatLocalTime(selectedEvent.end)
            : formatLocalDate(selectedEvent.start) + ' - ' + formatLocalDate(selectedEvent.end)
        }}

      </div>

      <!-- <div class="event-date">
        {{ selectedEvent?.start ? formatLocalDate(selectedEvent.start) : '—' }}
      </div>

      <div class="event-date">
        {{ selectedEvent?.start ? formatLocalDate(selectedEvent.end) : '—' }}
      </div> -->

      <!-- <p class="event-subtitle">
        {{ selectedEvent?.note || '—' }}
      </p> -->

      <!-- <div class="event-note">
        {{ selectedEvent?.location }}
      </div>   -->
    </MDBModalBody>

    <MDBModalFooter class="footer-buttons">
      <MDBBtn  color="danger" outline @click="deleteFromPreview">Poistaa</MDBBtn>
      <MDBBtn   color="primary" @click="openEditModalFromPreview">Muokkaa</MDBBtn>
      <MDBBtn color="secondary" @click="showTimeEventModal = false">Poistu</MDBBtn>
    </MDBModalFooter>
  </MDBModal>

  <!-- Opening provider notes event -->
  <MDBModal
    v-model="showNotesEventModal"
    tabindex="-1"
    centered
    :modelValue="true"
    removeBackdrop
    :keyboard="false"
    :focus="false"
    scrollable
  >
    <MDBModalHeader class="modal-header-custom">
      <MDBModalTitle>{{ selectedEvent?.title || '—' }}</MDBModalTitle>
    </MDBModalHeader>
    <!-- v-if="event_state === 'vacation' || event_state === 'time'"  v-if="event_state === 'vacation' || event_state === 'time' && !selectedEvent.allDay" -->
     <MDBModalBody class="event-modal-body">
     </MDBModalBody>
     
      <div class="event-card" style="margin: 20px; border-top: 2px solid rgb(231, 134, 134);">
        <div class="event-date">
          {{ selectedEvent?.start ? formatLocalDate(selectedEvent.start) : '—' }}
        </div>

        <p class="event-subtitle">
          {{ selectedEvent?.note || '—' }}
        </p>
      </div>
      
    <MDBModalFooter class="footer-buttons">
      <MDBBtn  color="danger" outline @click="deleteFromPreview">Poistaa</MDBBtn>
      <MDBBtn   color="primary" @click="openEditModalFromPreview">Muokkaa</MDBBtn>
      <MDBBtn color="secondary" @click="showNotesEventModal = false">Poistu</MDBBtn>
    </MDBModalFooter>
  </MDBModal>

  <!-- Opening client event modal -->
  <MDBModal
    v-model="showClientEventModal"
    tabindex="-1"
    centered
    :modelValue="true"
    removeBackdrop
    :keyboard="false"
    :focus="false"
    scrollable
  >
    <MDBModalHeader class="modal-header-custom">
      <MDBModalTitle><h5 style="color: #48769c;">Sopimus palvelun vastaanottajana</h5></MDBModalTitle>
    </MDBModalHeader>

    <MDBModalBody class="event-modal-body">

      <h2 class="event-title">
         Palveluntarjoaja tarjoaa palvelua.
      </h2>

      <div class="event-date">
        {{ selectedEvent?.start ? formatLocalDate(selectedEvent.start) : '—' }}
      </div>

      <p class="event-subtitle">
        Tarjous on varattu tälle ajankohdalle. Tarkista tarjouksen tiedot alta.
      </p>

      <div class="event-card">
        <h4>Tarjouksen tiedot</h4>

        <div class="info-row">
          <span>Palvelu</span>
          <strong>{{ selectedEvent?.title || '—' }}</strong>
        </div>

        <div class="info-row">
          <span>Kuvaus</span>
          <strong v-html="selectedEvent?.note || '—'"></strong>
        </div>
        <!-- v-if="selectedEvent?.location" -->
        <div class="info-row" >
          <span>Sijainti</span>
          <strong>{{ selectedEvent?.address }}</strong>
        </div>
        <!-- selectedEvent?.priceOffer + " €" || 'Sovitaan erikseen' -->
        <div class="info-row">
          <span>Hinta-arvio</span>
          <strong >{{ selectedEvent?.budget }} €</strong>
        </div>

        <div class="info-row">
          <span>Tila</span>
          <strong class="status-waiting">Sovittu</strong>
        </div>
      </div>

      <div class="event-note">
        {{ selectedEvent?.location }}
        <i class="far fa-comments fa-lg event-chat" @click="onEventChat(selectedEvent?.otherId, selectedEvent?.id)"></i>
      </div>
    </MDBModalBody>

    <MDBModalFooter class="footer-buttons">
      <MDBBtn color="secondary" @click="openClientEventEdit">Muokkaa</MDBBtn>
      <MDBBtn color="danger" @click="showClientEventModal = false">Poistu</MDBBtn>
    </MDBModalFooter>
  </MDBModal>


  <!-- Opening provider event modal -->
  <MDBModal
      v-model="showProEventModal"
      tabindex="-1"
      centered
      :modelValue="true"
      removeBackdrop
      :keyboard="false"
      :focus="false"
      scrollable
  >
  
    <!-- formatEventDate(new Date(selectedEvent.start)) -->
    <MDBModalHeader class="modal-header-custom">
      <MDBModalTitle><h5 style="color: #097a5e;">Sopimus palveluntarjoajana</h5></MDBModalTitle>
    </MDBModalHeader>
    <!-- <MDBModalBody>
      <div v-if="selectedEvent.allDay">
        <h3>Koko päivän</h3>
        <div v-if="selectedEvent.note" v-html="selectedEvent.note"></div>
      </div>

      <div v-else>
        <p><strong></strong> {{ selectedEvent?.start ? formatLocalDate(selectedEvent.start) : '—' }}</p>
        <p v-if="event_state === 'time'"><strong></strong> {{ selectedEvent?.end ? formatLocalDate(selectedEvent.end) : '—' }}</p>
        
        <div v-if="selectedEvent.note" v-html="selectedEvent.note"></div>
        <p v-if="selectedEvent.location">{{ selectedEvent.location }}</p>
      </div>

    </MDBModalBody> -->
    <MDBModalBody class="event-modal-body">
      <h2 class="event-title">
        {{ selectedEvent?.client || 'Asiakas'}} odottaa palvelutarjousta
      </h2>

      <div class="event-date">
        {{ selectedEvent?.start ? formatLocalDate(selectedEvent.start) : '—' }}
      </div>

      <p class="event-subtitle">
        Tilaus on varattu tälle ajankohdalle. Tarkista tilauksen tiedot alta.
      </p>

      <div class="event-card">
        <h4>Tilauksen tiedot</h4>

        <div class="info-row">
          <span>Palvelu</span>
          <strong>{{ selectedEvent?.title || '—' }}</strong>
        </div>

        <div class="info-row">
          <span>Kuvaus</span>
          <strong v-html="selectedEvent?.note || '—'"></strong>
        </div>

        <div class="info-row" v-if="selectedEvent?.location">
          <span>Sijainti</span>
          <strong>{{ selectedEvent.address }}</strong>
        </div>

        <div class="info-row">
          <span>Hinta-arvio</span>
          <strong>{{ selectedEvent?.budget + ' €' || 'Sovitaan erikseen' }}</strong>
        </div>

        <div class="info-row">
          <span>Tila</span>
          <strong class="status-waiting">Sovittu</strong>
        </div>
      </div>

      <div class="event-note">
        {{ selectedEvent?.location }}
        <i class="far fa-comments fa-lg event-chat" @click="onEventChat(selectedEvent?.otherId, selectedEvent?.id)"></i>
      </div>
    </MDBModalBody>
    <MDBModalFooter>
      <MDBBtn v-if="event_state === 'vacation' || event_state === 'time'" color="danger" outline @click="deleteFromPreview">Poistaa</MDBBtn>
      <MDBBtn v-if="event_state === 'vacation' || event_state === 'time' && !selectedEvent.allDay"  color="primary" @click="openEditModalFromPreview">Muokkaa</MDBBtn>
      <MDBBtn color="secondary" outline @click="showProEventModal=false">Peruuttaa</MDBBtn>
      <!-- <MDBBtn color="danger" @click="deleteEvent">Delete</MDBBtn> -->
    </MDBModalFooter>
  </MDBModal>

</template>

<script setup>
import { MDBModal, MDBModalHeader, MDBModalTitle, MDBBtn, MDBModalBody, MDBModalFooter, MDBInput, MDBTextarea, MDBDateTimepicker, MDBSelect } from 'mdb-vue-ui-kit';

import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'   // drag/drop & select
import { formatDate } from '@fullcalendar/core'
import Legend from '../components/Legend.vue'
import { EVENT_TYPES } from '../components/controllers/eventTypes.js'

import fiLocale from '@fullcalendar/core/locales/fi'
import svLocale from '@fullcalendar/core/locales/sv'
import etLocale from '@fullcalendar/core/locales/et'
import enLocale from '@fullcalendar/core/locales/en-gb'
import { getBottomRightAnchor } from './helpers/chatGeometry.js';

import { storeToRefs } from 'pinia';
import { useLoginStore } from '@/stores/login';
import { useClientStore } from '@/stores/recipientStore';
import { useProStore } from '@/stores/providerStore';

defineProps({
  count: {type: Number},
  days: Array
})


const emit = defineEmits(['over', 'open-chat'])

const auth = useLoginStore();
const clientStore = useClientStore();
const proStore = useProStore();

const { user } = storeToRefs(auth);
const { clientConfirmed } = storeToRefs(clientStore);
const { isUserPro, proCalendarEvents, proTimetable } = storeToRefs(proStore);

const { locale } = useI18n()
// const events = ref([
//   { id: '1', title: 'Team sync', start: '2025-09-16T10:00:00', end: '2025-09-16T11:00:00', extendedProps: { type: 'meeting', meetingId: 'ABC123', location: 'Room 1' } },
//   { id: '2', title: 'Team sync',     start: '2025-09-16T10:00:00', end: '2025-09-16T11:00:00', extendedProps: { type: 'meeting', location: 'Room 2' } },
//   { id: '3', title: 'Client call',   start: '2025-09-18T13:30:00', end: '2025-09-18T14:00:00', extendedProps: { type: 'client', location: 'Room 3' } },
//   { id: '4', title: 'Vacation',      start: '2025-09-20', allDay: true, extendedProps: { type: 'vacation', location: 'Room 4' } },
//   { id: '5', title: 'Write report',  start: '2025-09-19T09:00:00', end: '2025-09-19T10:00:00', extendedProps: { type: 'task', location: 'Room 5' } },
//
// ])
//
// // state for modal
const showTimeEventModal = ref(false);
const showNotesEventModal = ref(false);
const showProEventModal = ref(false)
const showClientEventModal = ref(false);
const selectedEvent = ref(null)

const showEdit = ref(false)
const showTimeEventEdit = ref(false);
const showEventEdit = ref(false);


const L = computed(() => {
  switch (locale.value) {
    case 'en':
      return {
        firstDay: 0,
        title: "Select date",
        monthsFull:  ['January','February','March','April','May','June','July','August','September','October','November','December'],
        monthsShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        weekdaysFull:  ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        weekdaysShort: ['Su','Mo','Tu','We','Th','Fr','Sa'],
        weekdaysNarrow: ['S','M','T','W','T','F','S'],
        cancelBtnText: 'Cancel',

        cancelLabel: 'Cansel',
        okLabel: 'OK',
        twelveHour: true


      }
    case 'sv':
      return {
        firstDay: 1,
        title: "Rootsi date",
        monthsFull:  ['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december'],
        monthsShort: ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'],
        weekdaysFull:  ['söndag','måndag','tisdag','onsdag','torsdag','fredag','lördag'],
        weekdaysShort: ['sö','må','ti','on','to','fr','lö'],
        weekdaysNarrow: ['S','M','T','O','T','F','L'],
        cancelBtnText: 'Avbryt',

        cancelLabel: 'Avbryt',
        okLabel: 'OK',
        twelveHour: false
      }
    case 'et':
      return {
        firstDay: 1,
        title: "Vali kuupäev",
        monthsFull:  ['jaanuar','veebruar','märts','aprill','mai','juuni','juuli','august','september','oktoober','november','detsember'],
        monthsShort: ['jaan','veebr','märts','apr','mai','juuni','juuli','aug','sept','okt','nov','dets'],
        weekdaysFull:  ['pühapäev','esmaspäev','teisipäev','kolmapäev','neljapäev','reede','laupäev'],
        weekdaysShort: ['P','E','T','K','N','R','L'],
        weekdaysNarrow: ['P','E','T','K','N','R','L'],
        cancelBtnText: 'Tühista',

        cancelLabel: 'Tühista',
        okLabel: 'OK',
        twelveHour: false
      }
    default:
      return {
        firstDay: 1,
        title: "Valitse päivämäärä",
        monthsFull:  ['tammikuu','helmikuu','maaliskuu','huhtikuu','toukokuu','kesäkuu','heinäkuu','elokuu','syyskuu','lokakuu','marraskuu','joulukuu'],
        monthsShort: ['tammi','helmi','maalis','huhti','touko','kesä','heinä','elo','syys','loka','marras','joulu'],
        weekdaysFull:  ['sunnuntai','maanantai','tiistai','keskiviikko','torstai','perjantai','lauantai'],
        weekdaysShort: ['su','ma','ti','ke','to','pe','la'],
        weekdaysNarrow: ['S','M','T','K','T','P','L'],
        cancelBtnText: 'Peruuta',
        clearLabel: 'Poista',

        cancelLabel: 'Peruuta',
        okLabel: 'Ok',
        twelveHour: false
      }
  }
})

const event_state = ref("");

const createdEvents = ref([]);

const toDate = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'string') {
    const d = new Date(v);           // handles "...+00:00", "...Z", etc.
    return isNaN(+d) ? null : d;
  }
  if (typeof v === 'number') return new Date(v);      // epoch ms
  if (v && typeof v === 'object' && 'seconds' in v)   // Firestore Timestamp
    return new Date(v.seconds * 1000);
  return null;
};

const events = computed(() => [
  ...clientConfirmed.value.map(cc => ({
    id: cc.id,
    title: cc?.header,
    start: toDate(cc.created),
    end: toDate(cc.created),

    startEditable: false,
    durationEditable: false,
    address: cc?.isIncludeOffers ? (cc?.offers?.placeOrGo === 'go' ? cc?.address : cc?.offers?.provider?.address) : 'Sovitaan erikseen',
    extendedProps: {
      /* type: "offer", */
      otherId: cc?.confirmed_provider_user_id,
      type: "client",
      canEdit: false,
      canResize: false,
      address:  cc?.offer?.placeOrGo !== '' ? (cc?.offer?.placeOrGo === 'go' ? cc.offer.name + " tulossa" : cc.offer.name + " odottaa!") : 'Sovitaan erikseen',
      priceOffer: cc?.offer?.price,
      budget: cc.isIncludeOffers ? cc?.offer?.price : cc?.budget.min + " - " + cc?.budget.max,
      location: cc?.offer.placeOrGo !== '' ? (cc?.offer?.placeOrGo === 'go' ? cc.offer.name + " tulossa" : cc.offer.name + " odottaa!") : 'Palvelun sijainti sopimuksen mukaan',
      note: cc.description || ' - '
      /* `
        <h3>Tilaus:</h3>
        <ul>
          <li><strong>Tehtävä:</strong> ${cc.header}</li>
          <li><strong>Tehtävän kuvaus:</strong> ${cc.description || '–'}</li>
        </ul>
      ` */
    } 
  })),
  // Confirmed offer in calendar
  ...proCalendarEvents.value.map(pce => {
    const offer = pce.offers?.find(o => o.sender === user.value.id)
    const place = offer?.placeOrGo || "";
    const dist = offer?.distance;
    const duration = offer?.duration;
    const price = offer?.price || "";
    
    return {
      id: pce.id,
      title: pce.header,
      
      start: toDate(pce.created),
      startEditable: false,
      durationEditable: false,
      extendedProps: {
        /* type: "booking", */
        type: "pro",
        canEdit: false,
        canResize: false,
        otherId: pce?.author_id,
        client: pce?.user?.firstName,
        note: pce.description,
        address: `${pce?.isIncludeOffers ? (place === 'go' ? pce.address : pce?.offers?.provider?.address) : 'Sovitaan erikseen'}`,
        priceOffer: pce?.offer?.price,
        budget: pce?.isIncludeOffers ? pce?.offer?.price : pce?.budget.min + " - " + pce?.budget.max,
        /* place === 'go' ? `
          <p>Tilauksen tiedot:</p>
          <ul>
            <li><strong>Osoite - </strong> ${pce.address}</li>
            <li><strong>Etäisyys - </strong> ${dist} km</li>
            <li><strong>Matkan aikaa noin </strong> ${duration}</li>
            <li><strong>Hinta - </strong> ${price} Eur</li>
          </ul>
        `
        :
        `
          <p>Tilauksen tiedot:</p>
          <ul>
            <li><strong/>Kuvaus: </strong> ${pce.description}</li>
            <li><strong>Hinta: </strong> ${price}</li>
          </ul>
        ` */
        location: pce?.isIncludeOffers ?(place === 'go' ? "Meno asiakkaan luokse" : "Asiakas tulossa!") : 'Palvelun sijainti sopimuksen mukaan'
      }
    }
  }),
  ...proTimetable.value.map(ppt => ({
    id: ppt.id,
    title: ppt.title,
    start: toDate(ppt.start),
    end: toDate(ppt.end),
    startEditable: true,
    durationEditable: true,
    allDay: ppt.isAllDay,
    extendedProps: {
      type: ppt.state,
      canEdit: true,
      canResize: true,
      note: ppt.content?.trim() || '',
    }
  })),
  //...createdEvents.value
])

const today = new Date();

// Only future (or today) events
const filteredEvents = computed(() =>
  events.value.filter(e => {
    const t = new Date(e.start).getTime()
    return t >= new Date().getTime() //startOfToday.value
  })
)

const stateOptions = ref([
  {text: "🕒 Vapaa aika", value: "time"},
  {text: "📝 Muistiinpano", value: "vacation"}
])


const selectedState = computed(() => {
  const sel = stateOptions.value.find(o => o.selected);
  return sel ? sel.value : null;
  
});

/* ----- Create-event modal state ----- */
const calendarRef = ref(null)
const showCreate = ref(false)



const form = ref({
  title: '',
  location: '',
  type: selectedState,
  note: '',
  allDay: true,
  start: null, // JS Date
  end: null,   // JS Date
})

const editForm = ref({
  id: '',
  title: '',
  start: '',
  end: '',
  location: '',
  note: ''
})

const editOfferForm = ref({
  id: '',
  title: '',
  note: '',
  address: '',
  priceOffer: '',
  location: ''
})

onMounted(() => {
  console.log("Mounted is on...");
  //const eventDate = new Date("2025-10-31T15:00:00.000Z")
  //const now = new Date()
})

function openClientEventEdit() {
  editOfferForm.value = {
    id: selectedEvent.value?.id || '',
    title: selectedEvent.value?.title || '',
    note: selectedEvent.value?.note || '',
    address: selectedEvent.value?.address || '',
    priceOffer: selectedEvent.value?.priceOffer || '',
    location: selectedEvent.value?.location || ''
  }

  showClientEventModal.value = false
  showEventEdit.value = true
}

async function saveOfferEdit() {
  const payload = {
    id: editOfferForm.value.id,
    title: editOfferForm.value.title,
    note: editOfferForm.value.note,
    address: editOfferForm.value.address,
    priceOffer: editOfferForm.value.priceOffer,
    location: editOfferForm.value.location
  }

  const payloadForDatabase = {

  }

  //await proStore.onEditOffer(payload.id, payload)
  //await clientStore.updateClientMain(payload.id, payload);
  await clientStore.updatingBookingOffer(payload.id, {
    price: Number(editOfferForm.value.priceOffer),
    placeOrGo: editOfferForm.value.placeOrGo || ''
  })
  selectedEvent.value = {
    ...selectedEvent.value,
    ...payload
  }

  showEventEdit.value = false;
  showClientEventModal.value = true;
}

const onEventChat = (otherId, eventId) => {
  console.log("Clicked on chat - " + otherId + "event id - " + eventId);
  emit("open-chat", {
    otherId,
    bookingId: eventId,
    mode: "pro",
    anchor: getBottomRightAnchor()
  });
}

const formatLocalDate = (value) => {
  const d = fromLocalInput(value);
  if (!isValidDate(d)) return '';
  return new Intl.DateTimeFormat('fi-FI', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Helsinki',
    hour12: false,
    hourCycle: 'h23',
  }).format(d);
};

const formatLocalTime = (date) => {
  return new Date(date).toLocaleTimeString('fi-FI', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/* For time title formatting */
const formatDateTitle = (date) => {
  return new Intl.DateTimeFormat('fi-FI', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Helsinki',
  }).format(new Date(date));
};

/* ensure end exists (30 min for timed, 1 day for allDay) */
function ensureEnd(start, allDay) {
  if (!start) return null
  return allDay
      ? new Date(start.getTime() + 24 * 60 * 60 * 1000)
      : new Date(start.getTime() + 30 * 60 * 1000)
}

/* open create modal from dateClick/select */
function openCreate({ start, end, allDay }) {
  console.log("DRAGGED START: " + start);
  
  const safeEnd = end ?? ensureEnd(start, allDay)
  form.value = {
    title: '',
    location: '',
    type: selectedState || 'time',
    note: '',
    allDay: !!allDay,
    start,
    end: safeEnd,
  }
  showCreate.value = true
}

/* save new event with extendedProps */
const saveEvent = async() => {
  const f = form.value
  if (!f.note?.trim()) return alert('Lisää muistinpano')
  console.log("CREATED time start - " + f.start);
  console.log("CREATED time end - " + f.end)

  const dEvent = {
    state: f.type,
    allDay: f.allDay,
    title: f.title.trim() || 'Muistiinpano',
    content: f.note?.trim(),
    start: f.start,
    end: f.end
  }

  // New timerangeEvent to db
  await proStore.addAvailableTimeEvent(dEvent);

  console.log("Added new time event ", dEvent);

  createdEvents.value = [
    ...createdEvents.value,
    {
      id: String(Date.now()),
      title: f.title.trim(),
      start: f.start,
      end: f.end,
      startEditable: true,
      durationEditable: true,
      allDay: f.allDay,
      extendedProps: {
        type: f.type,
        canEdit: true,
        canResize: true,
        location: f.location?.trim() || '',
        note: f.note?.trim() || 'Muistiinpano',
      },
    },
  ]
  showCreate.value = false
}





/* ------------ helpers ------------ */
const toLocalInput = (d) => {
  if (!d) return ''
  const pad = (n) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

// Accept Date | ISO | "YYYY-MM-DD, HH:mm" | "YYYY-MM-DD HH:mm" | "DD.MM.YYYY HH:mm"
const fromLocalInput = (v) => {
  if (!v) return null;
  if (v instanceof Date) return isValidDate(v) ? v : null;

  if (typeof v === 'string') {
    // 1) ISO or ISO-like
    const dIso = new Date(v.includes('T') ? v : v.replace(',', '').replace(' ', 'T'));
    if (isValidDate(dIso)) return dIso;

    // 2) "YYYY-MM-DD, HH:mm" or "YYYY-MM-DD HH:mm"
    let m = v.match(/^(\d{4})-(\d{2})-(\d{2})[,\s]+(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (m) {
      const [, y, mo, d, h, mi, s] = m.map(Number);
      return new Date(y, mo - 1, d, h, mi, s || 0); // local time
    }

    // 3) "DD.MM.YYYY HH:mm"
    m = v.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (m) {
      const [, d, mo, y, h, mi, s] = m.map(Number);
      return new Date(y, mo - 1, d, h, mi, s || 0);
    }
  }
  return null;
};



/* ------------ Time and note edit modal state ------------ */

let editingEventApi = null // FullCalendar EventApi currently being edited


function openEditModalFromPreview() {
  const id = selectedEvent.value?.id;
  if (!id) return;

  const api = calendarRef.value.getApi();
  const evApi = api.getEventById(String(id));
  if (!evApi) {
    console.warn('No EventApi found for id', id);
    return;
  }

  

  // reuse your existing editor opener
  openEdittModal(evApi);

  // optionally close the preview modal
  showProEventModal.value = false;
}

const editingEventId = ref(null);

/* Open modal from an event click to edit */
function openEdittModal(eventLike) {
  const ev = eventLike?.event ?? eventLike;
  if (!ev) return;

  showTimeEventModal.value = false;
  showNotesEventModal.value = false;

  // Always store the id as a string (getEventById uses string matching)
  editingEventId.value = String(ev.id);

  editForm.value = {
    id: String(ev.id),
    title: ev.title || 'Muistinpano',
    start: toLocalInput(ev.start),
    end:   toLocalInput(ev.end),
    location: ev.extendedProps?.location || '',
    note: ev.extendedProps?.note || ''
  };

  showEdit.value = true;

  // clear selection
  const api = calendarRef.value.getApi();
  api.unselect();
  
}

const ymdLocal = (d) => {
  const dt = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;
};


// helpers
const MS_DAY = 86400000;
const ymdLocal_xx = d => {
  const z = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return z.toISOString().slice(0,10); // YYYY-MM-DD (local date turned UTC midnight)
};

// If your type bar should show ONLY on the start day:
const startKeyOf = (start) => {
  const s = new Date(start);
  return ymdLocal(s);
};

// If your type bar should span all-days across the range (use this instead):
const dayKeysOfRange = (start, end, allDay) => {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date(start);
  if (allDay) e.setTime(e.getTime() - MS_DAY); // exclusive → inclusive
  s.setHours(0,0,0,0);
  e.setHours(0,0,0,0);

  const out = [];
  for (let cur = new Date(s); cur <= e; cur.setDate(cur.getDate() + 1)) {
    out.push(ymdLocal(cur));
  }
  return out;
};

const saveTimeEdit = () => {

}

const saveEventEdits = async () => {
  const id = editingEventId.value;
  if (!id) return;

  const cal = calendarRef.value.getApi();
  const evApi = cal.getEventById(id);
  
  if (!evApi) return;

  console.log("Old event - ", evApi.extendedProps.type);
  const prevState = evApi.extendedProps.type;

  const f = editForm.value;

  // ---------- 1) capture OLD cells BEFORE editing ----------
  // If your bar is only on the start day:
  const oldKeys = new Set([ startKeyOf(evApi.start) ]);

  // If your bar spans ranges, replace the line above with:
  // const oldKeys = new Set(dayKeysOfRange(evApi.start, evApi.end, evApi.allDay));

  // ---------- 2) compute new dates ----------
  const newStart = fromLocalInput(f.start); // Date or null
  const newEnd   = fromLocalInput(f.end);   // Date or null

  const startForApi = isValidDate(newStart) ? newStart : evApi.start;
  const endForApi   = isValidDate(newEnd)   ? newEnd   : evApi.end;

  // OPTIONAL: decide allDay explicitly (your current heuristic is fragile)
  // Example: if both start and end have times, it’s timed; otherwise all-day:
  const becomesAllDay =
    !(isValidDate(newStart) && isValidDate(newEnd) &&
      (newStart.getHours() + newStart.getMinutes() + newEnd.getHours() + newEnd.getMinutes() !== 0));

  // ---------- 3) update FullCalendar event ----------
  evApi.setProp('title', (f.title || '').trim());
  evApi.setExtendedProp('location', f.location || '');
  evApi.setExtendedProp('note',     f.note || '');
  evApi.setAllDay(becomesAllDay); // keep allDay in sync
  evApi.setDates(startForApi, endForApi, { allDay: becomesAllDay });

  // ---------- 4) mirror your own array (keeps computed() in sync) ----------
  const startIso = isValidDate(startForApi) ? startForApi.toISOString() : null;
  const endIso   = isValidDate(endForApi)   ? endForApi.toISOString()   : null;

  const idx = createdEvents.value.findIndex(e => e.id === id);
  if (idx !== -1) {
    const old = createdEvents.value[idx];
    createdEvents.value = [
      ...createdEvents.value.slice(0, idx),
      {
        ...old,
        title: (f.title || '').trim(),
        start: startIso,
        end:   endIso,
        allDay: becomesAllDay,
        extendedProps: {
          ...(old.extendedProps || {}),
          location: f.location || '',
          note: f.note || '',
        },
      },
      ...createdEvents.value.slice(idx + 1),
    ];
  }

  // ---------- 5) capture NEW cells AFTER editing ----------
  const newKeys = new Set([ startKeyOf(startForApi) ]);
  // If spanning bars: const newKeys = new Set(dayKeysOfRange(startForApi, endForApi, becomesAllDay));

  // union of old+new → only rebuild what changed
  const affected = new Set([...oldKeys, ...newKeys]);

  // ---------- 6) wait for reactivity, then rebuild just those cells ----------
  await nextTick();
  affected.forEach(rebuildTypeBarForDay);

  const eventOnEdit = {
    id: id,
    state: prevState,
    isAllDay: newStart && newEnd ? false : true,
    title: f.title,
    content: f.note,
    start: newStart,
    end: newEnd
  } 

  // New timerangeEvent to db
  await proStore.onEdit(id, eventOnEdit);

  //console.log("PREV STATE - ", prevState);

  showEdit.value = false;
  if (prevState === 'vacation') {
    const updatedNoteEvent = {
      id,
      title: (f.title || '').trim(),
      content: f.note || '',
      note: f.note || '',
      start: startForApi,
      end: endForApi,
      location: f.location || '',
      state: prevState,
    };
    selectedEvent.value = {
      ...selectedEvent.value,
      ...updatedNoteEvent
    };
    showNotesEventModal.value = true;
  }
    
};



const handleEventDrop = async (info) => {
  const { event, oldEvent, revert } = info;

  const oldKeys = new Set(dayKeysOfRange(oldEvent.start, oldEvent.end, oldEvent.allDay));
  const newKeys = new Set(dayKeysOfRange(event.start, event.end, event.allDay));
  const affected = new Set([...oldKeys, ...newKeys]);

  // 1) Which cells were affected?
  //const oldKeys = new Set([ startKeyOf(oldEvent.start) ]);
  //const newKeys = new Set([ startKeyOf(event.start) ]);
  //const affected = new Set([...oldKeys, ...newKeys]);

  // 2) Send to backend (use ISO so backend is stable)
  const payload = {
    id: event.id,
    state: event.extendedProps?.type,
    allDay: event.allDay,
    title: event.title,
    content: event.extendedProps?.content ?? event.content, // depending on how you store it
    start: event.start?.toISOString(),
    end: event.end?.toISOString() ?? null,
  };

  try {
    await proStore.onEdit(event.id, payload);

    // Optional: mirror your local reactive array
    const idx = createdEvents.value.findIndex(e => e.id === event.id);
    if (idx !== -1) {
      const prev = createdEvents.value[idx];
      createdEvents.value = [
        ...createdEvents.value.slice(0, idx),
        {
          ...prev,
          title: event.title,
          start: payload.start,
          end:   payload.end,
          allDay: event.allDay,
          extendedProps: {
            ...(prev.extendedProps || {}),
            type: payload.state,
            content: payload.content,
          },
        },
        ...createdEvents.value.slice(idx + 1),
      ];
    }

    // 3) Rebuild only the cells that changed
    await nextTick();
    affected.forEach(rebuildTypeBarForDay);

  } catch (e) {
    console.error('Save failed, reverting drop', e);
    revert(); // put event back
  }
};

function isEventApi(x) {
  return x && typeof x === 'object' && typeof x.remove === 'function';
}


// 1) tiny guards
const isValidDate = (d) => d instanceof Date && !isNaN(+d);
const toIso = (d) => (isValidDate(d) ? d.toISOString() : null);

// 2) sanitize string→Date parsing (return null if bad)
function parseMaybeDate(v) {
  if (v instanceof Date) return isValidDate(v) ? v : null;
  if (typeof v === 'string') {
    const d = new Date(v);
    return isValidDate(d) ? d : null;
  }
  if (typeof v === 'number') {
    const d = new Date(v);
    return isValidDate(d) ? d : null;
  }
  return null;
}


function getType(ev) {
  return ev?.extendedProps?.type
      ?? ev?._def?.extendedProps?.type
      ?? null;
}

function getStart(ev) {
  return parseMaybeDate(ev?.start)
      ?? parseMaybeDate(ev?.startStr)
      ?? null;
}

function getEnd(ev) {
  return parseMaybeDate(ev?.end)
      ?? parseMaybeDate(ev?.endStr)
      ?? null;
}

function getAllDay(ev) {
  return typeof ev?.allDay === 'boolean'
    ? ev.allDay
    : !!ev?._def?.allDay;
}


function eventCoversDay(ev, key /* 'YYYY-MM-DD' */) {
  const start = getStart(ev);
  if (!start) return false;

  const end = getEnd(ev) ?? new Date(start);
  const allDay = getAllDay(ev);
  const last  = allDay ? new Date(end.getTime() - 86400000) : end;

  const cur = new Date(start);
  cur.setHours(0,0,0,0);
  last.setHours(0,0,0,0);

  while (cur <= last) {
    if (ymdLocal(cur) === key) return true;
    cur.setDate(cur.getDate() + 1);
  }
  return false;
}

function remainingTypesForDay(key) {
  const cal = calendarRef.value?.getApi?.();
  if (!cal) return { counts: {}, total: 0 };

  const list = cal.getEvents(); // should be EventApi[], but we stay defensive
  const counts = {};
  let total = 0;

  for (const ev of list) {
    if (!eventCoversDay(ev, key)) continue;
    const t = getType(ev);
    if (!t) continue;
    counts[t] = (counts[t] || 0) + 1;
    total++;
  }
  return { counts, total };
}

async function deleteFromPreview() {
  const id = selectedEvent.value?.id && String(selectedEvent.value.id);
  if (!id) return;

  const cal = calendarRef.value.getApi();
  const evApi = cal.getEventById(id);
  if (!evApi) return;

  const days = getEventDays(evApi);     // capture days BEFORE remove
  evApi.remove();

  // keep local store in sync if it came from createdEvents
  const idx = createdEvents.value.findIndex(e => String(e.id) === id);
  if (idx !== -1) {
    createdEvents.value = [
      ...createdEvents.value.slice(0, idx),
      ...createdEvents.value.slice(idx + 1)
    ];
  }

  // Deleting event from db
  await proStore.onDelete(id);

  await nextTick();
  days.forEach(rebuildTypeBarForDay);   // rebuild only affected cells

  showProEventModal.value = false;
  showTimeEventModal.value = false;
  showNotesEventModal.value = false;
}

async function deleteEvent() {
  const id = editingEventId.value && String(editingEventId.value);
  if (!id) return;

  const cal = calendarRef.value?.getApi?.();
  if (!cal) return;

  const evApi = cal.getEventById(id);
  if (!evApi) return;

  // days affected BEFORE removal
  const days = getEventDays(evApi);

  evApi.remove();
  createdEvents.value = createdEvents.value.filter(e => String(e.id) !== id);

  await nextTick();
  days.forEach(rebuildTypeBarForDay);

  showEdit.value = false;
  showProEventModal.value = false;
}



function rebuildTypeBarForDay(key) {
  const root = calendarRef.value?.$el;
  if (!root) return;
  const cell = root.querySelector(`.fc-daygrid-day[data-date="${key}"]`);
  if (!cell) return;

  const frame = cell.querySelector('.fc-daygrid-day-frame') || cell;
  frame.querySelector('.cell-type-bar')?.remove();

  const { counts, total } = remainingTypesForDay(key);
  if (!total) return; // nothing left that day

  const bar = document.createElement('div');
  bar.className = 'cell-type-bar';

  Object.entries(counts).forEach(([t, n]) => {
    const seg = document.createElement('span');
    seg.className = 'cell-type-segment';
    seg.style.backgroundColor = (EVENT_TYPES[t]?.color) || '#999';
    seg.style.flex = String(n);
    bar.appendChild(seg);
  });

  if (getComputedStyle(frame).position === 'static') frame.style.position = 'relative';
  frame.appendChild(bar);
}

function getEventDays(ev) {
  const days = []
  if (!ev?.start) return days
  const start = new Date(ev.start)
  const end = ev.end ? new Date(ev.end) : new Date(ev.start)
  const last = ev.allDay ? new Date(end.getTime() - 86400000) : end
  const cur = new Date(start)
  cur.setHours(0,0,0,0); last.setHours(0,0,0,0)

  while (cur <= last) {
    const key = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`
    days.push(key)
    cur.setDate(cur.getDate()+1)
  }
  return days
}



// Avatakse event modal
function openEventModalPreview(raw) {
  const ev = raw?.event ?? raw;

  const type = getType(ev);
  const start = getStart(ev);
  const allDay = getAllDay(ev);
  const givenEnd = getEnd(ev);

  console.log("TYPE -- ", type);

  // derive end only when start is valid
  const end = givenEnd
    ?? (isValidDate(start)
          ? new Date(start.getTime() + (allDay ? 86400000 : 1800000))
          : null);

  const location = ev?.extendedProps?.location
                ?? ev?._def?.extendedProps?.location
                ?? ev?.location
                ?? null;

  const note = ev?.extendedProps?.note
        ?? ev?._def?.extendedProps?.note
        ?? ev?.note
        ?? null;

  event_state.value = type || '';

  selectedEvent.value = {
    id: String(ev?.id ?? ev?._def?.publicId ?? ev?._instance?.instanceId ?? ''),
    title: ev?.title ?? ev?._def?.title ?? '',
    start: toIso(start),      // <-- SAFE
    end:   toIso(end),        // <-- SAFE
    otherId: ev?.extendedProps?.otherId,
    client: ev?.extendedProps?.client,
    address: ev?.extendedProps?.address,
    priceOffer: ev?.extendedProps?.priceOffer,
    budget: ev?.extendedProps?.budget || '',
    allDay,
    
    location,
    note,
  };

  switch (type) {
    case "pro":
      showProEventModal.value = true;
      break;
    case "time":
      showTimeEventModal.value = true;
      break;
    case "client":
      showClientEventModal.value = true;
      break;
    case "vacation":
      showNotesEventModal.value = true;
      break;
    default:
      showProEventModal.value = true; // fallback
  }

  /* if (type === "pro") {
    showEventModal.value = true;
  } else if (type === "time") {
    showTimeEventModal.value = true;
  } else {
    showClientEventModal.value = true;
  } */
    
}

const fcLocaleCode = computed(() => ({ fi:'fi', sv:'sv', et:'et', en:'en-gb' }[locale.value] ?? 'en-gb'))
const clickedDate = ref(null);

/* function onEventClick(info) {
  info.jsEvent.preventDefault()
  openEventModalPreview(info.event)
  
} */

const showDayEvents = ref(false)
const selectedDayEvents = ref([])


function handleEventClick(arg) {
  // arg is { event: EventApi, jsEvent, ... }
  arg.jsEvent?.preventDefault();

  console.log("ARG -- ", arg.event);
  
  openEventModalPreview(arg.event)
}

function refreshTypeBars() {
  const api = calendarRef.value?.getApi?.();
  if (!api) return;

  const cells = calendarRef.value.$el.querySelectorAll('.fc-daygrid-day');

  cells.forEach(cell => {
    const key = cell.getAttribute('data-date'); // local 'YYYY-MM-DD'
    const frame = cell.querySelector('.fc-daygrid-day-frame') || cell;

    // cleanup previous
    frame.querySelector('.cell-type-bar')?.remove();

    // Which types exist that day? (from your precomputed Set)
    const typeSet = typeBarByDate.value.get(key);
    if (!typeSet || typeSet.size === 0) return;

    const bar = document.createElement('div');
    bar.className = 'cell-type-bar';

    const counts = {};
    Array.from(typeSet).forEach(t => { counts[t] = 0; });

    const list = Array.isArray(filteredEvents.value) ? filteredEvents.value : [];
    for (const ev of list) {
      const t = ev?.extendedProps?.type;
      if (!t || !(t in counts)) continue;

      const start = new Date(ev.start);
      if (isNaN(+start)) continue;
      const end = ev.end ? new Date(ev.end) : new Date(start);
      if (isNaN(+end)) continue;

      // For allDay: exclusive end → count up to end-1 day
      const last = ev.allDay ? new Date(end.getTime() - 86400000) : end;

      // Walk days covered by this event and bump count if the day == key
      const cur = new Date(start);
      cur.setHours(0,0,0,0);
      last.setHours(0,0,0,0);

      while (cur <= last) {
        if (ymdLocal(cur) === key) counts[t] += 1;
        cur.setDate(cur.getDate() + 1);
      }
    }

    // Build segments with flex = count (wider if more events of that type)
    Object.entries(counts).forEach(([t, n]) => {
      if (!n) return;
      const seg = document.createElement('span');
      seg.className = 'cell-type-segment';
      seg.style.backgroundColor = (EVENT_TYPES[t]?.color) || '#999';
      seg.style.flex = String(n);   // 👈 weight by count
      bar.appendChild(seg);
    });
    // ---------- END REPLACEMENT ----------

    if (getComputedStyle(frame).position === 'static') frame.style.position = 'relative';
    frame.appendChild(bar);
  });
}

// If events arrive/change async, nudge a render so dayCellDidMount reruns:
watch(filteredEvents, async () => {
  await nextTick();
  const api = calendarRef.value?.getApi?.();
  refreshTypeBars();
  api && api.render();
});

const typeBarByDate = computed(() => {
  const map = new Map();
  const list = Array.isArray(filteredEvents.value) ? filteredEvents.value : [];
  if (isUserPro.value) {
    for (const ev of list) {
    const start = new Date(ev.start);
    if (isNaN(+start)) continue;

    // Determine end
    // if no end, treat as single-day (or single moment) event
    let end = ev.end ? new Date(ev.end) : new Date(start);
    if (isNaN(+end)) end = new Date(start);

    // For allDay events, FullCalendar uses exclusive end → make it inclusive by subtracting 1 day
    const last = ev.allDay ? new Date(end.getTime() - 86400000) : end;

    // Walk day by day (local) from start to last inclusive
    const cur = new Date(start);
    cur.setHours(0, 0, 0, 0);
    last.setHours(0, 0, 0, 0);

    const type = ev?.extendedProps?.type;
    if (!type) continue;

    while (cur <= last) {
      const key = ymdLocal(cur);
      if (!map.has(key)) map.set(key, new Set());
      map.get(key).add(type);
      
      cur.setDate(cur.getDate() + 1);
    }
  }
  }
  

  return map;
});


const handleEventResize = async (info) => {
  const event = info.event;

  console.log('📏 Event resized!');
  console.log('New start:', event.start);
  console.log('New end:', event.end);

  const formatLocal = (d) =>
    d?.toLocaleString('fi-FI', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

  console.log(
    `Resized to: ${formatLocal(event.start)} → ${formatLocal(event.end)}`
  );

  console.log("Event id on drop - " + event.id);

  

  const allDayValue = event.start && event.end ? false : true


  // To backend
  const eventOnResize = {
    id: event.id,
    state: event.extendedProps.type,
    allDay: allDayValue,
    title: event.title,
    content: event.content,
    start: event.start,
    end: event.end
  }

  await proStore.onEdit(event.id, eventOnResize);

  // Save new range to backend if needed
  // await api.updateEvent(event.id, { start: event.start, end: event.end });
}


const ymd = d => d.toISOString().slice(0, 10);


/* const handleEventDrop_previous = async (info) => {
  const event = info.event;

  console.log('📅 Event moved!');
  console.log('Title:', event.title);
  console.log('New start:', event.start);
  console.log('New end:', event.end);
  console.log('AllDay:', event.allDay);

  
  const formatLocal = (d) =>
    d?.toLocaleString('fi-FI', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

  console.log(
    `Moved to: ${formatLocal(event.start)} → ${formatLocal(event.end)}`
  );


  console.log("Event id on drop - " + event.id)

  
  const eventOnMove = {
    id: event.id,
    state: event.extendedProps.type,
    allDay: event.allDay,
    title: event.title,
    content: event.content,
    start: event.start,
    end: event.end
  }

  await proStore.onEdit(event.id, eventOnMove);

}
 */

// does an all-day event cover this date?
const allDayCovers = (ev, dateStr) => {
  if (!ev.allDay) return false;
  const s = new Date(ev.start);
  const e = ev.end ? new Date(ev.end) : new Date(s.getTime() + MS_DAY);
  // FullCalendar all-day end is exclusive → compare inclusive range
  const day = new Date(dateStr + 'T00:00:00');
  return s <= day && day < e;
};

// All all-day events
const countAllDayOn = (cal, dateStr) =>
  cal.getEvents().filter((ev) => allDayCovers(ev, dateStr)).length;

const ymdx = d => d.toISOString().slice(0, 10);

const MAX_ALLDAY_PER_DAY = 1;


const pad = n => String(n).padStart(2, '0');

/* const addDaysLocalStr = (yyyyMmDd, days) => {
  const [y,m,da] = yyyyMmDd.split('-').map(Number);
  const dt = new Date(y, m-1, da);
  dt.setDate(dt.getDate() + days);
  return ymdLocal(dt);
}; */

/* function createAllDayEvent(date) {
  const cal = calendarRef.value.getApi();
  const startStr = ymdLocal(date);

  if (countAllDayOn(cal, startStr) >= 1) {
      console.log("Is already all day event")
      alert('⚠️ Only one all-day event allowed on this day.');
      toast.warn('Only one all-day event per day');
    return;
  }

  cal.addEvent({
    title: 'New all-day',
    start: startStr,
    end: addDaysLocalStr(startStr, 1),
    allDay: true,
  });
} */

const options = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  height: window.innerWidth < 640 ? 600 : 800,
  
  aspectRatio: 0.75,
  initialView: 'dayGridMonth',
  nowIndicator: true,
  datesSet() { refreshTypeBars() },
 

  dayMaxEvents: true,       // 👈 enables the "+n more" link
  dayMaxEventRows: 3,       // (optional) maximum rows to show per day
  moreLinkClick:  'popover', 
  aspectRatio: window.innerWidth < 640 ? 0.9 : 1,


  dayCellDidMount(info) {
    const d = new Date(info.date);
    d.setHours(0,0,0,0);

    const key = ymdLocal(info.date);

    const set = typeBarByDate.value.get(key);
    if (!set || set.size === 0) return;

   
    const frame =
      info.el.querySelector('.fc-daygrid-day-frame') ||
      info.el;

    if (!frame) {
      console.warn('[typebar] no frame for', key, info.el);
      return;
    }

    const style = frame.style;
    if (!style.position || style.position === 'static') {
      style.position = 'relative';
    }

    const old = frame.querySelector('.cell-type-bar');
    if (old) old.remove();

    const bar = document.createElement('div');
    bar.className = 'cell-type-bar';

    Array.from(set).forEach(t => {
      const seg = document.createElement('span');
      seg.className = 'cell-type-segment';
      seg.style.backgroundColor =
        (EVENT_TYPES[t] && EVENT_TYPES[t].color) || '#999';
      bar.appendChild(seg);
    });

    frame.appendChild(bar);
  },
  

  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },

  eventTimeFormat: { 
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  },


  events: filteredEvents.value,


  eventContent(arg) {
    const ev = arg.event;
    const start = ev.start;
    const end = ev.end;

    const formatTime = (d) =>
      d ? d.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' }) : '';

    const timeStr = ev.allDay
      ? 'Koko päivän'
      : `${formatTime(start)}${end ? ' - ' + formatTime(end) : ''}`;

    const timeStrOnlyStart = ev.allDay
    ? 'Koko päivän'
    : `${formatTime(start)} Sopimus`

    const isMobile = window.innerWidth < 640;
    let title = arg.event.title || '';

    if (isMobile && title.length > 10) {
      title = title.slice(0, 7) + '...';
    }

    const t = arg.event.extendedProps?.type;

    if (['client', 'pro'].includes(t)) {
      return { html: `<div class="event-time-only">${timeStrOnlyStart}</div>`};
    }
    if (['time'].includes(t)) {
      return { html: `<div class="event-time-only">${timeStr}</div>`}
    }

    return {
      html: `<div>${title}</div>`
    };
  },

  eventDurationEditable: (event) => {
    return event.extendedProps.canResize === true;
  },



  eventStartEditable: (event) => {
   
    return event.extendedProps.canEdit === true;
  },


  select(info) {
    console.log("Info - ", info)
    const viewType = info.view.type;

    if (!['timeGridWeek', 'timeGridDay'].includes(viewType)) {
      return;
    }
    if (info.start < new Date()) {
      return false;
    }
    console.log('Start (Date):', info.start);
    console.log('End (Date):', info.end);
    console.log('AllDay:', info.allDay);
    openCreate({ start: info.start, end: info.end, allDay: info.allDay }) //From here event creating in month view
  },


  locales: [fiLocale, svLocale, etLocale, enLocale],
  locale: fcLocaleCode.value,

  eventClassNames(arg) {
    const t = arg.event.extendedProps?.type
    return t && EVENT_TYPES[t]?.class ? [EVENT_TYPES[t].class] : []
  },

  displayEventTime: true,

  
  editable: false,
  //eventStartEditable: false,
  //eventDurationEditable: false,
  droppable: false,
  selectable: isUserPro.value,
  selectMirror: true,

  views: {
    dayGridMonth: {
      selectable: false,
      dateClick(info) {
        const cal = calendarRef.value?.getApi?.();
        if (!cal) return;

        const clickedDate = new Date(info.date);
        const today = new Date();

        // normalize both to midnight (IMPORTANT)
        clickedDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (clickedDate < today) {
           return false; // ❌ do nothing for past days
        }
        
        console.log("Date click")
        cal.changeView('timeGridDay', info.dateStr);
      }
    },

    timeGridWeek: {
      selectable: isUserPro.value
    },

    timeGridDay: {
      selectable: isUserPro.value
    }
  },


  selectAllow(selectInfo) {
    const cal = calendarRef.value?.getApi?.();
    if (!cal) return false;

    const viewType = cal.view.type;

    if (!['timeGridWeek', 'timeGridDay'].includes(viewType)) {
      return false;
    }

    if (selectInfo.start < new Date()) {
      return false;
    }

    const dateStr = selectInfo.startStr.slice(0, 10);
    return countAllDayOn(cal, dateStr) < 1;
  },

  eventAllow: (dropInfo, draggedEvent) => {
    
    if (draggedEvent.allDay !== dropInfo.allDay) return false;

    

   
    if (!dropInfo.allDay) return true;

    const cal = calendarRef.value?.getApi?.();
    if (!cal) return true;

    const targetDate = ymdLocal(dropInfo.start);
  
    const count = countAllDayOn(cal, targetDate, draggedEvent.id);

    return count < 1;
  },

  /* dateClick: (info) => {
    console.log("Date click...");
    
  }, */

  eventClick: handleEventClick,
  eventResize: handleEventResize,
  

  eventDrop: (info) => {
    if (info.event.allDay !== info.oldEvent.allDay) {
      info.revert();
      return;
    }

  handleEventDrop(info);

  }

}))
</script>

<style>

/* cell color bar */
/* ensure we can absolutely position inside the cell */
.fc .fc-daygrid-day-frame { position: relative !important; }

.cell-type-bar {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 4px;
  display: flex;
  overflow: hidden;
  border-radius: 2px 2px 0 0;
  z-index: 10;
  pointer-events: none;
}

.cell-type-segment {
  flex: 1;
  height: 100%;
}
.fc-header-toolbar.fc-toolbar.fc-toolbar-ltr {
  padding: 7px;
}
.fc-header-toolbar {
  color: red;
}
.fc-popover {
  max-width: 200px !important;   /* 👈 controls popover width */
  width: auto !important;
  border-radius: 8px !important;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  background-color: #1f2630;     /* dark theme example */
  color: #e6e6e6;
}

/* optional: header tweaks */
.fc-popover .fc-popover-header {
  font-size: 0.85rem;
  padding: 4px 8px;
  background: #151a20;
  border-bottom: 1px solid #2a2f3a;
}

/* make the event list smaller inside */
.fc-popover .fc-popover-body {
  padding: 6px;
  font-size: 0.8rem;
}

.fc-popover .fc-daygrid-event {
  margin: 2px 0;
  width: 175px;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.75rem;
  line-height: 1.2;
}

/* ensure it doesn’t stretch wider than viewport */
@media (max-width: 340px) {
  .fc-popover {
    max-width: 90vw !important;
  }
}


/* note */
.fc-event-note { font-size: .8rem; margin-top: 4px; }
.fc-event-note ul { margin: 0; padding-left: 1rem; }

.fc-day-past {
  background-color: #101320 !important;
  color: #999 !important;
  pointer-events: none; /* disable clicking */
}

/* highlight day cell when tapped */
.fc .fc-daygrid-day:active,
.fc .fc-timegrid-slot:active {
  background: #2a2f3a;       /* darker background while pressed */
  transform: scale(0.98);    /* little shrink for tactile feel */
  transition: background 0.2s, transform 0.1s;
}

/* .fc-col-header {
  background-color: #242931;
}
.fc .fc-col-header, .fc .fc-daygrid-day { border-color:#2a2f3a; }
.fc { background:#161a22; color:#e6e6e6; border-radius:8px; }
.fc .fc-day-today { background:#1e2530; } */



/* --- Minimal dark theme to match MDB dark --- */
.fc { background:#161a22; color:#e6e6e6; border-radius:8px; }
.fc .fc-daygrid-day { border: 1px solid #c76d6d;}
.fc .fc-toolbar-title { color:#e6e6e6; }
.fc .fc-button { background:#2a2f3a; border:none; }
.fc .fc-button:hover, .fc .fc-button:focus { filter: brightness(1.1); }
.fc .fc-col-header, .fc .fc-daygrid-day { border-color:#2a2f3a; }
.fc .fc-day-today { background:#1e2530; }
.fc a, .fc .fc-daygrid-day-number { color:#cbd5e1; }

/* allow wrapping */
.fc .fc-toolbar.fc-header-toolbar { display: flex; flex-wrap: wrap; row-gap: 8px; }

.fc-popover .fc-popover-body {
  background-color: #262c39;
}
.fc-popover .fc-popover-header {
  background-color: #161a22;
}

/* Neon cyan borders */
.fc-theme-standard td,
.fc-theme-standard th,
.fc-theme-standard .fc-timegrid-slot,
.fc-theme-standard .fc-timegrid-col-frame {
  border-color: rgba(73, 210, 255, 0.7) !important;
  box-shadow: 0 0 4px rgba(73, 210, 255, 0.6);
  border-color: rgba(14, 31, 36, 0.7) !important;
  box-shadow: 0 0 4px rgba(34, 72, 84, 0.6);
}

/* 1️⃣ Remove outer frame borders completely */
.fc-theme-standard .fc-scrollgrid,
.fc-theme-standard .fc-scrollgrid-section > * {
  border: none !important;
}

/* 2️⃣ Remove leftover top and right edge lines */
.fc-theme-standard .fc-scrollgrid thead tr th:first-child,
.fc-theme-standard .fc-scrollgrid tbody tr td:first-child {
  border-left: none !important;
}

.fc-theme-standard .fc-scrollgrid thead tr:first-child th,
.fc-theme-standard .fc-scrollgrid tbody tr:first-child td {
  border-top: none !important;
}

/* 3️⃣ Optional: soften inner grid lines but keep glow */
.fc-theme-standard td,
.fc-theme-standard th {
  border-color: rgba(34, 72, 84, 0.6) !important;
  box-shadow: 0 0 4px rgba(34, 72, 84, 0.6);
}

/* (optional) Keep visual consistency in dark mode */
.fc-theme-standard .fc-scrollgrid {
  box-shadow: none !important;
  background-color: transparent;
}

/* push title to its own line if needed */
@media (max-width: 640px) {
  .fc .fc-toolbar-chunk { display: flex; gap: 6px; }
  .fc .fc-toolbar-title { flex: 1 1 100%; order: 2; text-align: center; font-size: 1rem; }
  .fc .fc-toolbar-chunk:first-child { order: 1; }   /* prev/next */
  .fc .fc-toolbar-chunk:last-child  { order: 3; }   /* view buttons */
  .fc .fc-button { padding: 2px 8px; font-size: .75rem; }


  /* buttons */

  /* highlight day cell when tapped */
  .fc .fc-daygrid-day:active,
  .fc .fc-timegrid-slot:active {
    background: #2a2f3a;       /* darker background while pressed */
    transform: scale(0.98);    /* little shrink for tactile feel */
    transition: background 0.2s, transform 0.1s;
  }

  .fc .fc-daygrid-day:active::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.1);
    border-radius: inherit;
  }



  .fc .fc-button:active {
    filter: brightness(1.2);
    transform: scale(0.97);
  }
}

/* Keep anything inside the event box from spilling */
.fc .fc-daygrid-event {
  overflow: hidden;
}

/* remove the dot before events in dayGrid */
.fc .fc-daygrid-event-dot {
  display: none !important;
}

/* optional: pull text left a bit after removing the dot */
.fc .fc-daygrid-event {
  padding-left: 0 !important;
}

/* Ellipsis for long titles/time */
.fc .fc-daygrid-event .fc-event-title,
.fc .fc-daygrid-event .fc-event-time {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Color classes (use your dark palette) */
.fc-event.event-client  { background:#48769c; border:none; color:#fff; }
.fc-event.event-time   { background:#e29657; border:none; color:#fff; }
.fc-event.event-vacation { background:#c04b4bff; border:none; color:#fff; }
.fc-event.event-pro     { background:#097a5e; border:none; color:#fff; }

/* Make events compact on mobile */
@media (max-width: 640px) {
  .fc .fc-daygrid-event { font-size:.72rem; padding:0 2px; line-height:1.2; }
  .fc .fc-daygrid-day-frame { padding:2px; }
}

/* Slightly tighter padding helps on small screens */
/* @media (max-width: 640px) {
  .fc .fc-daygrid-event { padding: 0 2px; }
  .fc .fc-daygrid-day {
    height: 58px !important;
  }
  .fc .fc-daygrid-day-frame {
    min-height: 43px !important;
    padding: 3px;
  }
  .fc .fc-daygrid-day-events {
    min-height: 18px;
  }

  .fc .fc-daygrid-event {
    font-size: 0.72rem;
    line-height: 1.2;
  }
} */


/* @media (max-width: 640px) {
  .fc .fc-daygrid-day {
    height: 58px !important;
  }

  .fc .fc-daygrid-day-frame {
    min-height: 58px !important;
  }
}
 */

 @media (max-width: 640px) {
  .fc .fc-daygrid-day-frame {
    min-height: 80px !important;
  }

  .fc .fc-daygrid-day-events {
    min-height: 40px !important;
  }

  .fc .fc-daygrid-event-harness .fc-daygrid-event {
    width: 100%;
  }

  /* .fc .fc-event-main {
    overflow: hidden;
  }

  .fc .fc-event-title {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } */
}

/* Modal for event details */
.event-modal-body {
  color: #e5e7eb;
}

.event-date {
  font-size: 14px;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 12px;
}

.event-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 6px;
}

.event-subtitle {
  color: #cbd5e1;
  margin-bottom: 18px;
}

.event-card {
  background: #111827;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 16px;
  
  /* margin-top: 14px; */
}

.event-card h4 {
  margin-bottom: 14px;
  font-size: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.info-row:last-child {
  border-bottom: 0;
}

.info-row span {
  color: #94a3b8;
}

.info-row strong {
  text-align: right;
  color: #f8fafc;
}

.status-waiting {
  color: #fbbf24;
}

.event-note {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(251,191,36,0.12);
  color: #fde68a;
}

.event-chat {
  margin-top: 10px;
  cursor: pointer;
}

.footer-buttons {
  display: flex;
  gap: 12px; /* horizontal space between buttons */
}
/* .event-chat :hoover{
  background-color: red;
} */
</style>