<template>
  <div style="padding-top: 60px;">
    <FullCalendar ref="calendarRef" :events="events" :options="options" />

    <!-- Create Event Modal -->
<!--    <MDBModal v-model="showCreate" centered>-->
<!--      <template #title>New event</template>-->

<!--      <template #body>-->
<!--        <div class="space-y-3">-->
<!--          <MDBInput v-model="form.title" label="Title *" />-->
<!--          <MDBInput v-model="form.location" label="Location" />-->
<!--          <MDBTextarea v-model="form.note" label="Note" rows="3" />-->

<!--          <div class="text-sm opacity-80">-->
<!--            <div><strong>Start:</strong> {{ form.start?.toLocaleString() }}</div>-->
<!--            <div><strong>End:</strong>   {{ form.end?.toLocaleString() }}</div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </template>-->

<!--      <template #footer>-->
<!--        <MDBBtn color="secondary" outline @click="showCreate=false">Cancel</MDBBtn>-->
<!--        <MDBBtn color="primary" @click="saveEvent">Save</MDBBtn>-->
<!--      </template>-->
<!--    </MDBModal>-->
  </div>


  <h2>Props: {{count}}</h2><br>
  <p>Weekdays {{days}}</p><br>

  <MDBBtn color="primary" @click="sendProp">Send props back</MDBBtn>

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
        <MDBSelect v-model="selectedState" v-model:options="stateOptions" label="saattavilla tai joustava" style="margin-bottom: 20px;"/>
<!--        <MDBInput v-model="form.location" label="Location" />-->
        <MDBTextarea v-model="form.note" label="Kuvaus..." rows="3" wrapperClass="mb-4"/>

        <div class="text-sm opacity-80">
          <div><strong>Aloitus:</strong> {{ form.start?.toLocaleString() }}</div>
          <div><strong>Loppu:</strong>   {{ form.end?.toLocaleString() }}</div>
        </div>
      </div>
    </MDBModalBody>
    <MDBModalFooter>
      <MDBBtn color="secondary" outline @click="showCreate=false">Poistu</MDBBtn>
      <MDBBtn color="primary" @click="saveEvent">Tallentaa</MDBBtn>
    </MDBModalFooter>
  </MDBModal>






  <MDBModal
      v-model="showEdit" center
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
      <p>---</p>
      <div class="space-y-3">

        <MDBInput v-model="editForm.title" label="Title" />
        <MDBInput v-model="editForm.location" label="Location" />
        <MDBTextarea v-model="editForm.note" label="Note" rows="3" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <MDBInput label="Start" type="datetime-local" v-model="editForm.start" />
          <MDBInput label="End"   type="datetime-local" v-model="editForm.end" />


          <MDBDateTimepicker
              v-model="editForm.start"
              :options="{
              closeOnSelect: true,   // ✅ close picker after selecting
              buttons: { ok: 'OK', cancel: 'Cancel' }
           }"
          />

        </div>

      </div>
    </MDBModalBody>
    <MDBModalFooter>
      <MDBBtn color="secondary" outline @click="showEdit=false">Cancel</MDBBtn>
      <MDBBtn color="danger" outline @click="deleteEvent">Delete</MDBBtn>
      <MDBBtn color="primary" @click="saveEventEdits">Save</MDBBtn>
    </MDBModalFooter>
  </MDBModal>




  <!--  <legend types="EVENT_TYPES" />-->
<!--  <FullCalendar ref="calendarRef" :events="events" :options="options" />-->
<!--  <p v-if="clickedDate">You clicked: {{ clickedDate }}</p>-->

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
    <MDBModalHeader>
      <MDBModalTitle>{{ selectedEvent?.title || 'Event' }}</MDBModalTitle>
    </MDBModalHeader>
    <MDBModalBody>
      <p>---</p>
      <p><strong>Start:</strong> {{ selectedEvent?.start ? formatEventDate(new Date(selectedEvent.start)) : '—' }}</p>
      <p><strong>End:</strong> {{ selectedEvent?.end ? formatEventDate(new Date(selectedEvent.end)) : '—' }}</p>
      <p v-if="selectedEvent.note !== ''">Kuvaus: {{selectedEvent.note}}</p>
<!--      <p>Location: -{{ selectedEvent?.location || '-&#45;&#45;' }}</p>-->
<!--      <div v-for="(val, key) in selectedEvent" :key="key"-->
<!--           v-if="!['id','title','start','end', 'location'].includes(key)">-->
<!--        <p><strong>{{ key }}:</strong> {{ val }}</p>-->

<!--      </div>-->

    </MDBModalBody>
    <MDBModalFooter>
      <MDBBtn color="secondary" outline @click="showEventModal=false">Close</MDBBtn>
      <MDBBtn color="danger" @click="deleteEvent">Delete</MDBBtn>
    </MDBModalFooter>
  </MDBModal>

</template>

<script setup>
import { MDBModal, MDBModalHeader, MDBModalTitle, MDBBtn, MDBModalBody, MDBModalFooter, MDBInput, MDBTextarea, MDBDateTimepicker, MDBSelect } from 'mdb-vue-ui-kit';

import { ref, computed } from 'vue'
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

defineProps({
  count: {type: Number},
  days: Array
})

//const events = ref([])

const emit = defineEmits(['over'])

const sendProp = () => {
  emit("over", "Hello parent!")
}

const events = ref([
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
])

const stateOptions = ref([
  {text: "Saattavilla", value: 1},
  {text: "Joustava", value: 2}
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
  note: '',
  allDay: true,
  start: null, // JS Date
  end: null,   // JS Date
})

/* ensure end exists (30 min for timed, 1 day for allDay) */
function ensureEnd(start, allDay) {
  if (!start) return null
  return allDay
      ? new Date(start.getTime() + 24 * 60 * 60 * 1000)
      : new Date(start.getTime() + 30 * 60 * 1000)
}

/* open create modal from dateClick/select */
function openCreate({ start, end, allDay }) {

  const safeEnd = end ?? ensureEnd(start, allDay)
  form.value = {
    title: '',
    location: '',
    note: '',
    allDay: !!allDay,
    start,
    end: safeEnd,
  }
  showCreate.value = true
}

/* save new event with extendedProps */
function saveEvent() {
  const f = form.value
  if (!f.title?.trim()) return alert('Please add a title')
  events.value = [
    ...events.value,
    {
      id: String(Date.now()),
      title: f.title.trim(),
      start: f.start,
      end:   f.end,
      allDay: f.allDay,
      extendedProps: {
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
const fromLocalInput = (s) => (s ? new Date(s) : null)

/* ------------ edit modal state ------------ */
const showEdit = ref(false)
let editingEventApi = null // FullCalendar EventApi currently being edited
const editForm = ref({
  id: '',
  title: '',
  start: '',
  end: '',
  location: '',
  note: ''
})

/* Open modal from an event click */
function openEventModal(eventApi) {
  editingEventApi = eventApi
  editForm.value = {
    id: eventApi.id,
    title: eventApi.title || '',
    start: toLocalInput(eventApi.start),
    end: toLocalInput(eventApi.end),
    location: eventApi.extendedProps?.location || '',
    note: eventApi.extendedProps?.note || ''
  }
  showEdit.value = true
  // ✅ clear selection/highlight if there is one
  const api = calendarRef.value.getApi()
  api.unselect()
}

/* Save edits: update FullCalendar event + mirror to our array */
function saveEventEdits() {
  if (!editingEventApi) return
  const f = editForm.value

  const newStart = fromLocalInput(f.start)
  const newEnd = fromLocalInput(f.end)
  // 2) Mirror changes into our reactive array (so your state stays in sync)
  const idx = events.value.findIndex(e => e.id === f.id)
  if (idx !== -1) {
    const ev = events.value[idx]
    events.value = [
      ...events.value.slice(0, idx),
      {
        ...ev,
        title: f.title || '',
        start: newStart ? newStart.toISOString() : ev.start,
        end:   newEnd ? newEnd.toISOString() : null,
        extendedProps: { ...(ev.extendedProps || {}), location: f.location || '', note: f.note || '' }
      },
      ...events.value.slice(idx + 1)
    ]
  }

  showEdit.value = false
}

/* Optional delete from the edit modal */
function deleteEvent() {
  if (!editingEventApi) return
  const id = editingEventApi.id
  editingEventApi.remove() // remove from calendar
  events.value = events.value.filter(e => e.id !== id) // mirror in our state
  showEdit.value = false
}

const now = () => new Date()

const upcomingEvents = computed(() =>
    events.value.filter(e => new Date(e.end || e.start) >= now())
)

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
function isEventApi(x) {
  return x && typeof x.getExtendedProp === 'function';
}

function openEventModalPreview(evt) {
  // evt can be an EventApi or a plain object
  const start = isEventApi(evt) ? evt.start : evt.start;
  const end =
      (isEventApi(evt) ? evt.end : evt.end) ??
      (start
          ? new Date(start.getTime() + (isEventApi(evt) ? (evt.allDay ? 86400000 : 1800000) : 1800000))
          : null);

  const location = isEventApi(evt)
      ? (evt.getExtendedProp('location') ?? null)
      : (evt.extendedProps?.location ?? evt.location ?? null);

  const note = isEventApi(evt)
      ? (evt.getExtendedProp('note') ?? null)
      : (evt.extendedProps?.note ?? evt.note ?? null);

  selectedEvent.value = {
    id: isEventApi(evt) ? evt.id : evt.id,
    title: isEventApi(evt) ? evt.title : evt.title,
    start: start ? start.toISOString() : null,
    end: end ? end.toISOString() : null,
    allDay: isEventApi(evt) ? evt.allDay : !!evt.allDay,
    location,
    note,
    // keep nested bag if available
    extendedProps: isEventApi(evt) ? (evt.toPlainObject().extendedProps ?? {}) : (evt.extendedProps ?? {})
  };

  showEventModal.value = true;
  // console.log('clicked ext props:', event.extendedProps)   // should show { location: 'Room x', ... }
  // const start = event.start
  // const end =
  //     event.end ??
  //     (event.allDay
  //         ? new Date(start.getTime() + 24 * 60 * 60 * 1000)    // assume 1 day
  //         : new Date(start.getTime() + 30 * 60 * 1000))        // assume 30 min
  // const location = event.getExtendedProp('location') ?? null
  // selectedEvent.value = {
  //   id: event.id,
  //   title: event.title,
  //   start: start?.toISOString(),
  //   end: end?.toISOString(),
  //   allDay: event.allDay,
  //   location: event.extendedProps?.location ?? null,
  //   note: event.extendedProps?.note ?? null,
  // }
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
  // prevent following a link if the event has a `url`
  // info.jsEvent.preventDefault()
  //
  // const e = info.event
  // console.log('Clicked event:')
  // console.log('id:', e.id)
  // console.log('title:', e.title)
  // console.log('start:', e.start?.toISOString())
  // console.log('end:', e.end?.toISOString())
  // console.log('allDay:', e.allDay)
  // console.log('extendedProps:', e.extendedProps) // your custom data

  //Example: open your modal and pass data
  //openEventModal({ id: e.id, title: e.title, start: e.start, ...e.extendedProps })
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





const options = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  eventTimeFormat: { // 👇 force HH:mm
    hour: '2-digit',
    minute: '2-digit',
    hour12: false  // set true for 12h format with AM/PM
  },
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  height: 'auto',
  dayMaxEventRows: window.innerWidth < 640 ? 2 : 4,
  moreLinkClick: 'popover',
  //initialView: window.innerWidth < 640 ? 'listWeek' : 'dayGridMonth',

  // i18n
  locales: [fiLocale, svLocale, etLocale, enLocale],
  locale: fcLocaleCode.value,

  eventClassNames(arg) {
    const t = arg.event.extendedProps?.type
    return t && EVENT_TYPES[t]?.class ? [EVENT_TYPES[t].class] : []
  },


  // Possible to delete event
  // eventContent(arg) {
  //   return {
  //     html: `
  //       <div style="display:flex;justify-content:space-between;align-items:center">
  //         <span>${arg.event.title}</span>
  //           <button class="delete-btn" data-id="${arg.event.id}">x</button>
  //       </div>
  //     `
  //   }
  // },
  // eventDidMount(info) {
  //   info.el.querySelector('.delete-btn')?.addEventListener('click', e => {
  //     e.stopPropagation()
  //     info.event.remove()
  //   })
  // },

  // Interactions
  editable: true,                 // enables drag & resize
  eventStartEditable: true,       // can drag
  eventDurationEditable: true,    // can resize
  droppable: false,               // set true if you’ll drag from external list
  selectable: true,               // click-drag to create a new event
  selectMirror: true,


  selectAllow(selectInfo) {
    // disallow if start is before "now"
    return selectInfo.start >= new Date()
  },
  eventAllow(dropInfo, draggedEvent) {
    return dropInfo.start >= new Date()
  },

  dateClick(info) {
    const api = calendarRef.value.getApi()

    if (info.view.type.startsWith('dayGrid')) {
      if (isPastDay(info.date)) return;         // ⛔ do nothing
    } else {
      // timeGridDay/Week: respect time
      if (isPastMoment(info.date)) return;      // ⛔ do nothing
    }

    // allowed → open your modal


    openCreate({ start: info.date, end: null, allDay: info.allDay });

    /* B) drag to select a range (has start+end) */



    if (window.innerWidth < 640) {
      api.changeView('timeGridDay', info.date)
    }



    console.log('Day clicked:', info.dateStr + " " + info.date)
  },

  select(info) {
    openCreate({ start: info.start, end: info.end, allDay: info.allDay })
  },

  // select(info) {
  //   console.log("INFO START: " + info.start);
  //   console.log("INFO END: " + info.end);
  //   // Create a new event on user selection (you can open a dialog instead)
  //   if (info.view.type !== 'dayGridMonth') {
  //     events.value = [
  //       ...events.value,
  //       { id: String(Date.now()),
  //         title: prompt('Lisa tekst:'),
  //         start: info.start,
  //         end: info.end, allDay:
  //         info.allDay,
  //         extendedProps: {
  //           note: prompt('Add a note:'),       // another input
  //           createdBy: 'user123',
  //           status: 'draft'
  //         }
  //
  //       }
  //     ]
  //   }
  //
  // },

  // When user moves or resizes an event
  events: events.value,    // initial events
  eventClick: onEventClick,
  //eventDrop: handleDrop,   // when dragged
  //eventResize: handleResize, // when resized
  // eventDrop: persistChange,       // fired after drag
  // eventResize: persistChange,     // fired after resize

  // Useful scheduling options
  nowIndicator: true,
  slotMinTime: '07:00:00',
  slotMaxTime: '20:00:00',
  slotDuration: '00:30:00',
  snapDuration: '00:15:00',       // drag snaps every 15min
  //businessHours: { daysOfWeek: [1,2,3,4,5], startTime: '09:00', endTime: '17:00' },
  eventOverlap: true              // or a function if you want rules
}))
</script>

<style>

/* highlight day cell when tapped */
.fc .fc-daygrid-day:active,
.fc .fc-timegrid-slot:active {
  background: #2a2f3a;       /* darker background while pressed */
  transform: scale(0.98);    /* little shrink for tactile feel */
  transition: background 0.2s, transform 0.1s;
}

.fc-col-header {
  background-color: #242931;
}
.fc .fc-col-header, .fc .fc-daygrid-day { border-color:#2a2f3a; }
.fc { background:#161a22; color:#e6e6e6; border-radius:8px; }
.fc .fc-day-today { background:#1e2530; }



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
  /*border-color: rgba(73, 210, 255, 0.7) !important;*/
  /*box-shadow: 0 0 4px rgba(73, 210, 255, 0.6);*/
  border-color: rgba(14, 31, 36, 0.7) !important;
  box-shadow: 0 0 4px rgba(34, 72, 84, 0.6);
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
  /*}*/

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
  .fc .fc-daygrid-day:active,
  .fc .fc-timegrid-slot:active {
    /*background:#2a2f3a;*/
    /*transform: scale(0.98);*/
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

.fc-dayGridMonth-view  {
  /*border: 1px solid red;*/
}

/* Color classes (use your dark palette) */
.fc-event.event-meeting  { background:#2563eb; border:none; color:#fff; }
.fc-event.event-client   { background:#16a34a; border:none; color:#fff; }
.fc-event.event-vacation { background:#dc2626; border:none; color:#fff; }
.fc-event.event-task     { background:#a855f7; border:none; color:#fff; }

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