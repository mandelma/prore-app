<template>
  <MDBContainer class="pay-plan-page">
    <div class="pay-plan-header">
      <div>
        <h1 class="pay-plan-title">
          {{ t("payPlan.title") }}
        </h1>

        <p class="pay-plan-description">
          {{ t("payPlan.description") }}
        </p>
      </div>

      <button
        type="button"
        class="pay-plan-close"
        :aria-label="t('payPlan.close')"
        @click="goBack"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <Payment
      v-if="isPaymentSelected"
      :amount="amount"
      @pay="handlePayment"
      @quit-payment="handleQuitPayment"
    />

    <MDBRow
      v-else
      class="g-4 justify-content-center"
    >
      <MDBCol
        v-for="plan in plans"
        :key="plan.id"
        xl="3"
        lg="4"
        md="6"
        sm="12"
      >
        <MDBCard
          class="plan-card h-100"
          :class="{ featured: plan.featured }"
        >
          <div
            v-if="plan.featured"
            class="plan-badge"
          >
            {{ t("payPlan.recommended") }}
          </div>

          <MDBCardBody class="plan-card-body">
            <p class="plan-name">
              {{ t(plan.headerKey) }}
            </p>

            <h2 class="plan-duration">
              {{ t(plan.durationKey) }}
            </h2>

            <div class="plan-price">
              {{ formatCurrency(plan.price) }}
            </div>

            <p class="plan-price-note">
              {{ t("payPlan.oneTimePayment") }}
            </p>

            <MDBBtn
              color="info"
              size="lg"
              class="plan-button"
              @click="selectPayment(plan.price, plan.days)"
            >
              {{ t("payPlan.selectPlan") }}
            </MDBBtn>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script setup>
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardHeader,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBBtn
} from "mdb-vue-ui-kit";

import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import Payment from "./Payment.vue";
import { useProStore } from "@/stores/providerStore.js";

defineOptions({
  name: "PayPlan"
});

const props = defineProps({
  credit: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(["updateCredit"]);

const router = useRouter();
const proStore = useProStore();
const { t, n } = useI18n();

const DAY_MS = 86_400_000;

const amount = ref(0);
const days = ref(0);
const isPaymentSelected = ref(false);

const plans = [
  {
    id: "day",
    headerKey: "payPlan.day",
    durationKey: "payPlan.oneDay",
    price: 7,
    days: 1
  },
  {
    id: "week",
    headerKey: "payPlan.week",
    durationKey: "payPlan.sevenDays",
    price: 14,
    days: 7
  },
  {
    id: "month",
    headerKey: "payPlan.month",
    durationKey: "payPlan.oneMonth",
    price: 30,
    days: 30,
    featured: true
  },
  {
    id: "sixMonths",
    headerKey: "payPlan.sixMonths",
    durationKey: "payPlan.sixMonthDuration",
    price: 100,
    days: 183
  },
  {
    id: "year",
    headerKey: "payPlan.year",
    durationKey: "payPlan.twelveMonthDuration",
    price: 120,
    days: 366
  }
];

const formatCurrency = value =>
  n(value, "currency");

const selectPayment = (price, dayAmount) => {
  amount.value = price;
  days.value = dayAmount;
  isPaymentSelected.value = true;
};

const handlePayment = async () => {
  const daysToAdd = Number(days.value);

  if (!Number.isFinite(daysToAdd) || daysToAdd <= 0) {
    return;
  }

  const now = Date.now();
  const oldCreditMs = Number(props.credit) || 0;
  const baseTimestamp =
    oldCreditMs > now
      ? oldCreditMs
      : now;

  const updatedCredit =
    baseTimestamp + daysToAdd * DAY_MS;

  await proStore.updateCredit(updatedCredit);

  emit("updateCredit", updatedCredit);

  isPaymentSelected.value = false;
};

const handleQuitPayment = () => {
  isPaymentSelected.value = false;
  amount.value = 0;
  days.value = 0;
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.pay-plan-page {
  max-width: 1280px;
  min-height: 100vh;
  padding-top: 72px;
  padding-bottom: 56px;
}

.pay-plan-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 48px;
}

.pay-plan-title {
  margin: 0 0 10px;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.pay-plan-description {
  max-width: 640px;
  margin: 0;
  color: #6c757d;
  font-size: 1.05rem;
  line-height: 1.6;
}

.pay-plan-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  padding: 0;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.pay-plan-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.plan-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.09);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(20, 30, 50, 0.08);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.plan-card:hover {
  transform: translateY(-6px);
  border-color: rgba(13, 202, 240, 0.4);
  box-shadow: 0 18px 42px rgba(20, 30, 50, 0.14);
}

.plan-card.featured {
  border: 2px solid #0dcaf0;
}

.plan-card-body {
  display: flex;
  flex-direction: column;
  min-height: 340px;
  padding: 32px 28px;
  text-align: center;
}

.plan-name {
  margin-bottom: 12px;
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.plan-duration {
  margin-bottom: 24px;
  font-size: 1.45rem;
  font-weight: 650;
}

.plan-price {
  margin-bottom: 6px;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 750;
  line-height: 1;
  letter-spacing: -0.04em;
}

.plan-price-note {
  margin-bottom: 32px;
  color: #6c757d;
  font-size: 0.9rem;
}

.plan-button {
  width: 100%;
  margin-top: auto;
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
}

.plan-badge {
  position: absolute;
  top: 16px;
  right: -34px;
  z-index: 1;
  width: 140px;
  padding: 6px 0;
  background-color: #0dcaf0;
  color: #062d35;
  font-size: 0.7rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  transform: rotate(38deg);
}

@media (max-width: 767px) {
  .pay-plan-page {
    padding-top: 32px;
    padding-bottom: 32px;
  }

  .pay-plan-header {
    margin-bottom: 32px;
  }

  .pay-plan-title {
    font-size: 2rem;
  }

  .plan-card-body {
    min-height: 300px;
    padding: 28px 22px;
  }
}
</style>