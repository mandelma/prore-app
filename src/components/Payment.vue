<template>
  <MDBContainer>
    <h2>
      {{ t("payment.payAmount", { amount: formattedAmount }) }}
    </h2>

    <MDBBtn
      color="dark"
      style="width: 200px"
      size="lg"
      :aria-label="t('payment.payByCard')"
      @click="payCredit"
    >
      <img
        style="width: 50px"
        :src="mastercard"
        :alt="t('payment.mastercardAlt')"
      />
    </MDBBtn>
  </MDBContainer>
</template>

<script setup>
import {
  MDBContainer,
  MDBBtn
} from "mdb-vue-ui-kit";

import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import mastercard from "../assets/mastercard.png";

defineOptions({
  name: "Payment"
});

const props = defineProps({
  amount: {
    type: Number,
    required: true
  }
});

const emit = defineEmits([
  "pay",
  "quit-payment"
]);

const router = useRouter();
const { t, n } = useI18n();

const formattedAmount = computed(() =>
  n(props.amount, {
    style: "currency",
    currency: "EUR"
  })
);

const payCredit = () => {
  emit("pay");
  router.back();
};

const quitPayment = () => {
  emit("quit-payment");
};
</script>

<style scoped>

</style>