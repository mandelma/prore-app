
<template>
  <section class="booking-panel">
    <header class="booking-panel__header">
      <div class="booking-panel__heading">
        <span class="booking-panel__eyebrow">
          {{ t("bookingContent.sections.booking") }}
        </span>

        <h2 class="booking-panel__title">
          {{ booking.header || t("bookingContent.sections.booking") }}
        </h2>
      </div>

      <div
        v-if="booking.date"
        class="booking-panel__date"
      >
        <span class="booking-panel__date-icon" aria-hidden="true">
          ◷
        </span>

        <span>{{ formatDateTime(booking.created) }}</span>
      </div>
    </header>

    <!-- booking customFields {{ booking.customFields }} -->

    <!-- Read mode -->
    <div
      v-if="!isEditing"
      class="booking-panel__body"
    >

      <div class="direct-booking-info__panel">
        <div class="direct-booking-info__header">
          <div>
            <span class="direct-booking-info__eyebrow">
              {{ t("recipientPage.orderInfo") }}
            </span>
          </div>

          <MDBIcon
            icon="clipboard-list"
            class="direct-booking-info__header-icon"
          />
        </div>

        <dl class="direct-booking-info__details">
          <div
            v-if="booking.description"
            class="direct-booking-info__row direct-booking-info__row--description"
          >
            <dt>
              {{ t("recipientPage.description") }}
            </dt>

            <dd>
              {{ booking.description }}
            </dd>
          </div>
          

          <table v-if="booking.customFields.length">
            <tr v-if="booking.customFields.length">
              <td>
                {{ t('clientOffer.additional_details') }}
              </td>

              <td>
                <MDBBtn
                  type="button"
                  outline
                  color="primary"
                  size="sm"
                  @click="showCustomFields = !showCustomFields"
                >
                  {{
                    showCustomFields
                      ? t('clientOffer.hide_details')
                      : t('clientOffer.show_details')
                  }}
                </MDBBtn>
              </td>
            </tr>

            <tr v-if="showCustomFields && booking.customFields.length">
              <td colspan="2">
                <div class="custom-fields-panel">
                  <div
                    v-for="field in displayCustomFields"
                    :key="field.key"
                    class="custom-field-row"
                  >
                    <span class="custom-field-label">
                      {{ getLocalizedValue(field.label) }}
                    </span>

                    <span class="custom-field-value">
                      {{ getCustomFieldDisplayValue(field) }}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </table>



          <div
            v-if="booking.created"
            class="direct-booking-info__row"
          >
            <dt>
              <MDBIcon icon="calendar-alt" />

              {{ t("recipientPage.executionTime") }}
            </dt>
          
            <dd>
              {{ formatDateTime(booking.created, locale) }}
            </dd>
          </div>
          <div
            v-if="booking.address"
            class="direct-booking-info__row"
          >
            <dt>
              <MDBIcon icon="map-marker-alt" />

              {{ t("recipientPage.address") }}
            </dt>

            <dd>
              {{ booking.address }}
            </dd>
          </div>

          <div
            v-if="booking.professional"
            class="direct-booking-info__row"
          >
            <dt>
              <MDBIcon icon="briefcase" />

              {{ t("recipientPage.profession") }}
            </dt>

            <dd>
              {{ booking.professional.map(p => localProfessionName(p)).join(", ") }}
            </dd>
          </div>
        </dl>
      </div>

      <div class="section-divider" />

      <section class="photos-section">
        <div class="section-heading section-heading--row">
          <div>
            <h3 class="section-heading__title">
              {{ t("bookingContent.sections.photos") }}
            </h3>

            <p
              v-if="booking.photos?.length"
              class="section-heading__subtitle"
            >
              {{ booking.photos.length }}
            </p>
          </div>
        </div>
        
        <div v-if="booking.photos?.length"
          class="photos-grid"
        >
          <figure
            v-for="(photo, idx) in booking.photos"
            :key="photo.id || idx"
            class="photo-card"
          >
            <div class="photo-card__media">
              <div
                v-if="loadingImages[idx]"
                class="photo-loader"
                role="status"
              >
                <span class="photo-loader__spinner" />
              </div>

              <img
                class="photo-card__image"
                :src="
                  photo.imageId?.imageUrl ||
                  photo.imageUrl ||
                  photo.imageId?.previewUrl
                "
                :alt="
                  photo.alt ||
                  t('bookingContent.alt.booking_photo')
                "
                loading="lazy"
                @load="loadingImages[idx] = false"
                @error="loadingImages[idx] = false"
              />
            </div>

            <figcaption
              v-if="photo.text"
              class="photo-card__caption"
            >
              {{ photo.text }}
            </figcaption>
          </figure>
        </div>

        <div
          v-else
          class="empty-state"
        >
          <div
            class="empty-state__icon"
            aria-hidden="true"
          >
            ▧
          </div>

          <p class="empty-state__text">
            {{ t("bookingContent.empty.no_photos") }}
          </p>
        </div>
      </section>
    </div>

    <!-- Edit mode -->
    <form
      v-else
      class="booking-panel__body"
      @submit.prevent="saveBookingEdits"
    >
      <div class="edit-form">
        <div class="form-field">
          <div class="form-field__header">
            <label
              class="form-field__label"
              for="booking-description"
            >
              {{ t("bookingContent.fields.description") }}
            </label>

            <span class="form-field__counter">
              {{ draft.description?.length || 0 }}/20
            </span>
          </div>

          <textarea
            id="booking-description"
            v-model.trim="draft.description"
            class="form-control-custom form-control-custom--textarea"
            rows="5"
            maxlength="20"
            :placeholder="
              t('bookingContent.placeholders.description')
            "
          />

          <p class="form-field__help">
            {{ t("bookingContent.placeholders.description") }}
          </p>
        </div>

        <div class="form-field">
          <label class="form-field__label">
            {{ t("bookingContent.fields.date") }}
          </label>

          <div class="date-picker-wrap">
            <MDBDateTimepicker
              v-model="draft.date"
              size="lg"
              :label="
                t('bookingContent.labels.select_date_time')
              "
              :toggle-button="false"
              input-toggle
              :datepicker="{ ...L }"
              :timepicker="{
                ...L,
                hoursFormat: 24
              }"
              :key="reInitKey"
              disable-past
            />
          </div>
        </div>

        <div class="section-divider" />

        <section class="photos-section">
          <div class="section-heading section-heading--row">
            <div>
              <h3 class="section-heading__title">
                {{ t("bookingContent.sections.photos") }}
              </h3>

              <p class="section-heading__subtitle">
                {{ draft.photos?.length || 0 }}
              </p>
            </div>

            <button
              class="action-button action-button--primary"
              type="button"
              @click="openFilePicker"
            >
              <span
                class="action-button__icon"
                aria-hidden="true"
              >
                +
              </span>

              {{ t("bookingContent.buttons.add_photos") }}
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

          <div
            class="dropzone"
            :class="{
              'dropzone--active': isDragOver
            }"
            @dragenter.prevent="onDragEnter"
            @dragover.prevent
            @dragleave="onDragLeave"
            @drop.prevent="onDrop"
          >
            <div
              class="dropzone__icon"
              aria-hidden="true"
            >
              ⇧
            </div>

            <div class="dropzone__content">
              <p class="dropzone__title">
                {{ t("bookingContent.dropzone.title") }}
              </p>

              <p class="dropzone__text">
                {{ t("bookingContent.dropzone.text") }}
              </p>
            </div>
          </div>
          <div
            v-if="draft.photos?.length"
            class="photos-grid"
          >
            <figure
              v-for="(photo, idx) in draft.photos"
              :key="photo.id || photo.slotId || idx"
              class="photo-card photo-card--editable"
            >
              <div class="photo-card__media">
                <img
                  class="photo-card__image"
                  :src="
                    photo.imageUrl ||
                    photo.previewUrl ||
                    photo.imageId?.imageUrl ||
                    photo.imageId?.previewUrl
                  "
                  :alt="
                    photo.alt ||
                    photo.text ||
                    t('bookingContent.alt.booking_photo')
                  "
                />

                <div class="photo-card__actions">
                  <button
                    class="photo-action"
                    type="button"
                    :aria-label="t('bookingContent.buttons.replace')"
                    :title="t('bookingContent.buttons.replace')"
                    @click="replacePhoto(idx)"
                  >
                    <span aria-hidden="true">↻</span>
                  </button>

                  <button
                    class="photo-action photo-action--danger"
                    type="button"
                    :aria-label="t('bookingContent.buttons.delete')"
                    :title="t('bookingContent.buttons.delete')"
                    @click="removeDraftPhoto(idx)"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
              </div>

              <figcaption class="photo-card__caption photo-card__caption--editable">
                <label
                  class="sr-only"
                  :for="`photo-caption-${idx}`"
                >
                  {{ t("bookingContent.labels.photo_caption") }}
                </label>

                <textarea
                  :id="`photo-caption-${idx}`"
                  v-model.trim="photo.text"
                  class="photo-card__textarea"
                  rows="3"
                  maxlength="200"
                  :placeholder="
                    t('bookingContent.placeholders.photo_caption')
                  "
                />

                <span class="photo-card__caption-counter">
                  {{ photo.text?.length || 0 }}/200
                </span>
              </figcaption>
            </figure>
          </div>

          <div
            v-else
            class="empty-state empty-state--compact"
          >
            <div
              class="empty-state__icon"
              aria-hidden="true"
            >
              ▧
            </div>

            <p class="empty-state__text">
              {{ t("bookingContent.empty.no_photos") }}
            </p>
          </div>

        </section>

        <footer class="form-actions">
          <button
            class="action-button action-button--secondary"
            type="button"
            @click="cancelEdits"
          >
            {{ t("bookingContent.buttons.cancel") }}
          </button>

          <button
            class="action-button action-button--success"
            type="submit"
            :disabled="!isDirty"
          >
            {{ t("bookingContent.buttons.save_changes") }}
          </button>
        </footer>
      </div>
    </form>
  </section>
</template>

<script setup>
import { MDBDateTimepicker, MDBIcon, MDBBtn } from 'mdb-vue-ui-kit';
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from 'vue-i18n';
import { useClientStore } from '@/stores/recipientStore';
import { useProfessionStore } from '@/stores/professionStore';
import uploadService from "@/service/awsUploads";
import {storeToRefs} from "pinia";



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
const { t, locale } = useI18n();
const isEditing = ref(false);
const draft = ref(null);
const fileInput = ref(null);
const showCustomFields = ref(false);
const replaceIndex = ref(null);
const replaceInput = ref(null);

const clientStore = useClientStore();
const professionStore = useProfessionStore();

const { professions } = storeToRefs(professionStore);

const removedPhotoIds = ref([]);

const isDragOver = ref(false);
let dragCounter = 0;

const loadingImages = ref({});

watch(
  () => props.booking?.photos,
  (photos) => {
    if (!photos) return;
    const newState = {};
    photos.forEach((_, idx) => {
      newState[idx] = true;
    })

    loadingImages.value = newState;
  },
  { immediate: true}
)

const localProfessionName = (code) => {
  const professionObj = professions.value.find(
    profession => profession.code === code
  );
  return getLocalizedValue(professionObj?.name) || code;
};

const getLocalizedValue = translations => {
  if (!translations) {
    return "";
  }

  return (
    translations[locale.value] ||
    translations.en ||
    translations.fi ||
    Object.values(translations).find(Boolean) ||
    ""
  );
};

// --- Helpers ---
function clonePhotos(photos) {
  return (photos || []).map((p) => ({ ...p }));
}

const displayCustomFields = computed(() => {
  if (!Array.isArray(props.booking?.customFields)) {
    return [];
  }

  return props.booking.customFields.filter(field => {
    const value = field.value;

    // Block textarea description
    if (field.type === 'textarea') return; 

    if (Array.isArray(value)) {
      return value.length > 0;
    }


    return value !== null &&
      value !== undefined &&
      value !== '';
  });
});

const getCustomFieldDisplayValue = field => {
  const value = field?.value;

  const selectedOptions = Array.isArray(field?.selectedOptions)
    ? field.selectedOptions
    : [];

  switch (field?.type) {
    case 'boolean':
    case 'checkbox':
      return value
        ? t('clientOffer.common.yes')
        : t('clientOffer.common.no');

    case 'select':
    case 'multiselect':
      if (selectedOptions.length) {
        return selectedOptions
          .map(option => getLocalizedValue(option.label))
          .filter(Boolean)
          .join(', ');
      }

      return Array.isArray(value)
        ? value.join(', ')
        : String(value ?? '');

    default:
      if (Array.isArray(value)) {
        return value.join(', ');
      }

      return String(value ?? '');
  }
};

const localeMap = {
  fi: "fi-FI",
  en: "en-GB",
  sv: "sv-SE",
  et: "et-EE",
  ru: "ru-RU"
};

function formatDateTime(iso) {
  if (!iso) return "—";

  const date = new Date(iso);

  return date.toLocaleString(
    localeMap[locale.value] || "fi-FI",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }
  );
}

function preventGlobalFileDrop(e) {
  // Only block if user is dragging files (not text)
  const hasFiles = Array.from(e.dataTransfer?.types || []).includes("Files");
  if (!hasFiles) return;

  e.preventDefault();
  e.stopPropagation();
}

/* function createDraftFromBookingx() {
  return {
    description: props.booking.description || "",
    date: props.booking.date || "",
    photos: clonePhotos(props.booking.photos),
  };
} */

const normalizeForCompare = (img) => ({
  id: img.imageId ?? img._id ?? img.id ?? img.key ?? null,
  url: img.imageUrl ?? img.url ?? img.path ?? img.location ?? null,
  // treat local uploads as "NEW"
  isNew: !!img.file || (!!img.previewUrl && !img.imageUrl),
});

const signature = (arr) =>
  (arr || [])
    .map(normalizeForCompare)
    .map(x => `${x.isNew ? "NEW" : x.id ?? ""}|${x.url ?? ""}`)
    .join("||");


// Dirty check (simple + practical)
const isDirty = computed(() => {
  if (!draft.value) return false;

  const sameDesc = (draft.value.description || "") === (props.booking.description || "");
  const sameDate = (draft.value.date || "") === (props.booking.date || "");

  const a = signature(draft.value.photos);
  const b = signature(props.booking.photos);

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

/* function setDateToSoonest() {
  // Example: set to today
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  if (draft.value) draft.value.date = `${yyyy}-${mm}-${dd}`;
} */

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
    await clientStore.updateClientMain(props.booking.id, payload);

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

</script>
<style scoped>
.booking-panel {
  --panel-bg: #1e2635;
  --surface: rgba(255, 255, 255, 0.045);
  --surface-hover: rgba(255, 255, 255, 0.065);
  --border: rgba(255, 255, 255, 0.1);
  --border-strong: rgba(255, 255, 255, 0.16);
  --text-primary: #f4f7fb;
  --text-secondary: #aeb8c8;
  --text-muted: #7f8a9c;
  --accent: #38bdf8;
  --accent-soft: rgba(56, 189, 248, 0.12);
  --success: #34d399;
  --danger: #fb7185;

  width: 100%;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 18px;
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.025),
      transparent 35%
    ),
    var(--panel-bg);
  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.2),
    0 1px 0 rgba(255, 255, 255, 0.04) inset;
  color: var(--text-primary);
}

.booking-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 24px;
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.018);
}

.booking-panel__heading {
  min-width: 0;
}

.booking-panel__eyebrow {
  display: block;
  margin-bottom: 5px;
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.booking-panel__title {
  margin: 0;
  color: var(--text-primary);
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.booking-panel__date {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 0.8rem;
  white-space: nowrap;
}

.booking-panel__date-icon {
  color: var(--accent);
  font-size: 1rem;
}

.booking-panel__body {
  padding: 24px;
  overflow-x: hidden;
  overflow-y: auto;
  text-align: left;
  scrollbar-width: thin;
  scrollbar-color:
    rgba(255, 255, 255, 0.18)
    transparent;
}

.booking-panel__body::-webkit-scrollbar {
  width: 6px;
}

.booking-panel__body::-webkit-scrollbar-track {
  background: transparent;
}

.booking-panel__body::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
}

.details-section,
.photos-section {
  min-width: 0;
}

.section-heading {
  margin-bottom: 14px;
}

.section-heading--row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.section-heading__title {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.4;
}

.section-heading__subtitle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  margin: 5px 0 0;
  padding: 0 7px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 700;
}

/* Booking custom fields */
.custom-fields-panel {
  margin-top: 6px;
  padding: 14px;
  border: 1px solid #3e4654;
  border-radius: 7px;
  background: #202633;
}

.custom-field-row {
  display: grid;
  grid-template-columns: minmax(130px, 40%) 1fr;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.custom-field-row:last-child {
  border-bottom: none;
}

.custom-field-label {
  color: #aeb7c5;
  font-weight: 600;
}

.custom-field-value {
  color: #f1f3f5;
  overflow-wrap: anywhere;
}

@media (max-width: 576px) {
  .custom-field-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

/* Booking info panel */
.direct-booking-info__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.direct-booking-info__eyebrow {
  display: block;
  margin-bottom: 0.2rem;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.58);
}
.direct-booking-info__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.35;
  color: #fff;
}

.direct-booking-info__header-icon {
  flex: 0 0 auto;
  font-size: 1.15rem;
  color: #7fcdb3;
}

.direct-booking-info__details {
  display: grid;
  gap: 0.8rem;
  margin: 0;
}

.direct-booking-info__row {
  display: grid;
  grid-template-columns: minmax(120px, 0.4fr) minmax(0, 1fr);
  gap: 1rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.direct-booking-info__row:first-child {
  padding-top: 0;
  border-top: 0;
}

.direct-booking-info__row dt {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.58);
}

.direct-booking-info__row dd {
  min-width: 0;
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
  color: rgba(255, 255, 255, 0.92);
}

.direct-booking-info__row--description {
  grid-template-columns: 1fr;
  gap: 0.35rem;
}

@media (max-width: 650px) {
  .order-card__actions--direct {
    grid-template-columns: 1fr;
  }

  .direct-booking-info__row {
    grid-template-columns: 1fr;
    gap: 0.3rem;
  }

  .direct-booking-controls .delete-link {
    margin-left: 0;
  }
}







.description-card {
  min-height: 76px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
}

.description-card__text,
.description-card__empty {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.65;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.description-card__text {
  color: var(--text-secondary);
}

.description-card__empty {
  color: var(--text-muted);
}

.booking-meta {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin: 14px 0 0;
}

.booking-meta__item {
  display: grid;
  gap: 5px;
  margin: 0;
  padding: 13px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
}

.booking-meta__label {
  color: var(--text-muted);
  font-size: 0.7rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.booking-meta__value {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.88rem;
  line-height: 1.45;
}

.section-divider {
  height: 1px;
  margin: 24px 0;
  background: var(--border);
}

.photos-grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
}

.photo-card {
  min-width: 0;
  margin: 0;
}

.photo-card__media {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #111827;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.photo-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    transform 0.3s ease,
    opacity 0.2s ease;
}

.photo-card:hover .photo-card__image {
  transform: scale(1.025);
}

.photo-card__caption {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 0;
  padding: 26px 12px 10px;
  background:
    linear-gradient(
      to top,
      rgba(6, 10, 18, 0.92),
      transparent
    );
  color: #f8fafc;
  font-size: 0.77rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.photo-card__caption {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.photo-loader {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.82);
}

.photo-loader__spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.18);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: photo-spin 0.75s linear infinite;
}

.photo-card__actions {
  position: absolute;
  top: 9px;
  right: 9px;
  display: flex;
  gap: 7px;
  opacity: 0;
  transform: translateY(-4px);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.photo-card--editable:hover .photo-card__actions,
.photo-card--editable:focus-within
  .photo-card__actions {
  opacity: 1;
  transform: translateY(0);
}

.photo-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(8px);
  color: #f8fafc;
  font-size: 1.05rem;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.photo-action:hover {
  border-color: var(--accent);
  background: rgba(14, 116, 144, 0.92);
  transform: translateY(-1px);
}

.photo-action--danger:hover {
  border-color: var(--danger);
  background: rgba(190, 24, 93, 0.92);
}

.photo-action:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.edit-form {
  display: grid;
  gap: 22px;
}

.form-field {
  display: grid;
  gap: 9px;
}

.form-field__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.form-field__label {
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 650;
}

.form-field__counter {
  color: var(--text-muted);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
}

.form-field__help {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.72rem;
  line-height: 1.45;
}

.form-control-custom {
  width: 100%;
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  outline: none;
  background: rgba(15, 23, 42, 0.55);
  color: var(--text-primary);
  font: inherit;
  font-size: 0.9rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.form-control-custom::placeholder {
  color: var(--text-muted);
}

.form-control-custom:focus {
  border-color: rgba(56, 189, 248, 0.75);
  background: rgba(15, 23, 42, 0.78);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.form-control-custom--textarea {
  min-height: 124px;
  padding: 12px 14px;
  line-height: 1.55;
  resize: vertical;
}

.date-picker-wrap {
  overflow: hidden;
  border-radius: 12px;
}

.dropzone {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 112px;
  margin-bottom: 16px;
  padding: 18px;
  border: 1px dashed rgba(148, 163, 184, 0.38);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  text-align: left;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.dropzone:hover {
  border-color: rgba(56, 189, 248, 0.55);
  background: rgba(56, 189, 248, 0.04);
}

.dropzone--active {
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.08);
  transform: scale(1.005);
}

.dropzone__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 12px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 1.35rem;
  font-weight: 700;
}

.dropzone__content {
  min-width: 0;
}

.dropzone__title {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.86rem;
  font-weight: 700;
}

.dropzone__text {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 0.76rem;
  line-height: 1.45;
}

.empty-state {
  display: flex;
  min-height: 130px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  border: 1px dashed var(--border-strong);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.018);
  text-align: center;
}

.empty-state--compact {
  min-height: 100px;
}

.empty-state__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--surface);
  color: var(--text-muted);
  font-size: 1.15rem;
}

.empty-state__text {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.82rem;
  line-height: 1.5;
}

.action-button {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.action-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.action-button__icon {
  font-size: 1.05rem;
  line-height: 1;
}

.action-button--primary {
  border-color: rgba(56, 189, 248, 0.28);
  background: var(--accent-soft);
  color: #7dd3fc;
}

.action-button--primary:hover:not(:disabled) {
  border-color: rgba(56, 189, 248, 0.5);
  background: rgba(56, 189, 248, 0.18);
}

.action-button--secondary {
  border-color: var(--border-strong);
  background: transparent;
  color: var(--text-secondary);
}

.action-button--secondary:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.26);
  background: var(--surface);
  color: var(--text-primary);
}

.action-button--success {
  border-color: rgba(52, 211, 153, 0.28);
  background: rgba(52, 211, 153, 0.14);
  color: #6ee7b7;
}

.action-button--success:hover:not(:disabled) {
  border-color: rgba(52, 211, 153, 0.5);
  background: rgba(52, 211, 153, 0.21);
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes photo-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (hover: none) {
  .photo-card__actions {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 720px) {
  .booking-panel {
    border-radius: 14px;
  }

  .booking-panel__header {
    align-items: flex-start;
    padding: 18px;
  }

  .booking-panel__date {
    display: none;
  }

  .booking-panel__body {
    padding: 18px;
  }

  .photos-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .section-heading--row {
    align-items: flex-start;
  }

  .dropzone {
    justify-content: flex-start;
    min-height: 96px;
  }
}

@media (max-width: 460px) {
  .booking-panel__header,
  .booking-panel__body {
    padding-right: 14px;
    padding-left: 14px;
  }

  .photos-grid {
    grid-template-columns: 1fr;
  }

  .section-heading--row {
    flex-wrap: wrap;
  }

  .section-heading--row .action-button {
    width: 100%;
  }

  .form-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .form-actions .action-button {
    width: 100%;
  }

  .dropzone {
    flex-direction: column;
    text-align: center;
  }
}
</style>