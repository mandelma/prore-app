<template>
  <MDBToast
    v-model="model"
    autohide
    :delay="3000"
    :stacking="false"
    position="top-center"
    :color="props.toastName"
    :icon="props.iconState"
  >
    <template #title>PROKEIKKATORI</template>
    {{ props.text }}
  </MDBToast>
</template>

<script setup>
import { MDBToast } from 'mdb-vue-ui-kit';
import { computed } from 'vue'

defineOptions({ name: 'HandleToast' })

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  toastName: { type: String, default: '' },  // e.g. 'success' | 'danger'
  iconState: { type: String, default: '' },   // optional, depends on MDB version
  text: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
</script>