<template>
  <MDBContainer>
    <div v-if="route.name === 'pro-photos'" style="display: flex; justify-content: right; padding: 7px 0 11px 0">
      <MDBBtnClose white @click="router.go(-1)" />
    </div>
    <div class="photos__header">
      <h6 class="section-title">Referenssit</h6>
      <div style="display: flex; gap: 5px;">
        <MDBBtn color="primary" @click="openFilePicker"><MDBIcon icon="plus" class="me-1" /> Lisää</MDBBtn>
        <MDBBtn v-if="reference?.length" color="success" @click="handleEditBtn" >Muokkaa</MDBBtn>
      </div>
      
      <input
        ref="fileInput"
        class="sr-only"
        type="file"
        accept="image/*"
        multiple
        @change="onFilesSelected"
      />
    </div>

    <!-- SUMMARY (read mode) -->
    <div v-if="!isEditing" class="panel__body">
      
      <div class="photos">
        

        <div v-if="reference?.length" >
          <!-- <figure
            v-for="(photo, idx) in images"
            :key="photo.id || idx"
            class="photo-card"
          > -->
            <!-- <img class="photo-img" :src="photo.imageUrl || photo.previewUrl" :alt="photo.alt || 'Reference photo'" /> -->

            <MDBLightbox> 
              <MDBRow class="g-2 mx-0">
                  <MDBCol
                      lg="4"
                      md="4"
                      sm="6"
                      xs="6"
                      v-for="(image, idx) in reference"
                      :key="idx"
                      class="px-1"
                  >
                      <div class="lightbox-thumb">
                        <MDBLightboxItem
                            :src="image.imageUrl || image.previewUrl"
                            :fullScreenSrc="image.imageUrl || image.previewUrl"
                            alt="Pro reference"
                        />
                      </div>
                  </MDBCol>
              </MDBRow>
            </MDBLightbox>

          <!-- </figure> -->
        </div>

        <div v-else class="empty-state">
          <p class="text-muted small no-images">Ei vielä kuvia</p>
          <p class="empty-state__text">Lisää kuvia palvelustasi  asiakkaille näkyviksi.</p>
        </div>
      </div>
    </div>

    <!-- Editing mode -->
    <form v-else @submit.prevent="savePhotos">
      
      
      <div>
        <div class="photos">
          <div class="photos__header">
            <!-- <h5 class="section-title">Kuvat</h5>
            <button class="btn btn--primary btn--sm" type="button" @click="openFilePicker">
              Lisää kuvia
            </button> -->
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

          <div v-if="draft.reference?.length" class="photos-grid">
            <figure
              v-for="(image, idx) in draft.reference"
              :key="image.id || idx"
              class="photo-card"
            >
              <img class="photo-img" :src="image.imageUrl || image.previewUrl" :alt="image.alt || 'Reference photo'" />
              <figcaption class="photo-actions">
                
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
          <MDBBtn color="danger"  @click="cancelEdits">Peruuta</MDBBtn>
          
          <MDBBtn color="primary" type="submit" :disabled="!isDirty">Tallenna muutokset</MDBBtn>
          
        </div>
        
      </div>
    </form>
  </MDBContainer>
  
    
    
</template>
<script setup>
  import {MDBContainer, MDBCard, MDBCardBody, MDBIcon, MDBRow, MDBCol, MDBBtn, MDBLightbox, MDBLightboxItem, MDBBtnClose} from 'mdb-vue-ui-kit';
  import { ref, watch, computed, nextTick, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import { useProStore } from '@/stores/providerStore';
  import uploadService from '../../service/awsUploads';
  const props = defineProps({
      images: {type: Array, default: () => []}
  })

  
  
  const proStore = useProStore();

  const { referenceNavImages, reference } = storeToRefs(proStore);
  const router = useRouter();
  const route = useRoute();
  const isEditing = ref(false);
  const draft = ref(null);
  const fileInput = ref(null);
  const isDragOver = ref(false);
  let dragCounter = 0;
  const replaceIndex = ref(null);
  const replaceInput = ref(null);
  
  const removedPhotoIds = ref([]);
  //const images = computed(() => proStore.reference)

  // When entering edit mode, create draft
  watch(isEditing, (val) => {
   draft.value = val ? createDraftFromPhotos() : null;
  });

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


  const isDirty = computed(() => {
    if (!draft.value) return false;

    const a = signature(draft.value.reference);
    const b = signature(props.images);

    return a !== b;
  })

  const handleEditBtn = () => {
    if (!isEditing.value) isEditing.value = true;
  }

  const normalizeServerPhotoFormat = (p) => {
  return {
      imageId: p.imageId ?? p.id ?? p._id ?? p.key ?? null,
      imageUrl: p.imageUrl ?? p.url ?? p.path ?? p.location ?? null,
      previewUrl: null,
      file: null,
      slotId: crypto.randomUUID(),
    };
  }

  const createDraftFromPhotos = () => {
    return {
      reference: (reference.value || []).map(normalizeServerPhotoFormat),
    };
  }

  /* Editing photos */
  const replacePhoto = async (idx) => {
    if (!isEditing.value) {
      isEditing.value = true;
      await nextTick();
    }
    replaceIndex.value = idx;
    replaceInput.value?.click()
    
  }

  const onReplaceSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file || !draft.value || replaceIndex.value == null) return;

    const idx = replaceIndex.value;
    const old = draft.value.reference[idx];

    // 1) if old photo exists on server, mark it for deletion
    if (old?.imageId) {
      removedPhotoIds.value.push(old.imageId);
    }

    // 2) cleanup old preview url if existed
    if (old?.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(old.previewUrl);
    }

    // 3) replace the slot with a new pending upload item
    draft.value.reference[idx] = {
      imageId: null,
      imageUrl: null,
      previewUrl: URL.createObjectURL(file),
      file,
      slotId: old?.slotId || crypto.randomUUID(), // keep slotId so mapping is stable
    };

    e.target.value = "";
    replaceIndex.value = null;
  }

  const openFilePicker = () => {
    fileInput.value?.click();
    console.log("Clicked")
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


  function addFiles(files) {
  if (!draft.value) return;
  draft.value.reference ||= [];

  for (const file of files) {
    draft.value.reference.push({
      imageId: null,
      imageUrl: null,
      previewUrl: URL.createObjectURL(file),
      file,
      slotId: crypto.randomUUID()
    });
  }
}

const cancelEdits = () => {
  isEditing.value = false;
}

const normalizeUploadResponseItem = (u) => {
  return {
    imageId: u.id ?? u._id ?? u.key ?? null,
    imageUrl: u.imageUrl ?? u.location ?? u.path ?? null,
  };
}

const applyUploadsToDraft = (pending = [], uploadedRaw = []) => {
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

const uploadDraftPhotos = async () => {
  const pending = (draft.value?.reference || []).filter(p => p.file);

  if (!pending.length) {
    return { pending: [], uploaded: [] }; // ✅ consistent
  }

  const fd = new FormData();
  pending.forEach(p => fd.append("files", p.file));

  const res = await uploadService.uploadProImage(fd);

  // your server returns { files: [...] }
  const uploaded = res?.files ?? [];      // ✅ never undefined
  return { pending, uploaded };
}

const buildPayload = () => {
  return {
    reference: (draft.value.reference || [])
      .map(p => p.imageId)
      .filter(Boolean),
    removedPhotoIds: removedPhotoIds.value.filter(Boolean),
  };
}

const removeDraftPhoto = (idx) => {
  if (!isEditing.value) isEditing.value = true;
  
  if (!draft.value?.reference?.length) return;
  
  const photo = draft.value.reference[idx];

  // If it exists in DB (uploaded already), mark for deletion
  if (photo?.imageId) {
    removedPhotoIds.value.push(photo.imageId);
  }

  // If it was just a local preview, cleanup blob url
  if (photo?.previewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(photo.previewUrl);
  }

  draft.value.reference.splice(idx, 1);
}

const savePhotos = async () => {
  if (!draft.value) return;

  try {
    const { pending, uploaded } = await uploadDraftPhotos();

    if (pending.length) {
      applyUploadsToDraft(pending, uploaded);
    }

    const payload = buildPayload(); // should allow photos: []
    console.log("Reference payload - ", payload)
    //await clientStore.updateMain(props.booking.id, payload);
    const refUploaded = await proStore.updateReference(payload);

    console.log("Ref uploaded ", refUploaded);

    const _provider = proStore?.provider;
    if (_provider) {
      _provider.reference = draft.value.reference.map(dvr => ({id: dvr.imageId, imageUrl: dvr.imageUrl}))
    }

    removedPhotoIds.value = [];
    isEditing.value = false;
  } catch (err) {
    console.error("Save failed:", err?.response?.data || err);
  }
}

</script>
<style scoped>
/* Photos */
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
  /* display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  background: #fff; */
  display: flex; 
  gap: 8px;
  padding: 8px;
  background: #dbdddf;
}

.icon-btn {
  flex: 1;
  min-width: 40%;
  border: 1px solid rgba(0,0,0,.12);
  background: #fff;
  border-radius: 10px;
  padding: 3px 5px;
  cursor: pointer;
  
  line-height: 1;
}

.icon-btn--danger {
  flex: 1;
  border-color: rgba(220, 38, 38, .35);
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

.lightbox-thumb{
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;     /* 👈 perfect square */
  overflow: hidden;
  border-radius: 8px;
}
.lightbox-thumb img{
  width: 100%;
  height: 100%;
  object-fit: cover;      /* 👈 crop like your photo-grid */
  display: block;
}


@media (max-width: 600px){
  .photos-grid{ grid-template-columns: 1fr; }
}
.no-images {
  text-align: center;
}

.empty-state__text {
  margin: 6px 0 0;
  font-size: 12px;
  opacity: 0.7;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 13px;
}

</style>