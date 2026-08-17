<template>
  <div class="register-page">
    <MDBContainer class="register-container">
      <MDBToast
        v-model="isRegisterError"
        autohide
        :delay="3500"
        :stacking="false"
        position="top-center"
        toast="danger"
        icon="fas fa-exclamation-circle fa-lg me-2"
      >
        <template #title>
          {{ t("register.error_title") }}
        </template>

        <template #small></template>

        {{ currentErrorMessage }}
      </MDBToast>

      <form
        class="register-card"
        @submit.prevent="submitUser"
        autocomplete="on"
      >
        <div class="register-card__icon">
          <i class="fas fa-user-plus"></i>
        </div>

        <div class="register-card__header">
          <h1 class="register-card__title">
            {{ t("register.title") }}
          </h1>

          <p class="register-card__description">
            {{ t("register.description") }}
          </p>
        </div>

        <div class="register-form">
          <!-- Nimi -->
          <div class="register-form__row">
            <MDBInput
              id="registerFirstName"
              v-model="registerFirstName"
              type="text"
              size="lg"
              :label="t('register.firstname')"
              :disabled="isSubmitting"
              autocomplete="given-name"
            />

            <MDBInput
              id="registerLastName"
              v-model="registerLastName"
              type="text"
              size="lg"
              :label="t('register.lastname')"
              :disabled="isSubmitting"
              autocomplete="family-name"
            />
          </div>

          <!-- Kasutajanimi -->
          <MDBInput
            id="registerUsername"
            v-model="registerUsername"
            type="text"
            size="lg"
            :label="t('register.username')"
            :disabled="isSubmitting"
            autocomplete="username"
          />

          <!-- Email -->
          <MDBInput
            id="registerEmail"
            v-model="registerEmail"
            type="email"
            size="lg"
            :label="t('register.email')"
            :disabled="isSubmitting"
            autocomplete="email"
          />

          <!-- Parool -->
          <div class="register-password-field">
            <MDBInput
              id="registerPassword"
              v-model="registerPassword"
              :type="showPassword ? 'text' : 'password'"
              size="lg"
              :label="t('register.password_1')"
              :disabled="isSubmitting"
              autocomplete="new-password"
            />

            <button
              type="button"
              class="register-password-field__toggle"
              :aria-label="t('register.toggle_password')"
              @click="togglePassword"
            >
              <i
                :class="
                  showPassword
                    ? 'far fa-eye-slash'
                    : 'far fa-eye'
                "
              ></i>
            </button>
          </div>

          <p class="register-form__hint">
            {{ t("register.validation.password_requirements") }}
          </p>

          <p
            v-if="pwValidateError && registerPassword"
            class="register-form__error"
          >
            {{ pwValidateError }}
          </p>

          <!-- Parooli kordus -->
          <div class="register-password-field">
            <MDBInput
              id="registerPasswordRepeat"
              v-model="registerPasswordRepeat"
              :type="showConfirmPassword ? 'text' : 'password'"
              size="lg"
              :label="t('register.password_2')"
              :disabled="isSubmitting"
              autocomplete="new-password"
            />

            <button
              type="button"
              class="register-password-field__toggle"
              :aria-label="t('register.toggle_password')"
              @click="toggleConfirmPassword"
            >
              <i
                :class="
                  showConfirmPassword
                    ? 'far fa-eye-slash'
                    : 'far fa-eye'
                "
              ></i>
            </button>
          </div>

          <p
            v-if="
              pwConfirmValidateError &&
              registerPasswordRepeat
            "
            class="register-form__error"
          >
            {{ pwConfirmValidateError }}
          </p>

          <!-- Remember me -->
          <div class="register-form__option">
            <MDBCheckbox
              id="registerRememberCheck"
              v-model="registerSubscribeCheck"
              :label="t('register.remember_me')"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Tingimused -->
          <div class="register-terms">
            <MDBCheckbox
              id="registerTermsCheck"
              v-model="acceptedTerms"
              :disabled="isSubmitting"
            />

            <label
              for="registerTermsCheck"
              class="register-terms__label"
            >
              {{ t("register.terms.accept_prefix") }}

              <router-link
                to="/terms"
                class="register-terms__link"
                @click.stop
              >
                {{ t("register.terms.terms_link") }}
              </router-link>
            </label>
          </div>

          <p
            v-if="!acceptedTerms && isSubmitted"
            class="register-form__error"
          >
            {{ t("register.terms.required") }}
          </p>

          <!-- Submit -->
          <MDBBtn
            color="primary"
            size="lg"
            type="submit"
            block
            class="register-form__submit"
            :disabled="
              isSubmitting ||
              !!pwValidateError ||
              !!pwConfirmValidateError
            "
          >
            <span
              v-if="isSubmitting"
              class="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>

            {{
              isSubmitting
                ? t("register.creating_account")
                : t("register.create_account")
            }}
          </MDBBtn>

          <!-- Login -->
          <div class="register-form__login">
            <span>
              {{ t("register.already_member") }}
            </span>

            <button
              type="button"
              class="register-form__login-link"
              @click="router.push('/login')"
            >
              {{ t("register.sign_in") }}
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

import {
  ref,
  watch
} from "vue";

import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import userService from "@/service/users.js";
import loginService from "@/service/login.js";
import { useLoginStore } from "@/stores/login.js";

defineOptions({
  name: "RegisterForm"
});

const router = useRouter();
const { t } = useI18n();
const login = useLoginStore();

const registerFirstName = ref("");
const registerLastName = ref("");
const registerUsername = ref("");
const registerEmail = ref("");
const registerPassword = ref("");
const registerPasswordRepeat = ref("");

const registerSubscribeCheck = ref(false);
const acceptedTerms = ref(false);

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const isSubmitted = ref(false);
const isSubmitting = ref(false);

const isRegisterError = ref(false);
const currentErrorMessage = ref("");

const pwValidateError = ref("");
const pwConfirmValidateError = ref("");

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value =
    !showConfirmPassword.value;
};

const passwordIsValid = (password) => {
  const hasMinimumLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialCharacter =
    /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]/.test(
      password
    );

  return (
    hasMinimumLength &&
    hasUppercase &&
    hasNumber &&
    hasSpecialCharacter
  );
};

const validatePassword = () => {
  if (!registerPassword.value) {
    pwValidateError.value = "";
    return;
  }

  pwValidateError.value =
    passwordIsValid(registerPassword.value)
      ? ""
      : t(
          "register.validation.password_requirements"
        );
};

const validateConfirmPassword = () => {
  if (!registerPasswordRepeat.value) {
    pwConfirmValidateError.value = "";
    return;
  }

  if (
    registerPassword.value !==
    registerPasswordRepeat.value
  ) {
    pwConfirmValidateError.value =
      t(
        "register.validation.passwords_not_match"
      );

    return;
  }

  pwConfirmValidateError.value = "";
};

watch(registerPassword, () => {
  validatePassword();

  if (registerPasswordRepeat.value) {
    validateConfirmPassword();
  }
});

watch(registerPasswordRepeat, () => {
  validateConfirmPassword();
});

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const submitUser = async () => {
  isSubmitted.value = true;
  isRegisterError.value = false;
  currentErrorMessage.value = "";

  const firstName =
    registerFirstName.value.trim();

  const lastName =
    registerLastName.value.trim();

  const username =
    registerUsername.value.trim();

  const email =
    registerEmail.value.trim().toLowerCase();

  const password =
    registerPassword.value;

  if (
    !firstName ||
    !lastName ||
    !username ||
    !email ||
    !password ||
    !registerPasswordRepeat.value
  ) {
    currentErrorMessage.value =
      t("register.validation.required_fields");

    isRegisterError.value = true;
    return;
  }

  if (!acceptedTerms.value) {
    currentErrorMessage.value =
      t("register.terms.required");

    isRegisterError.value = true;
    return;
  }

  if (username.length < 4) {
    currentErrorMessage.value =
      t(
        "register.validation.username_too_short"
      );

    isRegisterError.value = true;
    return;
  }

  if (!isValidEmail(email)) {
    currentErrorMessage.value =
      t("register.validation.invalid_email");

    isRegisterError.value = true;
    return;
  }

  if (!passwordIsValid(password)) {
    currentErrorMessage.value =
      t(
        "register.validation.password_requirements"
      );

    isRegisterError.value = true;
    return;
  }

  if (
    password !== registerPasswordRepeat.value
  ) {
    currentErrorMessage.value =
      t(
        "register.validation.passwords_not_match"
      );

    isRegisterError.value = true;
    return;
  }

  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    const newUser = {
      firstName,
      lastName,
      username,
      email,
      password
    };

    const result =
      await userService.addUser(newUser);

    if (result?.error === "username existing") {
      currentErrorMessage.value =
        t(
          "register.validation.username_exists"
        );

      isRegisterError.value = true;
      return;
    }

    if (result?.error === "email existing") {
      currentErrorMessage.value =
        t(
          "register.validation.email_exists"
        );

      isRegisterError.value = true;
      return;
    }

    /*
     * Automaatne login pärast registreerimist.
     * Remember me väärtus läheb nüüd samuti backendile.
     */
    const loggedInUser =
      await loginService.login({
        username,
        password,
        remember:
          registerSubscribeCheck.value
      });

    if (!loggedInUser?.token) {
      currentErrorMessage.value =
        t(
          "register.validation.auto_login_failed"
        );

      isRegisterError.value = true;

      await router.push("/login");
      return;
    }

    await login.onLogin(loggedInUser);

    isSubmitted.value = false;

  } catch (err) {
    console.error(
      "Registration failed:",
      err
    );

    currentErrorMessage.value =
      t(
        "register.validation.registration_failed"
      );

    isRegisterError.value = true;

  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;

  min-height: calc(100vh - 100px);
  padding: 90px 16px 45px;

  box-sizing: border-box;
}

.register-container {
  width: 100%;
  max-width: 560px;

  padding: 0;
}

.register-card {
  width: 100%;
  padding: 28px;

  box-sizing: border-box;

  border:
    1px solid rgba(139, 197, 202, 0.22);
  border-radius: 18px;

  background:
    linear-gradient(
      145deg,
      rgba(31, 44, 59, 0.97),
      rgba(20, 31, 44, 0.97)
    );

  box-shadow:
    0 22px 55px rgba(0, 0, 0, 0.32),
    inset 0 1px 0
      rgba(255, 255, 255, 0.04);

  color: #eef4f6;
}

.register-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 50px;
  height: 50px;
  margin: 0 auto 18px;

  border:
    1px solid rgba(95, 158, 160, 0.32);
  border-radius: 14px;

  color: #91c9cd;
  background:
    rgba(95, 158, 160, 0.13);

  font-size: 18px;
}

.register-card__header {
  margin-bottom: 24px;

  text-align: center;
}

.register-card__title {
  margin: 0;

  color: #f4f7f8;

  font-size: 22px;
  font-weight: 650;
  line-height: 1.3;
}

.register-card__description {
  max-width: 390px;
  margin: 8px auto 0;

  color: rgba(219, 229, 234, 0.62);

  font-size: 13px;
  line-height: 1.5;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.register-form__row {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(0, 1fr);

  gap: 12px;
}

.register-form :deep(.form-control) {
  min-height: 48px;

  color: #edf3f5;

  border-color: #39495d;
  background: #182332;
}

.register-form :deep(.form-control:focus) {
  color: #ffffff;

  border-color: #72aeb2;
  background: #182332;

  box-shadow:
    0 0 0 3px
      rgba(95, 158, 160, 0.14);
}

.register-form :deep(.form-label) {
  color:
    rgba(221, 231, 235, 0.62);
}

/* Password */

.register-password-field {
  position: relative;
}

.register-password-field
:deep(.form-outline) {
  width: 100%;
}

.register-password-field
:deep(.form-control) {
  padding-right: 48px;
}

.register-password-field__toggle {
  position: absolute;
  top: 50%;
  right: 4px;

  z-index: 5;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;

  padding: 0;

  border: 0;
  border-radius: 8px;

  color:
    rgba(220, 230, 234, 0.62);
  background: transparent;

  font-size: 14px;

  cursor: pointer;

  transform: translateY(-50%);

  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.register-password-field__toggle:hover {
  color: #ffffff;
  background:
    rgba(95, 158, 160, 0.12);
}

/* Validation */

.register-form__hint {
  margin: -7px 2px 0;

  color:
    rgba(218, 227, 232, 0.48);

  font-size: 11px;
  line-height: 1.4;
}

.register-form__error {
  margin: -7px 2px 0;

  color: #ef9aaa;

  font-size: 11px;
  line-height: 1.4;
}

/* Options */

.register-form__option {
  margin-top: 3px;
}

/* Terms */

.register-terms {
  display: flex;
  align-items: flex-start;
  gap: 8px;

  padding: 11px 12px;

  border:
    1px solid rgba(139, 197, 202, 0.12);
  border-radius: 10px;

  background:
    rgba(255, 255, 255, 0.025);
}

.register-terms__label {
  margin-top: 1px;

  color:
    rgba(219, 229, 234, 0.67);

  font-size: 12px;
  line-height: 1.45;

  cursor: pointer;
}

.register-terms__link {
  color: #91c9cd;

  text-decoration: none;
}

.register-terms__link:hover {
  color: #c3eff1;

  text-decoration: underline;
}

/* Submit */

.register-form__submit {
  min-height: 46px;
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
    0 8px 20px
      rgba(59, 130, 246, 0.24)
      !important;
}

.register-form__submit:disabled {
  opacity: 0.58;

  box-shadow: none !important;
}

/* Login link */

.register-form__login {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  color:
    rgba(219, 229, 234, 0.62);

  font-size: 12px;
}

.register-form__login-link {
  padding: 0;

  border: 0;

  color: #91c9cd;
  background: transparent;

  font-weight: 600;

  cursor: pointer;
}

.register-form__login-link:hover {
  color: #c3eff1;

  text-decoration: underline;
}

@media (max-width: 600px) {
  .register-page {
    padding-top: 80px;
    padding-right: 14px;
    padding-left: 14px;
  }

  .register-card {
    padding: 22px 18px;

    border-radius: 16px;
  }

  .register-card__title {
    font-size: 20px;
  }

  .register-card__description {
    font-size: 12px;
  }

  .register-form__row {
    grid-template-columns: 1fr;
  }
}
</style>