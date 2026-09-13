<template>
  <MDBToast
    v-model="model"
    :autohide="true"
    :delay="toastDelay"
    :stacking="false"
    position="top-center"
    
    :icon="props.iconState"
    :class="`my-toast--${props.toastName}`"
  >
    <template #title>DuunHub</template>
    {{ props.text }}
  </MDBToast>
</template>
<!-- :class="`my-toast--${props.toastName}`" -->
<script setup>
import { MDBToast } from 'mdb-vue-ui-kit';
import { computed } from 'vue'

defineOptions({ name: 'HandleToast' })

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  toastName: { type: String, default: '' },
  iconState: { type: String, default: '' },
  text: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const toastDelay = computed(() => {
  switch (props.toastName) {
    case "warning":
      return 5000;

    case "danger":
    case "error":
      return 6000;

    case "info":
      return 4000;

    case "success":
    default:
      return 3500;
  }
});

</script>
<style>

</style>