<template>
  <div
    v-if="photos?.length"
    class="photos-grid"
  >
    <figure
      v-for="(photo, idx) in photos"
      :key="photo.slotId || photo.id || idx"
      class="photo-card"
    >
      <div class="photo-card__media">
        <img
          class="photo-img"
          :src="
            photo?.imageUrl ||
            photo?.imageId?.imageUrl ||
            photo?.previewUrl
          "
          :alt="
            photo.alt ||
            t('bookingPhotos.photo_alt')
          "
        />

        <div
          v-if="!editable && photo?.text?.trim()"
          class="photo-overlay"
        >
          <p>{{ photo.text }}</p>
        </div>

        <button
          v-if="editable"
          type="button"
          class="remove-photo-btn"
          :aria-label="
            t('bookingPhotos.remove_photo')
          "
          :title="
            t('bookingPhotos.remove_photo')
          "
          @click="$emit('remove', idx)"
        >
          <i
            class="fas fa-trash-alt"
            aria-hidden="true"
          />
        </button>
      </div>

      <figcaption
        v-if="editable"
        class="photo-actions"
      >
        <label
          :for="`photo-caption-${idx}`"
          class="photo-caption-label"
        >
          {{
            t(
              "bookingPhotos.description_label"
            )
          }}
        </label>

        <textarea
          :id="`photo-caption-${idx}`"
          v-model.trim="photo.text"
          class="photo-caption"
          rows="3"
          maxlength="300"
          :placeholder="
            t(
              'bookingPhotos.description_placeholder'
            )
          "
        />

        <span class="photo-caption-counter">
          {{ photo.text?.length || 0 }} / 300
        </span>
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
.photos-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 18px;
  width: 100%;
  margin-top: 18px;
}

.photo-card {
  min-width: 0;
  margin: 0;
  overflow: hidden;

  border: 1px solid
    rgba(139, 197, 202, 0.24);
  border-radius: 13px;

  background:
    linear-gradient(
      145deg,
      rgba(31, 44, 59, 0.98),
      rgba(22, 33, 46, 0.98)
    );

  box-shadow:
    0 10px 24px
      rgba(0, 0, 0, 0.16),
    inset 0 1px 0
      rgba(255, 255, 255, 0.03);

  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.photo-card:hover {
  border-color:
    rgba(139, 197, 202, 0.46);

  transform: translateY(-2px);

  box-shadow:
    0 14px 30px
      rgba(0, 0, 0, 0.22),
    inset 0 1px 0
      rgba(255, 255, 255, 0.04);
}

/* Pildi ala */

.photo-card__media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;

  background: #111b28;
}

.photo-img {
  display: block;
  width: 100%;
  height: 100%;

  object-fit: cover;
  object-position: center;

  transition:
    transform 0.3s ease,
    filter 0.3s ease;
}

.photo-card:hover .photo-img {
  transform: scale(1.025);
}

/* Kirjelduse overlay vaaterežiimis */

.photo-overlay {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;

  max-height: 55%;
  padding: 34px 14px 13px;

  box-sizing: border-box;
  overflow-y: auto;

  color: #eef3f5;

  background:
    linear-gradient(
      to top,
      rgba(10, 17, 26, 0.96),
      rgba(10, 17, 26, 0.78),
      transparent
    );
}

.photo-overlay p {
  margin: 0;

  color: #eef3f5;
  font-size: 13px;
  line-height: 1.5;

  overflow-wrap: anywhere;
  white-space: pre-line;
}

/* Kustutamisnupp */

.remove-photo-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 3;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 36px;
  height: 36px;
  padding: 0;

  border:
    1px solid
    rgba(255, 143, 156, 0.45);
  border-radius: 9px;

  color: #ff9aa7;
  background: rgba(15, 22, 31, 0.86);

  box-shadow:
    0 5px 14px
      rgba(0, 0, 0, 0.26);

  cursor: pointer;

  backdrop-filter: blur(6px);

  transition:
    color 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.remove-photo-btn:hover {
  color: #ffffff;
  border-color: #ff7687;
  background: rgba(194, 54, 72, 0.92);
  transform: scale(1.06);
}

.remove-photo-btn:active {
  transform: scale(0.96);
}

.remove-photo-btn:focus-visible {
  outline: 2px solid #ff8d9a;
  outline-offset: 3px;
}

.remove-photo-btn i {
  font-size: 14px;
  pointer-events: none;
}

/* Muutmise ala */

.photo-actions {
  position: relative;
  display: block;

  padding: 14px;

  border-top:
    1px solid
    rgba(255, 255, 255, 0.07);

  background:
    rgba(24, 35, 50, 0.72);
}

.photo-caption-label {
  display: block;
  margin-bottom: 7px;

  color: #dde6ea;
  font-size: 12px;
  font-weight: 600;
}

.photo-caption {
  display: block;
  width: 100%;
  min-height: 82px;
  padding: 11px 12px 25px;

  box-sizing: border-box;

  border: 1px solid #39495d;
  border-radius: 9px;

  color: #eef3f5;
  background: #182332;

  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;

  outline: none;
  resize: vertical;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.photo-caption::placeholder {
  color:
    rgba(218, 226, 232, 0.38);
}

.photo-caption:hover {
  border-color:
    rgba(139, 197, 202, 0.56);
}

.photo-caption:focus {
  border-color: #72aeb2;

  box-shadow:
    0 0 0 3px
      rgba(95, 158, 160, 0.14);
}

.photo-caption-counter {
  position: absolute;
  right: 24px;
  bottom: 21px;

  color:
    rgba(214, 224, 230, 0.45);
  font-size: 10px;

  pointer-events: none;
}

/* Üks pilt ei muutu liiga laiaks */

.photos-grid:has(
  .photo-card:only-child
) {
  grid-template-columns:
    minmax(0, 540px);
}

/* Tahvel */

@media (max-width: 800px) {
  .photos-grid {
    gap: 15px;
  }

  .photo-card__media {
    aspect-ratio: 4 / 3;
  }
}

/* Telefon */

@media (max-width: 620px) {
  .photos-grid {
    grid-template-columns: 1fr;
  }

  .photos-grid:has(
    .photo-card:only-child
  ) {
    grid-template-columns: 1fr;
  }

  .photo-card__media {
    aspect-ratio: 16 / 10;
  }

  .photo-actions {
    padding: 12px;
  }

  .photo-caption-counter {
    right: 22px;
    bottom: 19px;
  }
}
</style>