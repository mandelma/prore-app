<template>
  
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
</template>

<script setup>

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