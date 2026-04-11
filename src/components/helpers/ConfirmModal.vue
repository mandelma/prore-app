<template>
  <teleport to="body">
    <div
      v-if="modelValue"
      class="confirm-overlay"
      @click="handleOverlayClick"
    >
      <div
        class="confirm-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
        @click.stop
      >
        <div class="confirm-icon" v-if="showIcon">
          !
        </div>

        <h2 class="confirm-title" :id="titleId">
          {{ title }}
        </h2>

        <p class="confirm-message" :id="descriptionId">
          {{ message }}
        </p>

        <div class="confirm-actions">
          <button
            type="button"
            class="btn btn-cancel"
            @click="onCancel"
          >
            {{ cancelText }}
          </button>

          <button
            type="button"
            class="btn btn-confirm"
            :class="{ danger }"
            @click="onConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirm action',
  },
  message: {
    type: String,
    default: 'Are you sure you want to continue?',
  },
  confirmText: {
    type: String,
    default: 'Confirm',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  closeOnOverlay: {
    type: Boolean,
    default: true,
  },
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
  danger: {
    type: Boolean,
    default: false,
  },
  showIcon: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const titleId = computed(() => `confirm-title-${Math.random().toString(36).slice(2, 9)}`)
const descriptionId = computed(() => `confirm-desc-${Math.random().toString(36).slice(2, 9)}`)

function close() {
  emit('update:modelValue', false)
}

function onConfirm() {
  emit('confirm')
  close()
}

function onCancel() {
  emit('cancel')
  close()
}

function handleOverlayClick() {
  if (props.closeOnOverlay) {
    onCancel()
  }
}

function handleKeydown(event) {
  if (props.modelValue && props.closeOnEsc && event.key === 'Escape') {
    onCancel()
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
)

window.addEventListener('keydown', handleKeydown)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 9999;
}

.confirm-modal {
  width: 100%;
  max-width: 420px;
  background: #cac3c3;
  border-radius: 18px;
  padding: 24px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.18),
    0 2px 10px rgba(0, 0, 0, 0.08);
  animation: modal-pop 0.18s ease-out;
  text-align: center;
}

.confirm-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto 14px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 24px;
  background: #fef3c7;
  color: #b45309;
}

.confirm-title {
  margin: 0 0 10px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.confirm-message {
  margin: 0 0 22px;
  color: #4b5563;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  border: 0;
  border-radius: 12px;
  padding: 11px 16px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease, background 0.15s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-cancel {
  background: #e5e7eb;
  color: #111827;
}

.btn-cancel:hover {
  background: #d1d5db;
}

.btn-confirm {
  background: #2563eb;
  color: #ffffff;
}

.btn-confirm:hover {
  background: #1d4ed8;
}

.btn-confirm.danger {
  background: #dc2626;
}

.btn-confirm.danger:hover {
  background: #b91c1c;
}

@keyframes modal-pop {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(6px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>