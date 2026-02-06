<template>
    <div v-if="images.length">
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
              v-for="(image, idx) in images"
              :key="image.id || idx"
              class="photo-card"
            >
              <img class="photo-img" :src="image.imageUrl || image.previewUrl" :alt="image.alt || 'Booking photo'" />
              <figcaption class="photo-actions">
                <button class="icon-btn" type="button" @click="viewPhoto(image)" aria-label="View">
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
        <!-- <MDBLightbox> 
            <MDBRow class="g-2 mx-0">
                <MDBCol
                    lg="4"
                    md="4"
                    sm="6"
                    xs="6"
                    v-for="(image, idx) in images"
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
        </MDBLightbox> -->
    </div>
    <div>
        <p class="text-muted small">Ei vielä kuvia</p>
    </div>
    
</template>
<script setup>
    import {MDBLightbox, MDBRow, MDBCol, MDBBtn} from 'mdb-vue-ui-kit';
    const props = defineProps({
        images: {type: Array}
    })
</script>
<style scoped>
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
</style>