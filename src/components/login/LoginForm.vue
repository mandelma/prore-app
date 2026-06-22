<template>
  <div class="auth-page">
    <MDBContainer class="auth-container">
      <div style="padding: 13px 0 20px 0;">
        <MDBToast
            v-model="loginError"
            autohide
            :delay="3000"
            :stacking="false"
            position="top-center"
            toast="danger"
            icon="fas fa-exclamation-circle fa-lg me-2"
        >
          <template #title> {{t('login.error_title')}} </template>
          <button type="button" style="visibility: hidden;" class="btn-close ms-auto" aria-label="Close" @click="hideError"></button>
          <template #small></template>
          {{ loginErrorMessage }}
        </MDBToast>
      </div>

      <form class="form-card" @submit.prevent="userLoginData" autocomplete="off">
        <MDBInput
            type="text"
            size="lg"
            :label="t('login.username')"
            id="loginUsername"
            v-model="loginUsername"

            wrapperClass="mb-4"
        />

        <!-- Password input -->
        <MDBInput
            type="password"
            size="lg"
            :label="t('login.password')"
            id="loginPassword"
            v-model="loginPassword"
            wrapperClass="mb-4"
        />

        <!-- 2 column grid layout for inline styling -->
        <MDBRow class="mb-4">
          <MDBCol class="d-flex justify-content-center">
            <!-- Checkbox -->
            <MDBCheckbox
                :label="t('login.rememberme')"
                id="loginCheck"
                v-model="loginCheck"
                wrapperClass="mb-3 mb-md-0"
            />
          </MDBCol>

          <MDBCol>
            <!-- Simple link -->
            <router-link to="/forgot_auth">{{ t('login.forgot_password') }}</router-link>
            <!--          <a href="/recipients">Unohtuiko salasana?</a>-->
          </MDBCol>
        </MDBRow>

        <!-- Submit button -->
        <MDBBtn color="primary" size="lg" type="submit" block class="mb-4"> {{ t('login.log_in') }} </MDBBtn>

        <!-- Register buttons -->
        <div class="text-center">
          <p style="color: #22D3EE;">{{ t('login.no_member') }} <span id="reg" @click="$router.push('/register-panel')" style="cursor: pointer; color: #0E7490;">{{ t('login.register') }}</span></p>
        </div>
      </form>
    </MDBContainer>
  </div>
</template>

<script setup>
import { MDBContainer, MDBInput, MDBBtn, MDBRow, MDBCol, MDBCheckbox, MDBToast } from "mdb-vue-ui-kit";
import { ref } from 'vue';
import loginService from '@/service/login.js';
import {useLoginStore} from "@/stores/login.js";
import { useRouter } from 'vue-router';
import { useI18n } from "vue-i18n";
defineOptions({
  name: 'LoginForm'
})
const { t } = useI18n();
const loginUsername = ref("");
const loginPassword = ref("");
const loginCheck = ref(true);
const userApp = useLoginStore();
const router = useRouter();
const loginError = ref(false);
const showError = () => { loginError.value = true }
const hideError = () => { loginError.value = false }
const isLoginError = ref(false);
const loginErrorMessage = ref(false);

const userLoginData = async () => {
  let user;
  const userLogin = {
    username: loginUsername.value,
    password: loginPassword.value
  }

  console.log("Filled username: " + loginUsername.value);

  if (loginUsername.value !== "" && loginPassword.value !== "") {
    loginError.value = false;

    try {
      const res = await loginService.login(userLogin);
      console.log("RES", res);

      if (!res?.token) {
        loginError.value = true;
        return;
      }

      userApp.onLogin(res);
    } catch (err) {
      console.log("Login request failed:", err);
      loginErrorMessage.value = t('login.error_invalid_credentials')
      loginError.value = true;
    }
  } else {
    console.log("Error - Kaikki kentät ovat täytettävä!")
    loginError.value = true;
    loginErrorMessage.value = t('login.error_required_fields')
  }

  emptyLoginFields();
}
const emptyLoginFields = () => {
  loginUsername.value = "";
  loginPassword.value = "";
}
</script>

<style scoped>
.auth-page{
  min-height: 100vh;
  display: flex;
  /* align-items: center; */
  justify-content: center;
  padding: 24px;
}

/* keep container from stretching wide */
.auth-container{
  width: 100%;
  max-width: 520px;
}
</style>