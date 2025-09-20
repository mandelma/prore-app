<template>
  <div class="flex flex-wrap gap-3 items-center">
    <div v-for="(t, key) in types" :key="key" class="flex items-center gap-2 text-sm">
      <span class="inline-block h-3 w-3 rounded-full" :style="{ background: t.color }"></span>
      <span>{{ t.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
const props = defineProps({
  types: { type: Object, required: true }
})
</script>

<style scoped>

</style>