<template>
  <div class="auth-page">
    <MDBContainer class="auth-container">
      <MDBToast
        v-model="loginError"
        autohide
        :delay="3500"
        :stacking="false"
        position="top-center"
        toast="danger"
        icon="fas fa-exclamation-circle fa-lg me-2"
      >
        <template #title>
          {{ t("login.error_title") }}
        </template>

        <template #small></template>

        {{ loginErrorMessage }}
      </MDBToast>

      <form
        class="login-card"
        @submit.prevent="userLoginData"
        autocomplete="off"
      >
        <div class="login-card__icon">
          <i class="fas fa-user"></i>
        </div>

        <div class="login-card__header">
          <h1 class="login-card__title">
            {{ t("login.title") }}
          </h1>

          <p class="login-card__description">
            {{ t("login.description") }}
          </p>
        </div>

        <div class="login-form">
          <MDBInput
            id="loginUsername"
            v-model="loginUsername"
            type="text"
            size="lg"
            :label="t('login.username')"
            :disabled="isSubmitting"
            autocomplete="username"
          />

          <MDBInput
            id="loginPassword"
            v-model="loginPassword"
            type="password"
            size="lg"
            :label="t('login.password')"
            :disabled="isSubmitting"
            autocomplete="current-password"
          />

          <div class="login-form__options">
            <MDBCheckbox
              id="loginCheck"
              v-model="loginCheck"
              :label="t('login.rememberme')"
            />

            <router-link
              to="/forgot-password"
              class="login-form__forgot"
            >
              {{ t("login.forgot_password") }}
            </router-link>
          </div>

          <MDBBtn
            color="primary"
            size="lg"
            type="submit"
            block
            class="login-form__submit"
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
                ? t("login.logging_in")
                : t("login.log_in")
            }}
          </MDBBtn>

          <div class="login-form__register">
            <span>
              {{ t("login.no_member") }}
            </span>

            <button
              type="button"
              class="login-form__register-link"
              @click="router.push('/register-panel')"
            >
              {{ t("login.register") }}
            </button>
          </div>
        </div>
      </form>
    </MDBContainer>
  </div>
</template>

<script setup>
import {
  MDBContainer,
  MDBInput,
  MDBBtn,
  MDBCheckbox,
  MDBToast
} from "mdb-vue-ui-kit";

import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import loginService from "@/service/login.js";
import { useLoginStore } from "@/stores/login.js";

defineOptions({
  name: "LoginForm"
});

const { t } = useI18n();
const router = useRouter();
const userApp = useLoginStore();

const loginUsername = ref("");
const loginPassword = ref("");
const loginCheck = ref(false);

const loginError = ref(false);
const loginErrorMessage = ref("");

const isSubmitting = ref(false);

const userLoginData = async () => {
  const username = loginUsername.value.trim();
  const password = loginPassword.value;
  const remember = loginCheck.value;

  loginError.value = false;
  loginErrorMessage.value = "";

  if (!username || !password) {
    loginErrorMessage.value =
      t("login.error_required_fields");

    loginError.value = true;
    return;
  }

  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    const res = await loginService.login({
      username,
      password,
      remember
    });

    if (!res?.token) {
      loginErrorMessage.value =
        t("login.error_invalid_credentials");

      loginError.value = true;
      return;
    }

    userApp.onLogin(res);

  } catch (err) {
    console.error("Login request failed:", err);

    loginErrorMessage.value =
      t("login.error_invalid_credentials");

    loginError.value = true;

  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;

  min-height: calc(100vh - 100px);
  padding: 110px 16px 40px;

  box-sizing: border-box;
}

.auth-container {
  width: 100%;
  max-width: 440px;

  padding: 0;
}

.login-card {
  width: 100%;
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

.login-card__icon {
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

.login-card__header {
  margin-bottom: 24px;

  text-align: center;
}

.login-card__title {
  margin: 0;

  color: #f4f7f8;

  font-size: 22px;
  font-weight: 650;
  line-height: 1.3;
}

.login-card__description {
  max-width: 340px;
  margin: 8px auto 0;

  color: rgba(219, 229, 234, 0.62);

  font-size: 13px;
  line-height: 1.5;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.login-form :deep(.form-control) {
  min-height: 48px;

  color: #edf3f5;

  border-color: #39495d;
  background: #182332;
}

.login-form :deep(.form-control:focus) {
  color: #ffffff;

  border-color: #72aeb2;
  background: #182332;

  box-shadow:
    0 0 0 3px rgba(95, 158, 160, 0.14);
}

.login-form :deep(.form-label) {
  color: rgba(221, 231, 235, 0.62);
}

.login-form__options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;

  margin-top: -2px;

  font-size: 12px;
}

.login-form__forgot {
  color: #83c5ca;

  text-decoration: none;
}

.login-form__forgot:hover {
  color: #b8e7ea;

  text-decoration: underline;
}

.login-form__submit {
  min-height: 46px;
  margin-top: 3px !important;

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

.login-form__submit:disabled {
  opacity: 0.6;

  box-shadow: none !important;
}

.login-form__register {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  margin-top: 4px;

  color: rgba(219, 229, 234, 0.62);

  font-size: 12px;
}

.login-form__register-link {
  padding: 0;

  border: 0;

  color: #91c9cd;
  background: transparent;

  font-weight: 600;

  cursor: pointer;
}

.login-form__register-link:hover {
  color: #c3eff1;

  text-decoration: underline;
}

@media (max-width: 600px) {
  .auth-page {
    padding-top: 85px;
    padding-right: 14px;
    padding-left: 14px;
  }

  .login-card {
    padding: 22px 18px;

    border-radius: 16px;
  }

  .login-card__title {
    font-size: 20px;
  }

  .login-card__description {
    font-size: 12px;
  }
}

@media (max-width: 390px) {
  .login-form__options {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
}
</style>