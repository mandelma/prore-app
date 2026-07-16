<template>
    <div v-if="!isAddPhotos">
        <div>
            <MDBBtn v-if="!isAddPhotos && !addedPhotos.length" color="light" @click="isAddPhotos = true">{{ t('picturesUp.add_optional_photos') }}</MDBBtn>
            <MDBBtn v-else color="light" @click="isAddPhotos = true">{{ t('picturesUp.edit_photos') }}</MDBBtn>
        </div>

        <div v-if="addedPhotos?.length" class="photos-grid">
            
            <figure
            v-for="(photo, idx) in addedPhotos"
            :key="photo.id || idx"
            class="photo-card"
            >
            <img class="photo-img" :src="photo.imageUrl || photo.previewUrl" :alt="photo.alt || t('picturesUp.photo_alt')" />
            <div v-if="photo?.text?.trim()" class="photo-overlay">

                <p>{{ photo.text }}</p>
            </div>
            </figure>
            
        </div>

        <div v-else class="empty-state">
            
            <p v-if="!addedPhotos.length" class="empty-state__text">{{ t('picturesUp.empty_hint') }}</p>
        </div>


    </div>

    <!-- Booking pictures section -->
    <form v-else class="panel__body" @submit.prevent="saveBookingPhotos">
        <div class="form-card">
            
            <div class="divider"></div>

            <div class="photos">
            <div class="photos__header">
                <h5 class="section-title">{{ t('picturesUp.photos_title') }}</h5>
                <MDBBtn color="primary" @click="openFilePicker">{{ t('picturesUp.add_photos') }}</MDBBtn>
                
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
                <p class="dropzone__title">{{ t('picturesUp.dropzone_title') }}</p>
                <p class="dropzone__text">{{ t('picturesUp.dropzone_text') }}</p>
            </div>

            <div v-if="draftPhotos?.length" class="photos-grid">
                <figure
                v-for="(photo, idx) in draftPhotos"
                :key="photo.id || idx"
                class="photo-card"
                >
                    <div class="photo-media">
                    <img class="photo-img" :src="photo.imageUrl || photo.previewUrl" :alt="photo.alt || t('picturesUp.photo_alt')" />
                    <textarea
                    v-model="photo.text"
                    class="photo-caption"
                    :placeholder="t('picturesUp.description_placeholder')"
                    ></textarea>
                    <!-- <div class="photo-overlay">
                    <textarea v-model="photo.text" :placeholder="t('picturesUp.description_placeholder')" />
                    </div> -->
                </div>
                <figcaption class="photo-actions">
                    
                    <i class="fas fa-trash-alt fa-lg" style="color: red;" @click="removeDraftPhoto(idx)"></i>
                    
                </figcaption>
                </figure>
            </div>
            </div>

            <div class="actions">
            <button class="btn btn-danger" type="button" @click="cancelAddPhotos">
                {{ t('picturesUp.cancel') }}
            </button>

            <button class="btn btn-success" type="submit" :disabled="!isDirty">
                {{ t('picturesUp.save_photos') }}
            </button>
            </div>

        </div>
    </form>
</template>
<script setup>
import { MDBBtn } from 'mdb-vue-ui-kit';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const isAddPhotos = ref(false);
const addedPhotos = ref([]);
const draftPhotos = ref([]);

const removedPhotoIds = ref([]);
const fileInput = ref(null);
//const replaceInput = ref(null);
const isDragOver = ref(false);
let dragCounter = 0;



</script>