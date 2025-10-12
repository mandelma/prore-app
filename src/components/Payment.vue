<template>
  <MDBContainer>

    <h2>Maksaa {{amount}} euroa</h2>
    <MDBBtn color="dark" style="width: 200px;" size="lg" @click="payCredit">
      <img
          style="width: 50px;"
          :src="mastercard"
          alt="payment"
      />

    </MDBBtn>

    <!--    Payment credit left  {{creditLeft}}-->

  </MDBContainer>
</template>

<script setup>
import {MDBContainer, MDBBtn} from 'mdb-vue-ui-kit';
import { ref } from 'vue';
import mastercard from '../assets/mastercard.png';
import { useRouter } from 'vue-router';
defineOptions ({
  name: 'payment'
});
const props = defineProps ({
  amount: {type: Number}
})
const emit = defineEmits(['pay', 'quit-payment']);

const router = useRouter();
const card = mastercard;

const payCredit = () => {
  emit('pay', props.amount);
  router.go(-1);
};
const quitPayment = () => {
  emit('quit-payment');
}

</script>

<style scoped>

</style>