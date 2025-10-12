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
const handlePayment = (selectedAmount) => {
  const daysAccountToAdd = parseInt(days.value);
  const daysLeftAccount = parseInt(props.credit);
  console.log("DAYS LEFT " + props.credit)
  const daysAfterUpdate = daysAccountToAdd + daysLeftAccount;
  console.log("Days after update: " + daysAfterUpdate);
  const updatedCredit = new Date().getTime() + ((daysAccountToAdd + daysLeftAccount) * 86400000) ;
  console.log("Olet maksanut " + amount.value + " euroa!");

  proStore.updateCredit(daysAfterUpdate);

}
const handleQuitPayment = () => {

}
</script>

<style scoped>
.plan-panel {
  padding-bottom: 23px;
}
</style>