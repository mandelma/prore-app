<template>
  <div style="padding-top: 60px;">
    <FullCalendar ref="calendarRef" :options="options" />

  </div>

  <!-- Creating event modal-->
  <MDBModal
      v-model="showCreate" center
      centered
      tabindex="-1"

      :modelValue="true"
      removeBackdrop
      :keyboard="false"
      :focus="false"
  >
    <MDBModalHeader>
      <MDBModalTitle>Uusi merkintä</MDBModalTitle>
    </MDBModalHeader>
    <MDBModalBody>
      <p>...</p>
      <p>selectedState {{selectedState}}</p>
      <div class="space-y-3">
        <MDBInput v-model="form.title" label="Otsikko *" wrapperClass="mb-4" />
        <MDBSelect 
          
          v-model:options="stateOptions" 
          
          label="saattavilla tai joustava" 
          style="margin-bottom: 20px;"
        />
<!--        <MDBInput v-model="form.location" label="Location" />-->
        <MDBTextarea v-model="form.note" label="Kuvaus..." rows="3" wrapperClass="mb-4"/>

        <div class="text-sm opacity-80">
          <div><strong>Aloitus:</strong> {{ formatLocalDate(form.start) }}</div>
          <div><strong>Loppu:</strong>   {{ formatLocalDate(form.end) }}</div>
          <!-- <div><strong>Loppu:</strong>   {{ form.end?.toLocaleString() }}</div> -->
        </div>
      </div>
    </MDBModalBody>
    <MDBModalFooter>
      <MDBBtn color="danger" outline @click="showCreate=false">Poistu</MDBBtn>
      
      <MDBBtn color="primary" @click="saveEvent">Tallentaa</MDBBtn>
    </MDBModalFooter>
  </MDBModal>



  <!-- <MDBModal v-model="showDayEvents" centered>
  <MDBModalHeader><MDBModalTitle>Päivän tapahtumat</MDBModalTitle></MDBModalHeader>
  <MDBModalBody>
    <ul>
      <li v-for="ev in selectedDayEvents" :key="ev.id">
        <strong>{{ ev.title }}</strong>
        <div v-if="ev.extendedProps?.note" v-html="ev.extendedProps.note"></div>
      </li>
    </ul>
  </MDBModalBody>
</MDBModal> -->


  <!-- Edit event   :modelValue="true"-->
  <MDBModal
      v-model="showEdit" center
      right
      tabindex="-1"

      
      removeBackdrop
      :keyboard="false"
      :focus="false"
  >
    <MDBModalHeader>
      <MDBModalTitle>Muokka merkintä</MDBModalTitle>
    </MDBModalHeader>
    <MDBModalBody>
      <p>---</p>
      <div class="space-y-3">

        <MDBInput v-model="editForm.title" label="Title" />
        <MDBInput v-model="editForm.location" label="Location" />
        <MDBTextarea v-model="editForm.note" label="Note" rows="3" />

        <div class="text-sm opacity-80">
          <!-- <div><strong>Loppu:</strong>   {{ form.end?.toLocaleString() }}</div> -->
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- <MDBInput label="Start" type="datetime-local" v-model="editForm.start" />
          <MDBInput label="End"   type="datetime-local" v-model="editForm.end" />
 -->
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
    </MDBModalBody>
    <MDBModalFooter>
      <MDBBtn color="secondary" outline @click="showEdit=false">Cancel</MDBBtn>
      <MDBBtn color="primary" @click="saveEventEdits">Save</MDBBtn>
    </MDBModalFooter>
  </MDBModal>


  <!--Siit avatakse event kalendris peale klikkides-->
  <MDBModal
      v-model="showEventModal"
      tabindex="-1"
      centered
      :modelValue="true"
      removeBackdrop
      :keyboard="false"
      :focus="false"
      scrollable
  >
  
  <!-- formatEventDate(new Date(selectedEvent.start)) -->
    <MDBModalHeader>
      <MDBModalTitle>{{ selectedEvent?.title || 'Event' }}</MDBModalTitle>
    </MDBModalHeader>
    <MDBModalBody>

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

    </MDBModalBody>
    <MDBModalFooter>
      <MDBBtn v-if="event_state === 'vacation' || event_state === 'time'" color="danger" outline @click="deleteFromPreview">Delete</MDBBtn>
      <MDBBtn v-if="event_state === 'vacation' || event_state === 'time' && !selectedEvent.allDay"  color="primary" @click="openEventModalFromPreview">Muokkaa</MDBBtn>
      <MDBBtn color="secondary" outline @click="showEventModal=false">Close</MDBBtn>
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

import { storeToRefs } from 'pinia';
import { useLoginStore } from '@/stores/login';
import { useClientStore } from '@/stores/recipientStore';
import { useProStore } from '@/stores/providerStore';

defineProps({
  count: {type: Number},
  days: Array
})


const emit = defineEmits(['over'])

const sendProp = () => {
  emit("over", "Hello parent!")
}

const auth = useLoginStore();
const clientStore = useClientStore();
const proStore = useProStore();

const { user } = storeToRefs(auth);
const { clientConfirmed } = storeToRefs(clientStore);
const { isUserPro, proCalendarEvents, proTimetable } = storeToRefs(proStore);

/* createdEvents.value = [
    createdEvents.value,
    {
      id: ptt.id,
      title: ptt.title,
      start: ptt.start,
      end: ptt.end,
      startEditable: true,
      durationEditable: true,
      extendedProps: {
        type: ptt.state,
        canEdit: true,
        canResize: true,
        note: ptt.content
      }
    }
  ] */

  // label sets (add your own langs as needed)
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
    title: "Tilaus",
    start: toDate(cc.created),
    end: toDate(cc.created),

    startEditable: false,            // drag (start/time) allowed?
    durationEditable: false,         // resize allowed?
    
    extendedProps: {
      type: "offer",
      canEdit: false,
      canResize: false,
      location: cc?.offer?.placeOrGo === 'go' ? cc.offer.name + " tulossa" : cc.offer.name + " odottaa!",
      note: `
        <h3>Tilaus:</h3>
        <ul>
          <li><strong>Tehtävä:</strong> ${cc.header}</li>
          <li><strong>Tehtävän kuvaus:</strong> ${cc.description || '–'}</li>
        </ul>
      `
    } 
  })),
  ...proCalendarEvents.value.map(pce => {
    const offer = pce.offers?.find(o => o.sender === user.value.id)
    const place = offer?.placeOrGo || "";
    const dist = offer?.distance;
    const duration = offer?.duration;
    const price = offer?.price;
    
    return {
      id: pce.id,
      title: pce.header,
      start: toDate(pce.created),
      startEditable: false,            // drag (start/time) allowed?
      durationEditable: false,         // resize allowed?
      extendedProps: {
        type: "booking",
        canEdit: false,
        canResize: false,
        note: place === 'go' ? `
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
        `,
        location: place === 'go' ? "Meno asiakkaan luokse" : "Asiakas tulossa!"
      }
    }
  }),
  ...proTimetable.value.map(ppt => ({
    id: ppt.id,
    title: ppt.title,
    start: toDate(ppt.start),
    end: toDate(ppt.end),
    startEditable: true,            // drag (start/time) allowed?
    durationEditable: true,         // resize allowed?
    allDay: ppt.isAllDay,
    extendedProps: {
      type: ppt.state,
      canEdit: true,
      canResize: true,
      note: ppt.content?.trim() || '',
    }
  })),
  ...createdEvents.value
])

const today = new Date();

// Helper: start-of-day (local) timestamp
const startOfToday = computed(() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
})

// Only future (or today) events
const filteredEvents = computed(() =>
  events.value.filter(e => {
    const t = new Date(e.start).getTime()
    return t >= new Date().getTime() //startOfToday.value
  })
)

//const filteredEvents = events.value.filter(e => new Date(e.start) >= today)
/* const filteredEvents = computed(() => 
  events.value.filter(e => new Date(e.start) >= today)
) */

/* const events = ref([
  {
    id: '1',
    title: 'Saattavilla',
    start: '2025-09-25T10:30:00',
    end:   '2025-09-25T11:15:00',
    extendedProps: { type: 'client', location: 'Room A', note: 'Se aika sopii tosi hyvin!!' }
  },
  {
    id: '2',
    title: 'Joustava',
    start: '2025-09-25T13:30:00',
    end:   '2025-09-25T17:00:00',
    extendedProps: { type: 'vacation', location: 'Room A', note: '' }
  },
  {
    id: '3',
    title: 'Saattavilla',
    start: '2025-09-27T13:30:00',
    end:   '2025-09-27T14:00:00',
    extendedProps: { type: 'client', location: 'Zoom', note: '' }
  }
]) */

const stateOptions = ref([
  {text: "Saattavilla", value: "time"},
  {text: "Muistiinpanot", value: "vacation"}
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

onMounted(() => {
  console.log("Mounted is on...");

  /* const api = calendarRef.value?.getApi?.()
  if (!api) return
  api.setOption('moreLinkClick', handleMoreLinkClick) */

  const eventDate = new Date("2025-10-31T15:00:00.000Z")
  const now = new Date()

  // whenever any event is removed, rebuild the bars
  /* api.on('eventRemove', () => {
    nextTick().then(refreshTypeBars);
  }); */
})

const formatLocalDate_xx = (utcDate) => {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Helsinki'
  }).format(new Date(utcDate)).replace(' at ', ' klo ');
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
  if (!f.title?.trim()) return alert('Please add a title')
  console.log("CREATED time start - " + f.start);
  console.log("CREATED time end - " + f.end)

  const dEvent = {
    state: f.type,
    allDay: f.allDay,
    title: f.title.trim(),
    content: f.note?.trim(),
    start: f.start,
    end: f.end
  }

  // New timerangeEvent to db
  await proStore.addAvailableTimeEvent(dEvent);

  createdEvents.value = [
    ...createdEvents.value,
    {
      id: String(Date.now()),
      title: f.title.trim(),
      start: f.start,
      end: f.end,
      startEditable: true,            // drag (start/time) allowed?
      durationEditable: true,         // resize allowed?
      allDay: f.allDay,
      extendedProps: {
        type: f.type,
        canEdit: true,
        canResize: true,
        location: f.location?.trim() || '',
        note: f.note?.trim() || '',
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
//const fromLocalInput = (s) => (s ? new Date(s) : null)

function fromLocalInput_xxx(s) {
  if (!s) return null;

  // Already a Date?
  if (s instanceof Date && !isNaN(s)) return s;

  const str = String(s).trim();

  // ISO-ish: 2025-11-17T12:00
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str)) {
    const d = new Date(str);
    return isNaN(d) ? null : d;
  }

  // dd/MM/yyyy, HH:mm AM/PM   e.g. "17/11/2025, 12:00 AM" or "18/11/2025, 05:00 PM"
  let m = /^(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i.exec(str);
  if (m) {
    let [, dd, MM, yyyy, hh, mm, ap] = m;
    dd = +dd; MM = +MM; yyyy = +yyyy; hh = +hh; mm = +mm;
    if (ap) {
      const isPM = ap.toUpperCase() === 'PM';
      hh = (hh % 12) + (isPM ? 12 : 0);
    }
    const d = new Date(yyyy, MM - 1, dd, hh, mm, 0, 0);
    return isNaN(d) ? null : d;
  }

  // dd.MM.yyyy HH:mm  e.g. "17.11.2025 05:00"
  m = /^(\d{1,2})[.\-](\d{1,2})[.\-](\d{4})(?:[ ,T]?(\d{1,2}):(\d{2}))?$/.exec(str);
  if (m) {
    let [, dd, MM, yyyy, hh = '0', mm = '0'] = m;
    const d = new Date(+yyyy, +MM - 1, +dd, +hh, +mm, 0, 0);
    return isNaN(d) ? null : d;
  }

  return null; // unknown format
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



/* ------------ edit modal state ------------ */
const showEdit = ref(false)
let editingEventApi = null // FullCalendar EventApi currently being edited


function openEventModalFromPreview() {
  const id = selectedEvent.value?.id;
  if (!id) return;

  const api = calendarRef.value.getApi();
  const evApi = api.getEventById(String(id));
  if (!evApi) {
    console.warn('No EventApi found for id', id);
    return;
  }

  

  // reuse your existing editor opener
  openEventModal(evApi);

  // optionally close the preview modal
  showEventModal.value = false;
}

const editingEventId = ref(null);

/* Open modal from an event click to edit */
function openEventModal(eventLike) {
  //showEventModal.value = false;

 /*  const eventApi = argOrEventApi.event ?? argOrEventApi; // supports eventClick(arg) or direct EventApi
  editingEventId.value = eventApi.id; */

  const ev = eventLike?.event ?? eventLike;
  if (!ev) return;

  // Always store the id as a string (getEventById uses string matching)
  editingEventId.value = String(ev.id);

  editForm.value = {
    id: String(ev.id),
    title: ev.title || '',
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

//function isValidDate(d) { return d instanceof Date && !isNaN(d); }

/* Save edits: update FullCalendar event + mirror to our array */
const saveEventEdits_old = async() => {
  console.log('[saveEventEdits] fired'); // must appear in console
  console.log("Editing ID " + editingEventId.value)
  //if (!editingEventApi) return;
  
  const id = editingEventId.value;
  if (!id) return;

  const cal = calendarRef.value.getApi();
  const evApi = cal.getEventById(id);           // <- guaranteed EventApi
  if (!evApi) {
    console.warn('No EventApi found for id', id);
    return;
  }

  const f = editForm.value;



  // convert to Date objects
  const newStart =  fromLocalInput(f.start); // must return Date or null
  const newEnd   =  fromLocalInput(f.end);   // Date or null

  console.log("EVENT PROPS" + editingEventId.value, evApi, typeof evApi.setProp)

  // Update the live event
  const startForApi = isValidDate(newStart) ? newStart : evApi.start;
  const endForApi   = isValidDate(newEnd)   ? newEnd   : evApi.end;

  evApi.setProp('title', (f.title || '').trim());
  evApi.setExtendedProp('location', f.location || '');
  evApi.setExtendedProp('note',     f.note || '');
  evApi.setDates(newStart || evApi.start, newEnd || evApi.end, { allDay: evApi.allDay });

  // Mirror into your reactive array (optional but keeps your own state in sync)
  const startIso = isValidDate(startForApi) ? startForApi.toISOString() : null;
  const endIso   = isValidDate(endForApi)   ? endForApi.toISOString()   : null;

  //console.log("EDITED time start - " + startIso);
  //console.log("EDITED time end - " + endIso);

  const allDayValue = newStart && newEnd ? false : true

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
        allDay: allDayValue,
        extendedProps: {
          ...(old.extendedProps || {}),
          location: f.location || '',
          note: f.note || '',
        },
      },
      ...createdEvents.value.slice(idx + 1),
    ];
  }




  if (!evApi) return;

  const days = getEventDays(evApi);     // capture days BEFORE remove
  //evApi.remove();

  await nextTick();
  days.forEach(rebuildTypeBarForDay);   // rebuild only affected cells







  console.log('saveEventEdits ->', {
  startRaw: f.start, endRaw: f.end,
  allday: newStart && newEnd ? false : true,
  newStart, newEnd,
  isDate: newStart instanceof Date, isDateEnd: newEnd instanceof Date,
});

  const eventOnEdit = {
    id: id,
    state: f.type,
    isAllDay: newStart && newEnd ? false : true,
    title: f.title,
    content: f.note,
    start: newStart,
    end: newEnd
  } 

  

 

  // New timerangeEvent to db
  await proStore.onEdit(id, eventOnEdit);

  showEdit.value = false;
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

const saveEventEdits = async () => {
  const id = editingEventId.value;
  if (!id) return;

  const cal = calendarRef.value.getApi();
  const evApi = cal.getEventById(id);
  if (!evApi) return;

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
    state: f.type,
    isAllDay: newStart && newEnd ? false : true,
    title: f.title,
    content: f.note,
    start: newStart,
    end: newEnd
  } 

  // New timerangeEvent to db
  await proStore.onEdit(id, eventOnEdit);

  showEdit.value = false;
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

async function deleteFromPreviewxxx() {
  const id = selectedEvent.value?.id && String(selectedEvent.value.id);
  if (!id) return;

  const cal = calendarRef.value.getApi();
  cal.getEventById(id)?.remove();

  const idx = createdEvents.value.findIndex(e => String(e.id) === id);
  if (idx !== -1) {
    createdEvents.value = [
      ...createdEvents.value.slice(0, idx),
      ...createdEvents.value.slice(idx + 1)
    ];
  }

  // await proStore.deleteAvailableTimeEvent(id);

  showEventModal.value = false;
}








function clearAllTypeBars() {
  //console.log("ID ")
  calendarRef.value?.$el
    ?.querySelectorAll('.cell-type-bar')
    .forEach(el =>  el.remove());
}



function isEventApi(x) {
  return x && typeof x === 'object' && typeof x.remove === 'function';
}

function getTypexxx(ev) {
  // Works for EventApi and plain objects
  return ev?.extendedProps?.type
      ?? ev?._def?.extendedProps?.type
      ?? null;
}

function getStartxxx(ev) {
  // EventApi has ev.start (Date). Plain objects may have start or startStr
  if (ev?.start instanceof Date) return ev.start;
  if (typeof ev?.start === 'string') return new Date(ev.start);
  if (typeof ev?.startStr === 'string') return new Date(ev.startStr);
  return null;
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


function getStartxxxcccxxx(ev) {
  return ev?.start instanceof Date ? ev.start
       : typeof ev?.start === 'string' ? new Date(ev.start)
       : typeof ev?.startStr === 'string' ? new Date(ev.startStr)
       : null;
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

function getEndxxx(ev) {
  if (ev?.end instanceof Date) return ev.end;
  if (typeof ev?.end === 'string') return new Date(ev.end);
  if (typeof ev?.endStr === 'string') return new Date(ev.endStr);
  return null;
}

function getEndxxxxxx(ev) {
  return ev?.end instanceof Date ? ev.end
       : typeof ev?.end === 'string' ? new Date(ev.end)
       : typeof ev?.endStr === 'string' ? new Date(ev.endStr)
       : null;
}
function getEnd(ev) {
  return parseMaybeDate(ev?.end)
      ?? parseMaybeDate(ev?.endStr)
      ?? null;
}

function getAllDayxx(ev) {
  // EventApi has ev.allDay; fall back to _def or false
  if (typeof ev?.allDay === 'boolean') return ev.allDay;
  if (typeof ev?._def?.allDay === 'boolean') return ev._def.allDay;
  return false;
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
  showEventModal.value = false;
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
  showEventModal.value = false;
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

function clearTypeBarsForEvent(ev) {
  if (!calendarRef.value) return
  const root = calendarRef.value.$el
  const days = getEventDays(ev)
  if (!days.length) return

  days.forEach(key => {
    const cell = root.querySelector(`.fc-daygrid-day[data-date="${key}"]`)
    if (!cell) return
    const frame = cell.querySelector('.fc-daygrid-day-frame') || cell
    frame.querySelector('.cell-type-bar')?.remove()
  })
}

/* Optional delete from the edit modal */
async function deleteEvent__() {
  const id = editingEventId.value && String(editingEventId.value);
  console.log("Event id " + id)
  if (!id) return;

  const cal = calendarRef.value?.getApi?.();
  if (!cal) return;

  // 1) Remove from FullCalendar
  const evApi = cal.getEventById(id);
  if (!evApi) console.warn('No EventApi for id', id);
  else evApi.remove();

  // 2) Mirror remove in your local arrays
  // If you only add to createdEvents on the client:
  const idx = createdEvents.value.findIndex(e => String(e.id) === id);
  if (idx !== -1) {
    createdEvents.value = [
      ...createdEvents.value.slice(0, idx),
      ...createdEvents.value.slice(idx + 1)
    ];
  }

  // If events can also come from proTimetable/proCalendarEvents etc,
  // do the same filtering there or call your backend:
  // await proStore.deleteAvailableTimeEvent(id).catch(console.error);

  //deleteFromPreview()
  await nextTick();
  
  refreshTypeBars();
  

  // 3) Close modal(s)
  showEdit.value = false;
  showEventModal.value = false;
}



async function _deleteEvent() {
  
  const id = editingEventId.value && String(editingEventId.value)
  console.log("DELETING IN EDIT " + id)
  if (!id) return

  const cal = calendarRef.value?.getApi?.()
  if (!cal) return

  const evApi = cal.getEventById(id)
  console.log("EV API ID " + evApi)
  if (evApi) {
    // 👇 remove only affected bars
    clearTypeBarsForEvent(evApi)
    evApi.remove()
  }

  // mirror in your state
  createdEvents.value = createdEvents.value.filter(e => String(e.id) !== id)

  await nextTick()
  refreshTypeBars()

  showEdit.value = false
  showEventModal.value = false
}


function isPastDay(d) {
  const day = new Date(d); day.setHours(0,0,0,0);
  const today = new Date(); today.setHours(0,0,0,0);
  return day < today;
}

function isPastMoment(d) {
  return d < new Date();
}


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
const showEventModal = ref(false)
const selectedEvent = ref(null)
// const calendarRef = ref(null)
// const visibleTypes = ref(new Set(Object.keys(EVENT_TYPES)))
// const filteredEvents = computed(() =>
//     events.value.filter(e => visibleTypes.value.has(e.extendedProps?.type || ''))
// )
//
const formatEventDate = (date) => {
  return formatDate(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    locale: 'en' // or 'fi', 'et', etc.
  })
}
//
/* function isEventApi(x) {
  return x && typeof x.getExtendedProp === 'function';
}
 */
// Avatakse event modal
function openEventModalPreviewxxx(evt) {
  // evt can be an EventApi or a plain object
  event_state.value = evt.extendedProps.type;
  const start = isEventApi(evt) ? evt.start : evt.start;
  const end =
      (isEventApi(evt) ? evt.end : evt.end) ??
      (start
          ? new Date(start.getTime() + (isEventApi(evt) ? (evt.allDay ? 86400000 : 1800000) : 1800000))
          : null);

  const location = isEventApi(evt)
      ? (evt.getExtendedProp('location') ?? null)
      : (evt.extendedProps?.location ?? evt.location ?? null);

  /* const note = isEventApi(evt)
      ? (evt.getExtendedProp('note') ?? null)
      : (evt.extendedProps?.note ?? evt.note ?? null); */

    const note = isEventApi(evt)
    ? (evt.getExtendedProp('note') ?? null)
    : (evt.extendedProps?.note ?? evt.note ?? null);


  // Siit kuvatakse event peale klikkides ----
  selectedEvent.value = {
    
    id: isEventApi(evt) ? evt.id : evt.id,
    title: isEventApi(evt) ? evt.title : evt.title,
    start: start ? start.toISOString() : null,
    end: end ? end.toISOString() : null,
    allDay: isEventApi(evt) ? evt.allDay : !!evt.allDay,
    location,
    note,
    
    /* extendedProps: isEventApi(evt) ? (evt.toPlainObject().extendedProps ?? {}) : (evt.extendedProps ?? {}) */
  };

  showEventModal.value = true;
  
}

function openEventModalPreview_xx(raw) {
  // Works with either eventClick arg or a direct EventApi/plain object
  const ev = raw?.event ?? raw;

  const type    = getType(ev);
  const start   = getStart(ev);
  const allDay  = getAllDay(ev);
  const givenEnd = getEnd(ev);
  const end     = givenEnd ?? (start ? new Date(start.getTime() + (allDay ? 86400000 : 1800000)) : null);

  const location = ev?.extendedProps?.location
                ?? ev?._def?.extendedProps?.location
                ?? ev?.location
                ?? null;

  const note     = ev?.extendedProps?.note
                ?? ev?._def?.extendedProps?.note
                ?? ev?.note
                ?? null;

  // Store type for your button visibility logic
  event_state.value = type || '';

  // Build selectedEvent for your modal
  selectedEvent.value = {
    id: String(ev?.id ?? ev?._def?.publicId ?? ev?._instance?.instanceId ?? ''),
    title: ev?.title ?? ev?._def?.title ?? '',
    start: start ? start.toISOString() : null,
    end:   end   ? end.toISOString()   : null,
    allDay,
    location,
    note,
  };

  showEventModal.value = true;
}

function openEventModalPreview(raw) {
  const ev = raw?.event ?? raw;

  const type    = getType(ev);
  const start   = getStart(ev);
  const allDay  = getAllDay(ev);
  const givenEnd = getEnd(ev);

  // derive end only when start is valid
  const end = givenEnd
    ?? (isValidDate(start)
          ? new Date(start.getTime() + (allDay ? 86400000 : 1800000))
          : null);

  const location = ev?.extendedProps?.location
                ?? ev?._def?.extendedProps?.location
                ?? ev?.location
                ?? null;

  const note     = ev?.extendedProps?.note
                ?? ev?._def?.extendedProps?.note
                ?? ev?.note
                ?? null;

  event_state.value = type || '';

  selectedEvent.value = {
    id: String(ev?.id ?? ev?._def?.publicId ?? ev?._instance?.instanceId ?? ''),
    title: ev?.title ?? ev?._def?.title ?? '',
    start: toIso(start),      // <-- SAFE
    end:   toIso(end),        // <-- SAFE
    allDay,
    location,
    note,
  };

  showEventModal.value = true;
}

//
// /* ---------- delete button handler ---------- */
// function deleteEvent() {
//   if (!selectedEvent.value) return
//   const id = selectedEvent.value.id
//   events.value = events.value.filter(e => e.id !== id)
//   showEventModal.value = false
// }
//
const fcLocaleCode = computed(() => ({ fi:'fi', sv:'sv', et:'et', en:'en-gb' }[locale.value] ?? 'en-gb'))
const clickedDate = ref(null);
//
//
//
// function persistChange({ event, revert }) {
//   // TODO: save to your backend; if it fails, call revert()
//   // Example of payload you might send:
//   console.log("Created event start: " + event.start);
//   console.log("Created event end: " + event.end);
//   const payload = {
//     id: event.id,
//     start: event.start?.toISOString(),
//     end:   event.end?.toISOString(),
//     allDay: event.allDay
//   }
//   console.log('save', payload)
//
//   // fake error example:
//   // if (someError) revert()
// }
//
// function handleDrop(info) {
//   // The dragged event
//   const e = info.event
//
//   // New dates (in JS Date objects)
//   console.log('event moved:')
//   console.log('id:', e.id)
//   console.log('start:', e.start) // Date object
//   console.log('end:', e.end)
//
//   // ISO strings (useful to send to backend)
//   console.log('start ISO:', e.start?.toISOString())
//   console.log('end ISO:', e.end?.toISOString())
//
//   // If your save fails, call:
//   // info.revert()
// }
//
// function handleResize(info) {
//   const e = info.event
//   console.log('event resized:', e.start?.toISOString(), e.end?.toISOString())
// }

function onEventClick(info) {
  info.jsEvent.preventDefault()
  openEventModalPreview(info.event)     // ← pass EventApi
  
}
//
// function removeEventClick(info) {
//   if (confirm(`Delete event "${info.event.title}"?`)) {
//     // Remove from your data
//     events.value = events.value.filter(e => e.id !== info.event.id)
//
//     // Or directly from calendar API:
//     // info.event.remove()
//   }
// }
//
//
//
//
//
//





/* Calendar options */
// const options = computed(() => ({
//   plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
//   initialView: 'dayGridMonth',
//   headerToolbar: {
//     left: 'prev,next today',
//     center: 'title',
//     right: 'dayGridMonth,timeGridWeek,timeGridDay'
//   },
//   selectable: true,
//
//   selectAllow(selectInfo) {
//     // disallow if start is before "now"
//     return selectInfo.start >= new Date()
//   },
//   eventAllow(dropInfo, draggedEvent) {
//     return dropInfo.start >= new Date()
//   },
//   events: upcomingEvents.value,
//
//   //events: events.value,
//   eventClick(info) {
//     info.jsEvent?.preventDefault()
//     openEventModal(info.event)
//   },
//
//   /* A) click a single day/slot */
//   dateClick(info) {
//     if (info.view.type.startsWith('dayGrid')) {
//       if (isPastDay(info.date)) return;         // ⛔ do nothing
//     } else {
//       // timeGridDay/Week: respect time
//       if (isPastMoment(info.date)) return;      // ⛔ do nothing
//     }
//
//     // allowed → open your modal
//     openCreate({ start: info.date, end: null, allDay: info.allDay });
//   },
//
//   /* B) drag to select a range (has start+end) */
//   select(info) {
//     openCreate({ start: info.start, end: info.end, allDay: info.allDay })
//   },
//
//   /* show fewer events per cell so they fit on mobile */
//   dayMaxEventRows: true,
// }))

const showDayEvents = ref(false)
const selectedDayEvents = ref([])


function handleEventClick(arg) {
  // arg is { event: EventApi, jsEvent, ... }
  arg.jsEvent?.preventDefault()
  
  openEventModalPreview(arg.event)
}


function handleDateClick(info) {
  const api = calendarRef.value.getApi()
  
  // Prevent past days if needed
  if (info.view.type.startsWith('dayGrid')) {
    if (isPastDay(info.date)) return
  } else {
    if (isPastMoment(info.date)) return
  }

  // Collect all events for that day and open your modal
  const dayEvents = info.view.calendar.getEvents().filter(
    ev => ev.startStr.slice(0, 10) === info.dateStr
  )
  selectedDayEvents.value = dayEvents
  showDayEvents.value = true

  // (optional) change view on mobile
  if (window.innerWidth < 640) api.changeView('timeGridDay', info.date)
}

function handleMoreLinkClick(arg) {
  // arg has: date, allSegs (array of segments for that day)
  console.log('✅ custom moreLinkClick fired')
  console.log('handleMoreLinkClick fired for', arg.date?.toISOString?.() ?? arg.date);
  

  selectedDayEvents.value = arg.allSegs.map(seg => seg.event)
  showDayEvents.value = true
  return false // prevent FC’s built-in popover
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

    // ---------- REPLACE THIS PART (equal segments) ----------
    // Array.from(typeSet).forEach(t => {
    //   const seg = document.createElement('span');
    //   seg.className = 'cell-type-segment';
    //   seg.style.backgroundColor = (EVENT_TYPES[t]?.color) || '#999';
    //   bar.appendChild(seg);
    // });

    // ---------- WITH THIS WEIGHTED-BY-COUNT VERSION ----------
    // Count how many events of each type occur *on this exact day (key)*
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

function refreshTypeBars_sameSizeEventColors() {
  const cal = calendarRef.value?.getApi?.();
  if (!cal) return;

  const cells = calendarRef.value.$el.querySelectorAll('.fc-daygrid-day');
  cells.forEach(cell => {
    const key = cell.getAttribute('data-date'); // local YYYY-MM-DD
    const frame = cell.querySelector('.fc-daygrid-day-frame') || cell;

    frame.querySelector('.cell-type-bar')?.remove();

    const set = typeBarByDate.value.get(key);
    if (!set || set.size === 0) return;

    const bar = document.createElement('div');
    bar.className = 'cell-type-bar';

    Array.from(set).forEach(t => {
      const seg = document.createElement('span');
      seg.className = 'cell-type-segment';
      seg.style.backgroundColor = (EVENT_TYPES[t]?.color) || '#999';
      bar.appendChild(seg);
    });

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



// Build a lookup: 'YYYY-MM-DD' -> Set(types)
function buildTypeMap(events) {
  const map = new Map();
  (events || []).forEach(ev => {
    const d = new Date(ev.start);
    if (isNaN(+d)) return;
    d.setHours(0,0,0,0);
    const key = d.toISOString().slice(0,10);          // canonical key
    const t = ev && ev.extendedProps && ev.extendedProps.type;
    if (!t) return;
    if (!map.has(key)) map.set(key, new Set());
    map.get(key).add(t);
  });
  return map;
}


/* const typeBarByDate = computed(() => buildTypeMap(filteredEvents.value)); */

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

// aggregate all events -> { [date]: { [type]: count } }
function aggregateTypeCounts(calendar) {
  const counts = {};
  calendar.getEvents().forEach(ev => {
    const day = ymd(ev.start);
    const type = ev.extendedProps?.type ?? 'unknown';
    counts[day] ??= {};
    counts[day][type] = (counts[day][type] || 0) + 1;
  });
  return counts;
}

  const handleEventDrop_previous = async (info) => {
  const event = info.event;

  console.log('📅 Event moved!');
  console.log('Title:', event.title);
  console.log('New start:', event.start);
  console.log('New end:', event.end);
  console.log('AllDay:', event.allDay);

  // Format output
  const formatLocal = (d) =>
    d?.toLocaleString('fi-FI', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

  console.log(
    `Moved to: ${formatLocal(event.start)} → ${formatLocal(event.end)}`
  );


  console.log("Event id on drop - " + event.id)

  // To backend
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


  // If saving fails, revert it:
  // info.revert();
}


const handleEventDrop___ = async (info) => {
  const event = info.event;

  // Build payload; note content must come from extendedProps in FC
  const eventOnMove = {
    id: event.id,
    state: event.extendedProps.type,
    allDay: event.allDay,
    title: event.title,
    content: event.extendedProps.content, // <-- fix compared to your snippet
    start: event.start.toISOString(),
    end: event.end?.toISOString() ?? null,
  };

  try {
    await proStore.onEdit(event.id, eventOnMove);

    // Refresh bars after a successful save
    const cal = info.view.calendar;
    typeBars.value = aggregateTypeCounts(cal);
  } catch (e) {
    // Roll back the drag if backend fails
    info.revert();
  }
}



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

const createAllDayEvent__xx = (date) => {
  const cal = calendarRef.value?.getApi?.();
  if (!cal) return;

  const dateStr = ymd(date);
  if (countAllDayOn(cal, dateStr) >= 1) {
    alert('⚠️ Only one all-day event allowed on this day.');
    return;
  }

  cal.addEvent({
    title: 'New All-Day Event',
    start: dateStr,
    end: ymd(new Date(date.getTime() + MS_DAY)), // exclusive end
    allDay: true,
  });
};

const pad = n => String(n).padStart(2, '0');

const addDaysLocalStr = (yyyyMmDd, days) => {
  const [y,m,da] = yyyyMmDd.split('-').map(Number);
  const dt = new Date(y, m-1, da);
  dt.setDate(dt.getDate() + days);
  return ymdLocal(dt);
};

function createAllDayEvent(date /* Date from dateClick/select */) {
  const cal = calendarRef.value.getApi();
  const startStr = ymdLocal(date);

  // enforce your “max 1 per day” rule
  if (countAllDayOn(cal, startStr) >= 1) {
      console.log("Is already all day event")
      alert('⚠️ Only one all-day event allowed on this day.');
      toast.warn('Only one all-day event per day');
    return;
  }

  cal.addEvent({
    title: 'New all-day',
    start: startStr,                               // local date string
    end: addDaysLocalStr(startStr, 1),             // exclusive end
    allDay: true,
  });
}

const options = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  nowIndicator: true,
  datesSet() { refreshTypeBars() },   // fires on initial render & nav
  //datesSet() { killPopovers(); refreshTypeBars() },

  dayMaxEvents: true,       // 👈 enables the "+n more" link
  dayMaxEventRows: 3,       // (optional) maximum rows to show per day
  moreLinkClick:  'popover', 
  aspectRatio: window.innerWidth < 640 ? 0.9 : 1, // 👈 smaller = taller cells, larger = flatter


  dayCellDidMount(info) {
    // --- date key, normalized to YYYY-MM-DD (avoid TZ mismatch) ---
    const d = new Date(info.date);
    d.setHours(0,0,0,0);
    //const key = d.toISOString().slice(0,10);

    const key = ymdLocal(info.date); // using helper

    const set = typeBarByDate.value.get(key);
    if (!set || set.size === 0) return;

    // --- find a container to append into ---
    // Prefer the frame, else fallback to the cell element
    const frame =
      info.el.querySelector('.fc-daygrid-day-frame') ||
      info.el;

    if (!frame) {
      console.warn('[typebar] no frame for', key, info.el);
      return;
    }

    // ensure positioning context
    const style = frame.style;
    if (!style.position || style.position === 'static') {
      style.position = 'relative';
    }

    // remove any previous bar (in case of re-render)
    const old = frame.querySelector('.cell-type-bar');
    if (old) old.remove();

    // build bar
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

  eventTimeFormat: { // 👇 force HH:mm
    hour: '2-digit',
    minute: '2-digit',
    hour12: false  // set true for 12h format with AM/PM
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
    : `${formatTime(start)}`

      // access event type
      const t = arg.event.extendedProps?.type;

    // For example: hide titles for 'client' and 'vacation' events
    if (['offer', 'booking'].includes(t)) {
      return { html: `<div class="event-time-only">${timeStrOnlyStart}</div>`}; // empty = hide text
    }
    if (['time'].includes(t)) {
      return { html: `<div class="event-time-only">${timeStr}</div>`}
    }

    // Otherwise show title normally
    return {
      html: `<div>${arg.event.title}</div>`
    };
  },

  eventDurationEditable: (event) => {
    // Only allow resizing for specific events
    return event.extendedProps.canResize === true;
  },



  eventStartEditable: (event) => {
    // Only allow dragging for specific events
    return event.extendedProps.canEdit === true;
  },


  /* onEventClick(arg) {
    openEventModal(arg.event); // <-- pass EventApi, not arg

    selectedDayEvents.value = [arg.event]
    showDayEvents.value = true
  }, */

  select(info) {
    //if (!info.allDay) return;

    //createAllDayEvent(info.start);

    console.log('Start (Date):', info.start);
    console.log('End (Date):', info.end);
    console.log('AllDay:', info.allDay);
    openCreate({ start: info.start, end: info.end, allDay: info.allDay })
  },







  locales: [fiLocale, svLocale, etLocale, enLocale],
  locale: fcLocaleCode.value,

  eventClassNames(arg) {
    const t = arg.event.extendedProps?.type
    return t && EVENT_TYPES[t]?.class ? [EVENT_TYPES[t].class] : []
  },

  displayEventTime: true,

  // Interactions
  editable: false,
  eventStartEditable: false,
  eventDurationEditable: false,
  droppable: false,
  selectable: isUserPro.value,
  selectMirror: true,

  selectAllow(selectInfo) {
    //return selectInfo.start >= new Date();
    if (selectInfo.start < new Date()) return
    // ... countAllDayOn() check here
    const cal = calendarRef.value.getApi();
    const dateStr = selectInfo.startStr.slice(0, 10);
    

    return countAllDayOn(cal, dateStr) < 1;
  },

  eventAllow: (dropInfo, draggedEvent) => {
    // don’t allow crossing between all-day and timed
    if (draggedEvent.allDay !== dropInfo.allDay) return false;

    // only enforce the per-day limit for allDay drops
    if (!dropInfo.allDay) return true;

    const cal = calendarRef.value?.getApi?.();
    if (!cal) return true;

    const targetDate = ymdLocal(dropInfo.start);
    // exclude the event being dragged
    const count = countAllDayOn(cal, targetDate, draggedEvent.id);

    // max 1 per day
    return count < 1;
  },

  dateClick: (info) => {
    //if (!info.allDay) return;

    // Call your helper
    //createAllDayEvent(info.date);
  },

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

/* Hide titles inside dayGrid and timeGrid cells */
/* .fc-event-title {
  display: none !important;
} */


/* .cell-type-bar {
  box-shadow: 0 -1px 3px rgba(255,255,255,0.2);
} */


/* +n popover */
/* make the +N more popover compact and pretty */
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


/* ensure modal appears above the popover */
/* .fc-popover { z-index: 1100; }
.modal, .modal-backdrop { z-index: 2000; } */




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



  /*.fc-theme-standard td {*/
  /*  background-color: #161A22FF;*/
  /*}*/


  /* vertical borders (between days) */
  /*.fc-theme-standard .fc-timegrid-col-frame {*/
  /*  border-color: #304649;  !* your custom color *!*/
  /*}

  /* horizontal borders (between time slots) */
  /*.fc-theme-standard .fc-timegrid-slot {*/
  /*  border-color: #284549;*/
  /*}*/

  /*Header row vert borders*/
  /*.fc-theme-standard th {*/
  /*  border-color: #00bcd4;*/
  /*}*/

  /*.fc .fc-button {*/
  /*  background:#2a2f3a;*/
  /*  border:none;*/
  /*  font-size:.8rem;*/
  /*  padding:4px 10px;*/
  /*}*/
  /*.fc .fc-button:active {*/
  /*  background:#3b4250; !* pressed *!*/
  /*}*/

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

  /* days & time slots */
  /* .fc .fc-daygrid-day:active,
  .fc .fc-timegrid-slot:active {
    
  } */
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

/* .fc-dayGridMonth-view  {
  border: 1px solid rgb(38, 82, 122);
} */

/* Remove the top and left outer borders of the calendar grid */
/* .fc-theme-standard td,
.fc-theme-standard th {
  border-top: none !important;
  border-left: none !important;
} */

/* Color classes (use your dark palette) */
.fc-event.event-offer  { background:#48769c; border:none; color:#fff; }
.fc-event.event-time   { background:#e29657; border:none; color:#fff; }
.fc-event.event-vacation { background:#c04b4bff; border:none; color:#fff; }
.fc-event.event-booking     { background:#097a5e; border:none; color:#fff; }

/* Make events compact on mobile */
@media (max-width: 640px) {
  .fc .fc-daygrid-event { font-size:.72rem; padding:0 2px; line-height:1.2; }
  .fc .fc-daygrid-day-frame { padding:2px; }
}

/* Slightly tighter padding helps on small screens */
@media (max-width: 640px) {
  .fc .fc-daygrid-event { padding: 0 2px; }
  .fc .fc-daygrid-day-frame { padding: 2px; }
}
</style>