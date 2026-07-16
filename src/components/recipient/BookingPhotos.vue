<!-- <template>
  
  <div v-if="photos?.length" class="photos-grid">
    <figure
      v-for="(photo, idx) in photos"
      :key="photo.slotId || photo.id || idx"
      class="photo-card"
    >
      <img
        class="photo-img"
        :src="photo?.imageUrl || photo?.imageId?.imageUrl || photo?.previewUrl"
        :alt="photo.alt || 'Booking photo'"
      />

      <textarea
        v-if="editable"
        v-model="photo.text"
        class="photo-caption"
        placeholder="Lisää kuvaus..."
      />

      <div v-else-if="photo?.text?.trim()" class="photo-overlay">
        <p>{{ photo.text }}</p>
      </div>

      <figcaption v-if="editable" class="photo-actions">
        <i
          class="fas fa-trash-alt fa-lg"
          style="color: red"
          @click="$emit('remove', idx)"
        ></i>
      </figcaption>
    </figure>
  </div>
</template> -->
<template>
  <div v-if="photos?.length" class="photos-grid">
    <figure
      v-for="(photo, idx) in photos"
      :key="photo.slotId || photo.id || idx"
      class="photo-card"
    >
      <img
        class="photo-img"
        :src="
          photo?.imageUrl ||
          photo?.imageId?.imageUrl ||
          photo?.previewUrl
        "
        :alt="photo.alt || t('bookingPhotos.photo_alt')"
      />

      <textarea
        v-if="editable"
        v-model="photo.text"
        class="photo-caption"
        :placeholder="t('bookingPhotos.description_placeholder')"
      />

      <div
        v-else-if="photo?.text?.trim()"
        class="photo-overlay"
      >
        <p>{{ photo.text }}</p>
      </div>

      <figcaption
        v-if="editable"
        class="photo-actions"
      >
        <button
          type="button"
          class="remove-photo-btn"
          :aria-label="t('bookingPhotos.remove_photo')"
          :title="t('bookingPhotos.remove_photo')"
          @click="$emit('remove', idx)"
        >
          <i
            class="fas fa-trash-alt fa-lg"
            aria-hidden="true"
          ></i>
        </button>
      </figcaption>
    </figure>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps({
  photos: {
    type: Array,
    default: () => [],
  },
  
  editable: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["remove"]);
</script>
<style scoped>
.remove-photo-btn {
  border: 0;
  padding: 6px;
  background: transparent;
  color: #dc2626;
  cursor: pointer;
  border-radius: 6px;
}

.remove-photo-btn:hover {
  background: rgba(220, 38, 38, 0.12);
}

.remove-photo-btn:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
</style>