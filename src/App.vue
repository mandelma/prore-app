<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
  <MDBDateTimepicker label="Select a time" v-model="picker"/>
  <MDBBtn color="danger" block>Painaa</MDBBtn>

  <router-view />

</template>

<script setup>
import { MDBBtn, MDBDateTimepicker } from 'mdb-vue-ui-kit';
import { ref } from "vue";

const picker = ref("");

</script>

<style scoped></style>
