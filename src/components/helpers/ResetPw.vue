<template>
  <MDBContainer class="reset-password-page">
    <ToastHandler
      v-model="toastModel"
      :toast-name="toastState"
      :icon-state="toastIcon"
      :text="toastContent"
    />

    <div class="reset-password-card">
      <div class="reset-password-card__icon">
        <i class="fas fa-lock"></i>
      </div>

      <!-- Tokeni kontrollimine -->
      <div
        v-if="tokenStatus === 'checking'"
        class="reset-password-status"
      >
        <div
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></div>

        <p>
          {{ t("resetPassword.checking_link") }}
        </p>
      </div>

      <!-- Vigane või aegunud token -->
      <div
        v-else-if="tokenStatus === 'invalid'"
        class="reset-password-invalid"
      >
        <h1 class="reset-password-card__title">
          {{ t("resetPassword.invalid_title") }}
        </h1>

        <p class="reset-password-card__description">
          {{ t("resetPassword.invalid_description") }}
        </p>

        <MDBBtn
          block
          color="primary"
          class="reset-password-form__submit"
          @click="router.push('/forgot-password')"
        >
          {{ t("resetPassword.request_new_link") }}
        </MDBBtn>

        <button
          type="button"
          class="reset-password-form__back"
          @click="router.push('/login-panel')"
        >
          <i class="fas fa-arrow-left"></i>
          {{ t("resetPassword.back_to_login") }}
        </button>
      </div>

      <!-- Kehtiv token -->
      <template v-else-if="tokenStatus === 'valid'">
        <div class="reset-password-card__header">
          <h1 class="reset-password-card__title">
            {{ t("resetPassword.title") }}
          </h1>

          <p class="reset-password-card__description">
            {{ t("resetPassword.description") }}
          </p>
        </div>

        <form
          class="reset-password-form"
          @submit.prevent="handleSubmitReset"
        >
          <MDBInput
            id="newPassword"
            v-model="newPw"
            type="password"
            size="lg"
            :label="t('resetPassword.new_password')"
            :disabled="isSubmitting"
          />

          <p class="reset-password-form__hint">
            {{ t("resetPassword.password_hint") }}
          </p>

          <MDBInput
            id="confirmNewPassword"
            v-model="confirmNewPw"
            type="password"
            size="lg"
            :label="t('resetPassword.confirm_password')"
            :disabled="isSubmitting"
          />

          <MDBBtn
            block
            type="submit"
            color="primary"
            class="reset-password-form__submit"
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
                ? t("resetPassword.saving")
                : t("resetPassword.save")
            }}
          </MDBBtn>

          <button
            type="button"
            class="reset-password-form__back"
            @click="router.push('/login-panel')"
          >
            <i class="fas fa-arrow-left"></i>
            {{ t("resetPassword.back_to_login") }}
          </button>
        </form>
      </template>
    </div>
  </MDBContainer>
</template>

<script setup>
import {
  ref,
  nextTick,
  onMounted
} from "vue";

import {
  MDBContainer,
  MDBInput,
  MDBBtn
} from "mdb-vue-ui-kit";

import {
  useRouter,
  useRoute
} from "vue-router";

import { useI18n } from "vue-i18n";

import authPwService from "../../service/pwAuth";
import ToastHandler from "./ToastHandler.vue";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const token = String(route.params.token || "");

const newPw = ref("");
const confirmNewPw = ref("");

const tokenStatus = ref("checking");
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

const cleanInputFields = () => {
  newPw.value = "";
  confirmNewPw.value = "";
};

const validateToken = async () => {
  if (!token) {
    tokenStatus.value = "invalid";
    return;
  }

  tokenStatus.value = "checking";

  try {
    const result = await authPwService.reset(token);

    if (result === "valid") {
      tokenStatus.value = "valid";
    } else {
      tokenStatus.value = "invalid";
    }
  } catch (err) {
    console.error(
      "Reset token validation failed:",
      err
    );

    tokenStatus.value = "invalid";
  }
};

const handleSubmitReset = async () => {
  const password = newPw.value.trim();
  const confirmPassword = confirmNewPw.value.trim();

  if (!password || !confirmPassword) {
    onToast(
      "fas fa-exclamation-circle fa-lg me-2",
      t("resetPassword.required_fields"),
      "danger"
    );

    return;
  }

  if (password.length < 8) {
    onToast(
      "fas fa-exclamation-circle fa-lg me-2",
      t("resetPassword.password_too_short"),
      "danger"
    );

    return;
  }

  if (password !== confirmPassword) {
    onToast(
      "fas fa-exclamation-circle fa-lg me-2",
      t("resetPassword.passwords_do_not_match"),
      "danger"
    );

    return;
  }

  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    await authPwService.resetAuth({
      token,
      password
    });

    cleanInputFields();

    onToast(
      "fas fa-check fa-lg me-2",
      t("resetPassword.success"),
      "success"
    );

    setTimeout(() => {
      router.push("/login-panel");
    }, 1200);

  } catch (err) {
    console.error(
      "Password reset failed:",
      err
    );

    const status = err.response?.status;

    if (status === 401 || status === 403) {
      tokenStatus.value = "invalid";

      return;
    }

    onToast(
      "fas fa-exclamation-circle fa-lg me-2",
      t("resetPassword.error"),
      "danger"
    );
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  validateToken();
});
</script>
<style scoped>
.reset-password-page {
  display: flex;
  align-items: flex-start;
  justify-content: center;

  min-height: calc(100vh - 120px);
  padding-top: 110px;
  padding-bottom: 40px;
}

.reset-password-card {
  width: 100%;
  max-width: 440px;
  padding: 28px;

  box-sizing: border-box;

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

.reset-password-card__icon {
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

.reset-password-card__header {
  margin-bottom: 24px;

  text-align: center;
}

.reset-password-card__title {
  margin: 0;

  color: #f4f7f8;

  font-size: 22px;
  font-weight: 650;
  line-height: 1.3;
}

.reset-password-card__description {
  max-width: 360px;
  margin: 8px auto 0;

  color: rgba(219, 229, 234, 0.62);

  font-size: 13px;
  line-height: 1.55;
}

.reset-password-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.reset-password-form :deep(.form-control) {
  min-height: 48px;

  color: #edf3f5;

  border-color: #39495d;
  background: #182332;
}

.reset-password-form :deep(.form-control:focus) {
  color: #ffffff;

  border-color: #72aeb2;
  background: #182332;

  box-shadow:
    0 0 0 3px rgba(95, 158, 160, 0.14);
}

.reset-password-form :deep(.form-label) {
  color: rgba(221, 231, 235, 0.62);
}

.reset-password-form__hint {
  margin: -5px 2px 2px;

  color: rgba(218, 227, 232, 0.48);

  font-size: 11px;
  line-height: 1.4;
}

.reset-password-form__submit {
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

.reset-password-form__submit:disabled {
  opacity: 0.6;

  box-shadow: none !important;
}

.reset-password-form__back {
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

  transition: color 0.2s ease;
}

.reset-password-form__back:hover {
  color: #ffffff;
}

/* Token validation */

.reset-password-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 13px;

  padding: 14px 0;

  color: rgba(219, 229, 234, 0.72);

  text-align: center;
  font-size: 13px;
}

.reset-password-status p {
  margin: 0;
}

/* Invalid / expired link */

.reset-password-invalid {
  text-align: center;
}

.reset-password-invalid
.reset-password-card__description {
  margin-bottom: 24px;
}

@media (max-width: 600px) {
  .reset-password-page {
    padding-top: 85px;
    padding-right: 14px;
    padding-left: 14px;
  }

  .reset-password-card {
    padding: 22px 18px;

    border-radius: 16px;
  }

  .reset-password-card__title {
    font-size: 20px;
  }

  .reset-password-card__description {
    font-size: 12px;
  }
}
</style>