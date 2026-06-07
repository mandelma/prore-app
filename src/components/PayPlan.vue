<template>
  <MDBContainer style="padding-top: 70px; padding-bottom: 20px; text-align: center;">
    <p style="text-align: right; color: forestgreen; padding-bottom: 50px;" @click="$router.go(-1)">Poistu</p>
    <payment
        v-if="isPaymentSelected"
        :amount = amount
        :creditLeft = creditLeft
        @pay = handlePayment
        @quit-payment = handleQuitPayment
    />
    <MDBRow v-else>
      <MDBCol lg="3" md="6" class="plan-panel">
        <MDBCard class="plan">
          <MDBCardHeader>Päivä</MDBCardHeader>
          <MDBCardBody>
            <MDBCardTitle>1 päivää</MDBCardTitle>
            <MDBCardText>

            </MDBCardText>
            <MDBBtn outline="info" size="lg" @click="selectPayment(1, 1)">7 Euroa</MDBBtn>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
      <MDBCol lg="3" md="6" class="plan-panel">
        <MDBCard class="plan">
          <MDBCardHeader>Viikko</MDBCardHeader>
          <MDBCardBody>
            <MDBCardTitle>7 päivää</MDBCardTitle>
            <MDBCardText>

            </MDBCardText>
            <MDBBtn outline="info" size="lg" @click="selectPayment(14, 7)">14 Euroa</MDBBtn>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
      <MDBCol lg="3" md="6" class="plan-panel">
        <MDBCard class="plan">
          <MDBCardHeader>Kuukausi</MDBCardHeader>
          <MDBCardBody>
            <MDBCardTitle>1 kuukausi</MDBCardTitle>
            <MDBCardText>

            </MDBCardText>
            <!--            <MDBBtn tag="a" href="#!" color="primary">Go somewhere</MDBBtn>-->
            <MDBBtn outline="info" size="lg"  @click="selectPayment(30, 30)">30 Euroa</MDBBtn>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
      <MDBCol lg="3" md="6" class="plan-panel">
        <MDBCard class="plan">
          <MDBCardHeader>6 kuukautta</MDBCardHeader>
          <MDBCardBody>
            <MDBCardTitle>6 kk</MDBCardTitle>
            <MDBCardText>

            </MDBCardText>
            <!--            <MDBBtn tag="a" href="#!" color="primary">Go somewhere</MDBBtn>-->
            <MDBBtn outline="info" size="lg" @click="selectPayment(100, 183)">100 Euroa</MDBBtn>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
      <MDBCol lg="3" md="6">
        <MDBCard class="plan">
          <MDBCardHeader>Vuosi</MDBCardHeader>
          <MDBCardBody>
            <MDBCardTitle>12 kk</MDBCardTitle>
            <MDBCardText>

            </MDBCardText>
            <!--            <MDBBtn tag="a" href="#!" color="primary">Go somewhere</MDBBtn>-->
            <MDBBtn outline="info" size="lg" @click="selectPayment(120, 366)">120 Euroa</MDBBtn>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
    </MDBRow>


  </MDBContainer>


</template>

<script setup>
import {MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardHeader, MDBCardBody, MDBCardTitle, MDBCardText, MDBBtn} from 'mdb-vue-ui-kit';
import { ref } from 'vue';
import Payment from './Payment.vue';
import {useProStore} from "@/stores/providerStore.js";

defineOptions ({
  name: 'pay-plan'
})

const props = defineProps({
  credit: {type: Number}
})
const proStore = useProStore();

const emit = defineEmits(['updateCredit'])

const DAY_MS = 86400000;

const amount = ref(0);
const paid = ref(0);
const days = ref(0);
const isPaymentSelected = ref(false);
//const daysAfterUpdate = ref(0);

const selectPayment = (creditAmount, dayAmount) => {
  amount.value = creditAmount;
  days.value = dayAmount;
  isPaymentSelected.value = true;
}
const handlePayment = async () => {

  const daysToAdd = Number(days.value);
  const newCreditMs = daysToAdd * DAY_MS;
  
  // Existing expiry timestamp in milliseconds (or 0 if no credit)  
  const oldCreditMs = Number(props.credit || 0);
  //const now = new Date().getTime();
  const now = Date.now(); 

  let updatedCredit;

  // If old credit still valid -> extend from old expiry
  if (oldCreditMs > now) {
    updatedCredit = oldCreditMs + newCreditMs;
  } else {
    // expired or no credit
    updatedCredit = now + newCreditMs;
  }


  const daysAfterUpdate = Math.ceil((updatedCredit - now) / DAY_MS);

  console.log("Days now:", days.value);
  console.log("Days to add:", daysToAdd);
  console.log("Old credit ms:", oldCreditMs);
  console.log("Updated credit timestamp:", updatedCredit);
  console.log("Days after update:", daysAfterUpdate);

  await proStore.updateCredit(updatedCredit);

}
const handleQuitPayment = () => {

}
</script>

<style scoped>
.plan-panel {
  padding-bottom: 23px;
}
</style>