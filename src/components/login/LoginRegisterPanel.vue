<template>
  <MDBContainer>
    <MDBTabs v-model="form1ActiveTab">
      <MDBTabNav pills justify tabsClasses="mb-3" style="margin: auto;">
        <MDBTabItem style="background-color: #37546a; color: #ddd;" @click="pressLoginTab" tabId="ex3-1" href="ex3-1"
        >Kirjaudu</MDBTabItem
        >
        <MDBTabItem style="background-color: #223340; color: #ddd;" @click="pressRegisterTab" tabId="ex3-2" href="ex3-2"
        >Registeröidy</MDBTabItem
        >
      </MDBTabNav>


    </MDBTabs>

    <div v-if="isRegister">
      <register-panel
          @register:data = handleRegister
      />
    </div>

    <div v-else>
      <login-panel
          @login:data = userControl
      />
    </div>

  </MDBContainer>
</template>

<script setup>
  import {
    MDBContainer, MDBTabs, MDBTabNav, MDBTabItem
  } from 'mdb-vue-ui-kit';
  import { ref } from 'vue';
  import LoginPanel from '@/components/login/LoginForm.vue'
  import RegisterPanel from '@/components/login/RegisterForm.vue'
  defineOptions({
    name: 'LoginRegister'
    // you can also set other options here if needed
  })
  const form1ActiveTab = ref('ex3-1')
  const isLogin = ref(true)
  const isRegister = ref(false);

  const pressLoginTab = () => {
    isLogin.value = true;
    isRegister.value = false;
  }
  const pressRegisterTab = () => {
    isRegister.value = true;
    isLogin.value = false;
  }
</script>

<style scoped>

</style>