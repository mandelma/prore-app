<template>
  <div>
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
        <template #title> TAPAHTUI VIRHE! </template>
        <button type="button" style="visibility: hidden;" class="btn-close ms-auto" aria-label="Close" @click="hideError"></button>
        <template #small></template>
        Väärä käyttäjätunnus tai salasana!
      </MDBToast>
    </div>



    <form class="form-card" @submit.prevent="userLoginData" autocomplete="off">
      <MDBInput
          type="text"
          size="lg"
          label="Käyttäjätunnus"
          id="loginUsername"
          v-model="loginUsername"

          wrapperClass="mb-4"
      />

      <!-- Password input -->
      <MDBInput

          type="password"
          size="lg"
          label="Salasana"
          id="loginPassword"
          v-model="loginPassword"
          wrapperClass="mb-4"
      />

      <!-- 2 column grid layout for inline styling -->
      <MDBRow class="mb-4">
        <MDBCol class="d-flex justify-content-center">
          <!-- Checkbox -->
          <MDBCheckbox
              label="Muista minut"
              id="loginCheck"
              v-model="loginCheck"
              wrapperClass="mb-3 mb-md-0"
          />
        </MDBCol>

        <MDBCol>
          <!-- Simple link -->
          <router-link to="/forgot_auth">Forgot password</router-link>
          <!--          <a href="/recipients">Unohtuiko salasana?</a>-->
        </MDBCol>
      </MDBRow>

      <!-- Submit button -->
      <MDBBtn color="primary" size="lg" type="submit" block class="mb-4"> Kirjaudu </MDBBtn>

      <!-- Register buttons -->
      <div class="text-center">
        <p style="color: #22D3EE;">Ei jäsen? <span id="reg" @click="$router.push('/register-panel')" style="cursor: pointer; color: #0E7490;">rekisteröidy</span></p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { MDBContainer, MDBInput, MDBBtn, MDBRow, MDBCol, MDBCheckbox, MDBToast } from "mdb-vue-ui-kit";
import { ref } from 'vue';
import loginService from '@/service/login.js';
import {useLoginStore} from "@/stores/login.js";
import { useRouter } from 'vue-router';
defineOptions({
  name: 'LoginForm'
  // you can also set other options here if needed
})
const loginUsername = ref("");
const loginPassword = ref("");
const loginCheck = ref(true);
const userApp = useLoginStore();
const router = useRouter();
const loginError = ref(false);
const showError = () => { loginError.value = true }
const hideError = () => { loginError.value = false }
const isLoginError = ref(false);

const userLoginData = async () => {
  let user;
  const userLogin = {
    username: loginUsername.value,
    password: loginPassword.value
  }

  console.log("Filled username: " + loginUsername.value);

  if (loginUsername.value !== "" && loginPassword.value !== "") {
    user = await loginService.login(userLogin)
    if (user.error !== "login error") {
      console.log("User just logged in!");
      userApp.onLogin(user);
      //await router.push({name: 'Home'});
    } else {
      console.log("No user logged in");
      loginError.value = true;
      // this.loginError = "Väärä Käyttäjätunnus tai salasana!"
      // setTimeout(() => {
      //   loginError.value = false;
      // }, 2000);
    }
  } else {
    console.log("Error - Kaikki kentät täytettävä!")
    loginError.value = true;
    // this.loginErrorMessage = "kaikki kentät on täytettävä!"
    // setTimeout(() => {
    //   this.loginErrorMessage = null
    // }, 2000);
  }

  //this.$emit('login:data', userLogin)
  emptyLoginFields();
}
const emptyLoginFields = () => {
  loginUsername.value = "";
  loginPassword.value = "";
}
</script>

<style scoped>

</style>