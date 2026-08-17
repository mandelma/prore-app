<template>
  <MDBContainer class="forgot-password-page">
    <ToastHandler
      v-model="toastModel"
      :toast-name="toastState"
      :icon-state="toastIcon"
      :text="toastContent"
    />

    <div class="forgot-password-card">
      <div class="forgot-password-card__icon">
        <i class="fas fa-key"></i>
      </div>

      <div class="forgot-password-card__header">
        <h1 class="forgot-password-card__title">
          {{ t("forgotPassword.title") }}
        </h1>

        <p class="forgot-password-card__description">
          {{ t("forgotPassword.description") }}
        </p>
      </div>

      <form
        class="forgot-password-form"
        @submit.prevent="handleSubmitForgot"
      >
        <MDBInput
          id="giveEmail"
          v-model="emailConfirmation"
          type="email"
          size="lg"
          :label="t('forgotPassword.email_label')"
          :disabled="isSubmitting"
        />

        <p class="forgot-password-form__hint">
          {{ t("forgotPassword.email_hint") }}
        </p>

        <MDBBtn
          type="submit"
          block
          color="primary"
          class="forgot-password-form__submit"
          :disabled="isSubmitting"
        >
          <span
            v-if="isSubmitting"
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>

          {{
            isSubmitting
              ? t("forgotPassword.sending")
              : t("forgotPassword.send")
          }}
        </MDBBtn>

        <button
          type="button"
          class="forgot-password-form__back"
          @click="router.push('/login-panel')"
        >
          <i class="fas fa-arrow-left"></i>
          {{ t("forgotPassword.back_to_login") }}
        </button>
      </form>
    </div>
  </MDBContainer>
</template>

<script setup>
import { ref, nextTick } from "vue";
import {
  MDBContainer,
  MDBInput,
  MDBBtn
} from "mdb-vue-ui-kit";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import ToastHandler from "./ToastHandler.vue";
import authPwService from "../../service/pwAuth.js";

const { t } = useI18n();
const router = useRouter();

const emailConfirmation = ref("");
const isSubmitting = ref(false);

const toastModel = ref(false);
const toastState = ref("");
const toastIcon = ref("");
const toastContent = ref("");

const onToast = (icon, content, color) => {
  toastModel.value = false;

  toastState.value = color;
  toastIcon.value = icon;
  toastContent.value = content;

  nextTick(() => {
    toastModel.value = true;
  });
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email || "").trim()
  );
};

const handleSubmitForgot = async () => {
  const email = emailConfirmation.value.trim();

  if (!isValidEmail(email)) {
    onToast(
      "fas fa-exclamation-circle fa-lg me-2",
      t("forgotPassword.invalid_email"),
      "danger"
    );

    return;
  }

  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    await authPwService.forgot({
      email
    });

    onToast(
      "fas fa-check fa-lg me-2",
      t("forgotPassword.success"),
      "success"
    );

    emailConfirmation.value = "";
  } catch (err) {
    console.error(
      "Password reset request failed:",
      err
    );

    onToast(
      "fas fa-exclamation-circle fa-lg me-2",
      t("forgotPassword.error"),
      "danger"
    );
  } finally {
    isSubmitting.value = false;
  }
};
</script>
<style scoped>
.forgot-password-page {
  display: flex;
  align-items: flex-start;
  justify-content: center;

  min-height: calc(100vh - 120px);
  padding-top: 110px;
  padding-bottom: 40px;
}

.forgot-password-card {
  width: 100%;
  max-width: 440px;
  padding: 28px;

  border: 1px solid rgba(139, 197, 202, 0.22);
  border-radius: 18px;

  background:
    linear-gradient(
      145deg,
      rgba(31, 44, 59, 0.97),
      rgba(20, 31, 44, 0.97)
    );

  box-shadow:
    0 22px 55px rgba(0, 0, 0, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);

  color: #eef4f6;
}

.forgot-password-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 50px;
  height: 50px;
  margin: 0 auto 18px;

  border: 1px solid rgba(95, 158, 160, 0.32);
  border-radius: 14px;

  color: #91c9cd;
  background: rgba(95, 158, 160, 0.13);

  font-size: 18px;
}

.forgot-password-card__header {
  margin-bottom: 24px;
  text-align: center;
}

.forgot-password-card__title {
  margin: 0;

  color: #f4f7f8;

  font-size: 22px;
  font-weight: 650;
  line-height: 1.3;
}

.forgot-password-card__description {
  max-width: 350px;
  margin: 8px auto 0;

  color: rgba(219, 229, 234, 0.62);

  font-size: 13px;
  line-height: 1.55;
}

.forgot-password-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.forgot-password-form :deep(.form-control) {
  min-height: 48px;

  color: #edf3f5;

  border-color: #39495d;
  background: #182332;
}

.forgot-password-form :deep(.form-control:focus) {
  color: #ffffff;

  border-color: #72aeb2;
  background: #182332;

  box-shadow:
    0 0 0 3px rgba(95, 158, 160, 0.14);
}

.forgot-password-form :deep(.form-label) {
  color: rgba(221, 231, 235, 0.62);
}

.forgot-password-form__hint {
  margin: -5px 2px 2px;

  color: rgba(218, 227, 232, 0.48);

  font-size: 11px;
  line-height: 1.4;
}

.forgot-password-form__submit {
  min-height: 45px;
  margin-top: 4px !important;

  border-radius: 10px !important;

  font-size: 13px !important;
  font-weight: 650 !important;
  text-transform: none !important;

  background:
    linear-gradient(
      135deg,
      #278eae,
      #3b82f6
    ) !important;

  box-shadow:
    0 8px 20px rgba(59, 130, 246, 0.24) !important;
}

.forgot-password-form__submit:disabled {
  opacity: 0.6;

  box-shadow: none !important;
}

.forgot-password-form__back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  width: 100%;
  padding: 9px;

  border: 0;

  color: rgba(219, 229, 234, 0.64);
  background: transparent;

  font-size: 12px;

  cursor: pointer;

  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.forgot-password-form__back:hover {
  color: #ffffff;
}

@media (max-width: 600px) {
  .forgot-password-page {
    align-items: flex-start;

    padding-top: 85px;
    padding-right: 14px;
    padding-left: 14px;
  }

  .forgot-password-card {
    padding: 22px 18px;

    border-radius: 16px;
  }

  .forgot-password-card__title {
    font-size: 20px;
  }

  .forgot-password-card__description {
    font-size: 12px;
  }
}
</style>