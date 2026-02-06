<template>
   
  <!-- Left: Order -->
  <div class="client__panel">
    <header class="panel__header">
      <div>
        <h4 class="panel__title">Varaus</h4>
        <p class="panel__subtitle">Tarkista tiedot ja muokkaa tarvittaessa</p>
      </div>

      <!-- Edit toggle -->
      <button
        class="btn btn--ghost"
        type="button"
        @click="isEditing = !isEditing"
        :aria-pressed="isEditing ? 'true' : 'false'"
      >
        <span v-if="!isEditing">Muokkaa</span>
        <span v-else>Valmis</span>
      </button>
    </header>

    <!-- SUMMARY (read mode) -->
    <div v-if="!isEditing" class="panel__body">
      <div class="info-grid">
        <div class="info-block">
          <div class="info-label">Kuvaus</div>
          <div class="info-value info-value--multiline">
            {{ booking.description || '—' }}
          </div>
        </div>

        <div class="info-block">
          <div class="info-label">Päivämäärä</div>
          <div class="info-value">
            {{ booking.date }}
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="photos">
        <div class="photos__header">
          <h5 class="section-title">Kuvat</h5>
          <button class="btn btn--primary btn--sm" type="button" @click="openFilePicker">
            Lisää kuvia
          </button>
          <input
            ref="fileInput"
            class="sr-only"
            type="file"
            accept="image/*"
            multiple
            @change="onFilesSelected"
          />
        </div>

        <div v-if="booking.photos?.length" class="photos-grid">
          <figure
            v-for="(photo, idx) in booking.photos"
            :key="photo.id || idx"
            class="photo-card"
          >
            <img class="photo-img" :src="photo.imageUrl || photo.previewUrl" :alt="photo.alt || 'Booking photo'" />

            <!-- <figcaption class="photo-actions">
              <button class="icon-btn" type="button" @click="viewPhoto(photo)" aria-label="View">
                👁️
              </button>
              <button class="icon-btn" type="button" @click="replacePhoto(idx)" aria-label="Replace">
                ♻️
              </button>
              <button
                class="icon-btn icon-btn--danger"
                type="button"
                @click="removeDraftPhoto(idx)"
                aria-label="Delete"
              >
                🗑️
              </button>
            </figcaption> -->
          </figure>
        </div>

        <div v-else class="empty-state">
          <p class="empty-state__title">Ei kuvia vielä</p>
          <p class="empty-state__text">Lisää kuvia, jos haluat auttaa palveluntarjoajia arvioinnissa.</p>
        </div>
      </div>
    </div>

    <!-- EDIT MODE -->
    <form v-else class="panel__body" @submit.prevent="saveBookingEdits">
      <div class="form-card">
        <div class="field">
          <label class="label" for="desc">Kuvaus</label>
          <textarea
            id="desc"
            v-model.trim="draft.description"
            class="input input--textarea"
            rows="5"
            placeholder="Kerro lyhyesti mitä tarvitset..."
          ></textarea>
          <div class="help">
            {{ (draft.description?.length || 0) }}/20
          </div>
        </div>



        <div class="field">
          <label class="label" for="date">Päivämäärä</label>
          <div class="field-row">
            <!-- Use your existing date picker if you have one -->
            <!-- <input
              id="date"
              v-model="draft.date"
              class="input"
              type="date"
            /> -->
            <MDBDateTimepicker
              size="lg"
              label="Valitse tehtävän päivämäärä ja aika"
              v-model="draft.date"
              :toggleButton="false"
              inputToggle

              :datepicker="{
                ...L
              }"
              :timepicker="{
                ...L,
                hoursFormat: 24
              }"

              :key="reInitKey"
              disablePast
            />
            <!-- <button class="btn btn--ghost" type="button" @click="setDateToSoonest">
              Aseta mahdollisimman pian
            </button> -->
          </div>
        </div>

        <div class="divider"></div>

        <div class="photos">
          <div class="photos__header">
            <h5 class="section-title">Kuvat</h5>
            <button class="btn btn--primary btn--sm" type="button" @click="openFilePicker">
              Lisää kuvia
            </button>
            <input
              ref="fileInput"
              class="sr-only"
              type="file"
              accept="image/*"
              multiple
              @change="onFilesSelected"
            />

            <input
                ref="replaceInput"
                class="sr-only"
                type="file"
                accept="image/*"
                @change="onReplaceSelected"
            />
          </div>

          <!-- (Optional) dropzone -->
          <div
            class="dropzone"
            @dragenter.prevent="onDragEnter"
            @dragover.prevent
            @dragleave="onDragLeave"
            @drop.prevent="onDrop"
            :class="{ 'dropzone--active': isDragOver }"
          >
            <p class="dropzone__title">Vedä ja pudota kuvia tähän</p>
            <p class="dropzone__text">tai paina “Lisää kuvia”</p>
          </div>

          <div v-if="draft.photos?.length" class="photos-grid">
            <figure
              v-for="(photo, idx) in draft.photos"
              :key="photo.id || idx"
              class="photo-card"
            >
              <img class="photo-img" :src="photo.imageUrl || photo.previewUrl" :alt="photo.alt || 'Booking photo'" />
              <figcaption class="photo-actions">
                <button class="icon-btn" type="button" @click="viewPhoto(photo)" aria-label="View">
                  👁️
                </button>
                <button class="icon-btn" type="button" @click="replacePhoto(idx)" aria-label="Replace">
                  ♻️
                </button>
                <button
                  class="icon-btn icon-btn--danger"
                  type="button"
                  @click="removeDraftPhoto(idx)"
                  aria-label="Delete"
                >
                  🗑️
                </button>
              </figcaption>
            </figure>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn--ghost" type="button" @click="cancelEdits">
            Peruuta
          </button>

          <button class="btn btn--primary" type="submit" :disabled="!isDirty">
            Tallenna muutokset
          </button>
        </div>


        
      </div>
    </form>
  </div>
  
  
</template>
<script setup>
import { MDBDateTimepicker } from 'mdb-vue-ui-kit';
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { useClientStore } from '@/stores/recipientStore';
import uploadService from "@/service/awsUploads";

/**
 * Assumptions:
 * - booking is provided from parent (or you can load it inside).
 * - booking is mutable here. If you use a store (Pinia/Vuex), update accordingly.
 */
const props = defineProps({
  booking: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:booking", "save"]); 
// Optional: you can emit updated booking to parent instead of mutating props directly.

// UI state
const isEditing = ref(false);
const draft = ref(null);
const fileInput = ref(null);

const replaceIndex = ref(null);
const replaceInput = ref(null);

const clientStore = useClientStore();

const removedPhotoIds = ref([]);

const isDragOver = ref(false);
let dragCounter = 0;

// --- Helpers ---
function clonePhotos(photos) {
  return (photos || []).map((p) => ({ ...p }));
}

function preventGlobalFileDrop(e) {
  // Only block if user is dragging files (not text)
  const hasFiles = Array.from(e.dataTransfer?.types || []).includes("Files");
  if (!hasFiles) return;

  e.preventDefault();
  e.stopPropagation();
}

function createDraftFromBookingx() {
  return {
    description: props.booking.description || "",
    date: props.booking.date || "",
    photos: clonePhotos(props.booking.photos),
  };
}

// Dirty check (simple + practical)
const isDirty = computed(() => {
  if (!draft.value) return false;

  const sameDesc = (draft.value.description || "") === (props.booking.description || "");
  const sameDate = (draft.value.date || "") === (props.booking.date || "");

  // If you have stable ids for photos, compare ids instead of full JSON.
  const a = JSON.stringify(draft.value.photos || []);
  const b = JSON.stringify(props.booking.photos || []);

  return !(sameDesc && sameDate && a === b);
});

// When entering edit mode, create draft
watch(isEditing, (val) => {
 draft.value = val ? createDraftFromBooking() : null;
});

function normalizeServerPhoto(p) {
  return {
    imageId: p.imageId ?? p.id ?? p._id ?? p.key ?? null,
    imageUrl: p.imageUrl ?? p.url ?? p.path ?? p.location ?? null,
    previewUrl: null,
    file: null,
    slotId: crypto.randomUUID(),
  };
}

function createDraftFromBooking() {
  return {
    description: props.booking.description || "",
    date: props.booking.date || "",
    photos: (props.booking.photos || []).map(normalizeServerPhoto),
  };
}

/* function createDraftFromBooking() {
  return {
    description: props.booking.description || "",
    date: props.booking.date || "",
    photos: (props.booking.photos || []).map(p => ({
      imageId: p.imageId ?? p.id ?? null,
      imageUrl: p.imageUrl ?? null,
      previewUrl: null,
      file: null,
      slotId: crypto.randomUUID(),
    })),
  };
} */


// --- Date formatting for read mode ---
function formatBookingDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);

  return d.toLocaleString("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function setDateToSoonest() {
  // Example: set to today
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  if (draft.value) draft.value.date = `${yyyy}-${mm}-${dd}`;
}

// --- File picker / dropzone ---
function openFilePicker() {
  fileInput.value?.click();

  if (!isEditing.value) isEditing.value = true;

  if (!draft.value) return;
}

function onFilesSelected(e) {
  const files = Array.from(e.target.files || []);
  addFiles(files);
  e.target.value = "";
}

function onDragEnter(e) {
  if (!e.dataTransfer?.types.includes("Files")) return;
  dragCounter++;
  isDragOver.value = true;
}

function onDragLeave(e) {
  dragCounter--;
  if (dragCounter === 0) {
    isDragOver.value = false;
  }
}

function onDrop(e) {
  dragCounter = 0;
  isDragOver.value = false;

  const files = Array.from(e.dataTransfer.files || []).filter(f =>
    f.type.startsWith("image/")
  );

  if (files.length) {
    addFiles(files);
  }
}

/* function handleDrop(e) {
  isDragOver.value = false;

  const files = Array.from(e.dataTransfer.files || []).filter(f =>
    f.type.startsWith("image/")
  );

  if (!files.length) return;

  addFiles(files);
} */



function addFilesx(files) {
  if (!draft.value) return;

  draft.value.photos ||= [];

  for (const file of files) {
    draft.value.photos.push({
      id: crypto?.randomUUID?.() || String(Math.random()),
      url: URL.createObjectURL(file),
      file,
      isNew: true,
    });
  }

  console.log("Draft after adding photos -- ", draft.value)
}

function addFiles(files) {
  if (!draft.value) return;
  draft.value.photos ||= [];

  for (const file of files) {
    draft.value.photos.push({
      imageId: null,
      imageUrl: null,
      previewUrl: URL.createObjectURL(file),
      file,
      slotId: crypto.randomUUID()
    });
  }
}


function normalizeUploadResponseItem(u) {
  return {
    imageId: u.id ?? u._id ?? u.key ?? null,
    imageUrl: u.imageUrl ?? u.location ?? u.path ?? null,
  };
}

function applyUploadsToDraft(pending = [], uploadedRaw = []) {
  const uploaded = (uploadedRaw || []).map(normalizeUploadResponseItem);

  if (uploaded.length !== pending.length) {
    throw new Error(`Upload count mismatch: ${uploaded.length} vs ${pending.length}`);
  }

  for (let i = 0; i < pending.length; i++) {
    const local = pending[i];
    const up = uploaded[i];

    if (local.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(local.previewUrl);

    local.imageId = up.imageId;
    local.imageUrl = up.imageUrl;
    local.previewUrl = null;
    local.file = null;
  }
}



async function uploadDraftPhotos__() {
  const pending = (draft.value.photos || []).filter(p => p.file);

  if (!pending.length) return []; // nothing to upload

  const fd = new FormData();

  const slotIds = pending.map(p => p.slotId);
  fd.append("slotIds", JSON.stringify(slotIds));

  // IMPORTANT: field name must match multer array('files', 10)
  pending.forEach(p => fd.append("files", p.file));

  const res = await uploadService.uploadClientImage(fd);

  // Normalize response to array:
  // Expect something like [{ url, key, id, ... }, ...]
  const uploaded = Array.isArray(res) ? res : (res?.files || []);
  return { slotIds, uploaded };
}

async function uploadDraftPhotos() {
  const pending = (draft.value?.photos || []).filter(p => p.file);

  if (!pending.length) {
    return { pending: [], uploaded: [] }; // ✅ consistent
  }

  const fd = new FormData();
  pending.forEach(p => fd.append("files", p.file));

  const res = await uploadService.uploadClientImage(fd);

  // your server returns { files: [...] }
  const uploaded = res?.files ?? [];      // ✅ never undefined
  return { pending, uploaded };
}



function applyUploadsToDraftx(pending, uploaded) {
  if (uploaded.length !== pending.length) {
    throw new Error("Upload count mismatch");
  }

  for (let i = 0; i < pending.length; i++) {
    const local = pending[i];
    const up = uploaded[i]; // e.g. { url, key }

    // update the same object reference in draft
    local.url = up.url;           // server url
    local.serverId = up.id ?? up.key ?? null;
    local.isNew = false;

    // keep previewUrl for UI if you want, but remove file (avoid sending it)
    delete local.file;
  }
}

function buildPayload() {
  return {
    description: draft.value.description,
    date: draft.value.date,
    photos: (draft.value.photos || [])
      .map(p => p.imageId)
      .filter(Boolean),
    removedPhotoIds: removedPhotoIds.value.filter(Boolean),
  };
}

function assertPayloadPhotos(payload) {
  const bad = (payload.photos || []).find(ph => !ph.id || !ph.imageUrl);
  if (bad) throw new Error("Some photos missing id/imageUrl (upload mapping failed).");
}



async function saveBookingEdits__() {
  if (!draft.value) return;

  try {
    const result = await uploadDraftPhotos();
    if (result?.pending?.length) {
      applyUploadsToDraft(result.pending, result.uploaded);
    }

    console.log("Draft during upload save ", draft.value)

    // Now draft has server URLs, not blob URLs
    const payload = buildBookingPayload();
    assertPayloadPhotos(payload);
    console.log("Booking payload - ", payload)
    //await bookingStore.updateBooking(props.booking.id, payload); // or parent emit
    await clientStore.updateMain(props.booking.id, payload);
    //emit('save', payload);

    removedPhotoIds.value = [];
    isEditing.value = false;
  } catch (err) {
    console.error("Save failed:", err?.response?.data || err);
  }
}


async function saveBookingEdits() {
  if (!draft.value) return;

  try {
    const { pending, uploaded } = await uploadDraftPhotos();

    if (pending.length) {
      applyUploadsToDraft(pending, uploaded);
    }

    const payload = buildPayload(); // should allow photos: []
    console.log("Booking payload - ", payload)
    await clientStore.updateMain(props.booking.id, payload);

    const main = clientStore.bookings.find(b => b.id === props.booking.id);
    if (main) {
      main.photos = draft.value.photos.map(p => ({ id: p.imageId, imageUrl: p.imageUrl }));
      main.description = draft.value.description;
      main.date = draft.value.date;
    }

    removedPhotoIds.value = [];
    isEditing.value = false;
  } catch (err) {
    console.error("Save failed:", err?.response?.data || err);
  }
}


/* async function saveBookingEdits() {
  try {
    const up = await uploadDraftPhotos();
    if (up) applyUploadsToDraft(up.slotIds, up.uploaded);

    const payload = buildPayload();
    console.log("Booking payload - ", payload)
    await clientStore.updateMain(props.booking.id, payload);

    const main = clientStore.bookings.find(b => b.id === props.booking.id);
    if (main) {
      main.photos = draft.value.photos.map(p => ({ id: p.imageId, imageUrl: p.imageUrl }));
      main.description = draft.value.description;
      main.date = draft.value.date;
    }

    removedPhotoIds.value = [];
    isEditing.value = false;
  } catch (err) {
    console.error(err);
  }
} */



// --- Photo actions ---
function viewPhoto(photo) {
  // You can open modal. Quick demo:
  window.open(photo.url, "_blank");
}

function replacePhotox(idx) {
  // Typical pattern: click file picker and replace at idx.
  // Keep it simple: switch to edit mode and let user add again, then delete old.
  if (!isEditing.value) isEditing.value = true;
  // You can implement a separate hidden input for "replace", if you want.
}

async function replacePhoto(idx) {
    if (!isEditing.value) {
    isEditing.value = true;
    await nextTick();
  }
  replaceIndex.value = idx;
  replaceInput.value?.click()
  
}

function onReplaceSelected(e) {
  const file = e.target.files?.[0];
  if (!file || !draft.value || replaceIndex.value == null) return;

  const idx = replaceIndex.value;
  const old = draft.value.photos[idx];

  // 1) if old photo exists on server, mark it for deletion
  if (old?.imageId) {
    removedPhotoIds.value.push(old.imageId);
  }

  // 2) cleanup old preview url if existed
  if (old?.previewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(old.previewUrl);
  }

  // 3) replace the slot with a new pending upload item
  draft.value.photos[idx] = {
    imageId: null,
    imageUrl: null,
    previewUrl: URL.createObjectURL(file),
    file,
    slotId: old?.slotId || crypto.randomUUID(), // keep slotId so mapping is stable
  };

  e.target.value = "";
  replaceIndex.value = null;
}

function onReplaceSelected__(e) {
  const file = e.target.files?.[0];
  if (!file || !draft.value || replaceIndex.value == null) return;

  const idx = replaceIndex.value;

  const old = draft.value.photos[idx];

  // clean up old blob URL if needed
  if (old?.url?.startsWith("blob:")) {
    URL.revokeObjectURL(old.url);
  }

  draft.value.photos[idx] = {
    ...(old || {}),
    url: URL.createObjectURL(file),
    file,
    isReplaced: true, // optional
  };

  e.target.value = "";
  replaceIndex.value = null;
}

function removePhoto(idx) {
  // Read mode remove (if you allow). Often you’d force edit.
  if (!isEditing.value) isEditing.value = true;
  props.booking.photos?.splice(idx, 1);
}


function removeDraftPhoto(idx) {
  if (!isEditing.value) isEditing.value = true;
  
  if (!draft.value?.photos?.length) return;
  
  const photo = draft.value.photos[idx];

  // If it exists in DB (uploaded already), mark for deletion
  if (photo?.imageId) {
    removedPhotoIds.value.push(photo.imageId);
  }

  // If it was just a local preview, cleanup blob url
  if (photo?.previewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(photo.previewUrl);
  }

  draft.value.photos.splice(idx, 1);
}

// --- Save / cancel ---
function cancelEdits() {
  isEditing.value = false; // watcher clears draft
}

async function saveBookingEditsx() {
  if (!draft.value) return;

  // Example validation:
  if ((draft.value.description || "").length > 500) return;



  let uploadedClientFiles = [];
    try {
      if (files.value.length) {
        const fd = new FormData();
        // IMPORTANT: must match server array("files")
        files.value.forEach((f) => fd.append("files", f.file));
    
        const res = await uploadService.uploadClientImage(fd);
        uploadedClientFiles = Array.isArray(res) ? res : (res?.files || []);
      }
    } catch (err) {
      console.error("Upload failed:", err?.response?.data || err);
      // optionally mark optimistic message failed
      return;
    }

    console.log("FILES - ", uploadedClientFiles);

  

  // If you prefer NOT to mutate props, emit updated booking:
  const updatedBooking = {
    /* ...props.booking, */
    description: draft.value.description,
    date: draft.value.date,
    photos: draft.value.photos,
  };

  console.log("Updated booking ", updatedBooking);

  //emit("update:booking", updatedBooking);
  //emit("save", updatedBooking);

  // If you DO mutate in place (not recommended for props), use a store instead.
  isEditing.value = false;
}

onMounted(() => {
  window.addEventListener("dragover", preventGlobalFileDrop, { passive: false });
  window.addEventListener("drop", preventGlobalFileDrop, { passive: false });
});

onBeforeUnmount(() => {
  window.removeEventListener("dragover", preventGlobalFileDrop);
  window.removeEventListener("drop", preventGlobalFileDrop);
});

/**
 * Optional stub for your API call
 */
// async function saveBookingToApi(updated) {
//   // await api.patch(`/bookings/${updated.id}`, updated)
// }
</script>
<style scoped>
/* .layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
} */
.client__panel {
  background-color: #252c3a;
  border: 1px solid rgba(0,0,0,.08);
  padding: 7px;
  border-radius: 14px;
}
.panel {
  background: #252c3a;
  border: 1px solid rgba(0,0,0,.08);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,.04);
}

/* .panel--order {
  position: sticky;
  top: 12px;

  max-height: calc(100vh - 24px);
  display: flex;
  flex-direction: column;
}
 */
.panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 14px 10px;
  border-bottom: 1px solid rgba(0,0,0,.06);
}

.panel__title {
  margin: 0;
  font-size: 16px;
  line-height: 1.2;
}

.panel__subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  opacity: 0.7;
}

.panel__body{
  overflow-y: auto;
  overflow-x: hidden;
  text-align: left;
  min-height: 0;
  padding-bottom: calc(28px + env(safe-area-inset-bottom));
  scroll-padding-bottom: calc(28px + env(safe-area-inset-bottom));
}

.panel__body::-webkit-scrollbar {
  width: 6px;
}
.panel__body::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,.2);
  border-radius: 6px;
}


.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.info-block {
  display: grid;
  gap: 6px;
}

.info-label {
  font-size: 12px;
  opacity: 0.65;
}

.info-value {
  font-size: 14px;
  line-height: 1.4;
}

.info-value--multiline {
  white-space: pre-wrap;
}

.divider {
  height: 1px;
  background: rgba(0,0,0,.06);
  margin: 14px 0;
}

.section-title {
  margin: 0;
  font-size: 14px;
}

/* Buttons */
.btn {
  border: 0;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  cursor: pointer;
}

.btn--sm {
  padding: 8px 10px;
  border-radius: 10px;
}

.btn--primary {
  background: #111827;
  color: white;
}

.btn--ghost {
  background: transparent;
  color: #525e79;
  border: 1px solid rgba(0,0,0,.14);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Form */
.form {
  display: grid;
  gap: 12px;
}

.field {
  display: grid;
  gap: 6px;
}

.label {
  font-size: 12px;
  opacity: 0.75;
}

.input {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,.14);
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
}

.input:focus {
  border-color: rgba(17,24,39,.55);
  box-shadow: 0 0 0 3px rgba(17,24,39,.08);
}

.input--textarea {
  resize: vertical;
}

.help {
  font-size: 12px;
  opacity: 0.6;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
}

/* Photos */
.photos__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.photo-card {
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,.10);
  background: rgba(0,0,0,.02);
}

.photo-img {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

.photo-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  background: #fff;
}

.icon-btn {
  border: 1px solid rgba(0,0,0,.12);
  background: #fff;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.icon-btn--danger {
  border-color: rgba(220, 38, 38, .35);
}

/* Empty state */
.empty-state {
  border: 1px dashed rgba(0,0,0,.18);
  border-radius: 12px;
  padding: 12px;
  background: rgba(0,0,0,.015);
}

.empty-state__title {
  margin: 0;
  font-size: 13px;
}

.empty-state__text {
  margin: 6px 0 0;
  font-size: 12px;
  opacity: 0.7;
}

.dropzone {
  border: 1px dashed rgba(255,255,255,.25);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 13px;
  transition: transform .08s ease, border-color .08s ease, background .08s ease;
}

.dropzone--active {
  border-color: rgba(59,130,246,.9);
  border-radius: 12px;
  margin: 0 5px 13px 5px;
  background: rgba(59,130,246,.08);
  transform: scale(1.01);
}


.dropzone__title {
  margin: 0;
  font-size: 13px;
}

.dropzone__text {
  margin: 6px 0 0;
  font-size: 12px;
  opacity: 0.7;
}

/* Accessibility helper */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}

/* Responsive */
/* @media (max-width: 980px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .panel--order{
    position: static;
    top: auto;
    max-height: none;
    display: block;
  }

  .panel__body{
    overflow: visible;   
    max-height: none;
    padding-bottom: 14px;
  }
  .photos-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  
} */

@media (max-width: 980px){
  .panel--order{
    position: static;
    max-height: none;
    display: block;
  }

  .panel__body{
    overflow: visible;
    padding-bottom: 14px;
  }
}

@media (max-width: 980px){
  .photos-grid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 600px){
  .photos-grid{ grid-template-columns: 1fr; }
}

</style>