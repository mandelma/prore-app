<template>
  <MDBContainer >
    <div style="padding: 13px 0 20px 0;">
      <MDBToast
          v-model="isRegisterError"
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
        {{currentErrorMessage}}
      </MDBToast>
    </div>

    <form class="form-card" @submit.prevent="submitUser" autocomplete="off">
      <!-- 2 column grid layout with text inputs for the first and last names -->
      <!-- First name input -->

      <MDBInput
          type="text"
          size="lg"
          label="Etunimi"

          id="registerFirstName"
          v-model="registerFirstName"
          wrapperClass="mb-4"

      />

      <!-- Last name input -->
      <MDBInput
          type="text"
          size="lg"
          label="Sukunimi"

          id="registerLastName"
          v-model="registerLastName"
          wrapperClass="mb-4"
      />

      <!-- Username input -->
      <MDBInput
          type="text"
          size="lg"
          label="käyttäjätunnus"

          id="registerUsername"
          v-model="registerUsername"
          wrapperClass="mb-4"
      />
      <!-- Email input -->
      <MDBInput
          type="text"
          size="lg"
          label="Email"

          id="registerEmail"
          v-model="registerEmail"
          wrapperClass="mb-4"
      />

      <div class="input-group mb-3">
        <!-- MDB input inside input-group -->
        <MDBInput

            size="lg"
            v-model="registerPassword"
            :type="showPassword ? 'text' : 'password'"
            label="Anna salasana"
            wrapperClass="form-outline flex-grow-3"
            :inputClass="'ps-0'"
            aria-describedby="button-addon2"
        />

        <MDBBtn  style="border: 1px white;" type="button">
          <i :class="!showPassword ? 'far fa-eye' : 'far fa-eye-slash'" style="color: #dddddd;" @click="togglePassword"></i>
        </MDBBtn>
      </div>





      <p v-if="pwValidateError && registerPassword" style="color: palevioletred" >{{pwValidateError}}</p>


      <div class="input-group mb-3">
        <!-- MDB input inside input-group -->
        <MDBInput
            size="lg"
            v-model="registerPasswordRepeat"
            :type="showConfirmPassword ? 'text' : 'password'"
            label="Toista salasana"
            wrapperClass="form-outline flex-grow-3"
            :inputClass="'ps-0'"
            aria-describedby="button-addon2"
        />

        <MDBBtn  style="border: 1px white;" type="button">
          <i :class="!showConfirmPassword ? 'far fa-eye' : 'far fa-eye-slash'" style="color: #dddddd;" @click="toggleConfirmPassword"></i>
        </MDBBtn>
      </div>

      <p v-if="pwConfirmValidateError && registerPasswordRepeat" style="color: palevioletred" >{{pwConfirmValidateError}}</p>


      <!-- Checkbox -->
      <MDBCheckbox
          label="Muista minut"

          size="lg"
          id="registerSubscribeCheck"
          v-model="registerSubscribeCheck"
          wrapperClass="d-flex justify-content-center mb-4"
      />

      <!--        <input required="required" v-model="registerEmail" :error-messages="emailErrors"-->
      <!--               @input="$v.registerEmail.$touch()" @blur="$v.registerEmail.$touch()" label="Email"-->
      <!--               />-->

      <!-- Submit button -->
      <div class="form-actions">
        <MDBBtn color="primary" size="lg" type="submit"  block class="mb-4" :disabled="!!pwValidateError"> Luo tili </MDBBtn>
      </div>


    </form>
  </MDBContainer>
</template>

<script setup>
import { MDBContainer, MDBInput, MDBBtn, MDBCheckbox, MDBToast, MDBIcon} from "mdb-vue-ui-kit";
import { ref, watch } from 'vue';
import userService from '@/service/users.js';
import loginService from '@/service/login.js';
import {useLoginStore} from "@/stores/login.js";

defineOptions({
  name: 'RegisterForm'
  // you can also set other options here if needed
})
const registerFirstName = ref("");
const registerLastName = ref("");
const registerUsername = ref("");
const registerEmail = ref("");
const registerPassword = ref("");
const registerPasswordRepeat = ref("");
const registerSubscribeCheck = ref(true);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isRegisterError = ref(false);
const pwValidateError = ref("");
const pwConfirmValidateError = ref("");
const registerErrorMessage = ref("");
const registerEmailErrorMessage = ref("");
const registerPwRepeatErrorMessage = ref("");
const usernameExisting = ref("");
const currentErrorMessage = ref("");
const login = useLoginStore();
const hideError = () => { isRegisterError.value = false }

const togglePassword = () => {
  console.log("Password is toggled")
  showPassword.value = !showPassword.value
}
const toggleConfirmPassword = () => {
  console.log("Password confirm is toggled!");
  showConfirmPassword.value = !showConfirmPassword.value;
}
const validatePassword = () => {
  const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!regex.test(registerPassword.value)) {
    pwValidateError.value = "Salasanan on oltava vähintään 8 merkkiä pitkä ja sen on sisällettävä iso kirjain, numero ja erikoismerkki.";
  } else {
    pwValidateError.value = "";
  }
}
const validateConfirmPassword = () => {
  const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!regex.test(registerPasswordRepeat.value)) {
    pwConfirmValidateError.value = "Salasanan on oltava vähintään 8 merkkiä pitkä ja sen on sisällettävä iso kirjain, numero ja erikoismerkki.";
  } else {
    pwConfirmValidateError.value = "";
  }
}
watch(registerPassword, (newValue) => {
  validatePassword(newValue);
})

watch(registerPasswordRepeat, (newValue) => {
  validateConfirmPassword(newValue);
})

const submitUser = async () => {
  //isRegisterError.value = false;
  const newUser = {
    firstName: registerFirstName.value,
    lastName: registerLastName.value,
    username: registerUsername.value,
    email: registerEmail.value,
    password: registerPassword.value
  }
  if (registerFirstName.value !== ""
      && registerLastName.value !== ""
      && registerUsername.value !== ""
      && registerPassword.value !== ""
      && registerEmail.value !== ""
  ) {

    if (registerUsername.value.length < 4) {
      isRegisterError.value = true;
      currentErrorMessage.value = "Username must be longer than 4 characters!"
      //registerErrorMessage.value = "Username must be longer than 4 characters!"

    } else if (!/^[^@]+@\w+(\.\w+)+\w$/.test(registerEmail.value)) {
      isRegisterError.value = true;
      currentErrorMessage.value = "Anna kelvollinen sähköpostiosoite!"
      //registerEmailErrorMessage.value = "Anna kelvollinen sähköpostiosoite!";
      // setTimeout(() => {
      //   this.registerEmailErrorMessage = null;
      // }, 2000);
    } else if (registerPassword.value !== registerPasswordRepeat.value) {
      isRegisterError.value = true;
      currentErrorMessage.value = "Salasana on oltava sama!";
      //registerPwRepeatErrorMessage.value = "Salasana on oltava sama!";
    }
    else {
      console.log("Uus kasutaja")
      const userExisting = await userService.addUser(newUser);
      if (userExisting.error === "username existing") {
        isRegisterError.value = true;
        currentErrorMessage.value = "Käyttäjätunnus on jo olemassa! Vaihda käyttäjätunnus";
        //usernameExisting.value = "Käyttäjätunnus on jo olemassa! Vaihda käyttäjätunnus";

      } else if (userExisting.error === "email existing") {
        isRegisterError.value = true;
        currentErrorMessage.value = "Antamasi sähköpostiosoite on jo olemassa!";
        //registerEmailErrorMessage.value = "Antamasi sähköpostiosoite on jo olemassa!";
      }
      else {

        console.log("registerFirstName " + registerFirstName.value)
        console.log("registerLastName " + registerLastName.value)
        console.log("registerUsername " + registerUsername.value)
        console.log("registerPassword " + registerPassword.value)
        console.log("registerEmail " + registerEmail.value)
        const loggedInUser = await loginService.login({username: registerUsername.value, password: registerPassword.value});
        console.log("LOgin error: " + loggedInUser.error)
        if (loggedInUser.error !== "login error") {
          //this.$emit('register:data', loggedInUser)
          login.onLogin(loggedInUser);
          checkFieldValues();

        } else {
          console.log("Error with login! " + loggedInUser.error)

        }
      }

    }
  } else {
    isRegisterError.value = true;
    currentErrorMessage.value = "Kaikki kentät ovat täytettävä!!"
    //registerErrorMessage.value = "Kaikki kentät ovat täytettävä!!"
  }
}

const checkFieldValues = () => {
  console.log("registerFirstName " + registerFirstName.value)
  console.log("registerLastName " + registerLastName.value)
  console.log("registerUsername " + registerUsername.value)
  console.log("registerPassword " + registerPassword.value)
  console.log("registerEmail " + registerEmail.value)

}

</script>

<style >

</style>