<template>
  <MDBContainer>
    <div
      class="auth-tabs"
      :class="{
        'auth-tabs--login': !isRegister,
        'auth-tabs--register': isRegister
      }"
    >
      <MDBTabs v-model="form1ActiveTab">
        <MDBTabNav pills>
          <MDBTabItem
            @click="pressLoginTab"
            tabId="ex3-1"
            href="ex3-1"
          >
            {{ t('loginRegister.login') }}
          </MDBTabItem>

          <MDBTabItem
            @click="pressRegisterTab"
            tabId="ex3-2"
            href="ex3-2"
          >
            {{ t('loginRegister.register') }}
          </MDBTabItem>
        </MDBTabNav>
      </MDBTabs>
    </div>

    <div v-if="isRegister">
      <register-panel
        @register:data="handleRegister"
      />
    </div>

    <div v-else>
      <login-panel
        @login:data="userControl"
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
  import { useI18n } from 'vue-i18n';
  defineOptions({
    name: 'LoginRegister'
  })
  const {t} = useI18n();
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
.auth-tabs {
  width: 100%;
  margin: 20px auto 12px;
  transition: max-width 0.25s ease;
}

/* Login panel on 440px */
.auth-tabs--login {
  max-width: 440px;
}

/* Register panel on 560px */
.auth-tabs--register {
  max-width: 560px;
}

/* MDB nav */
.auth-tabs :deep(.nav) {
  width: 100%;
  display: flex;
  gap: 8px;

  margin: 0;
  padding: 0;
}

/* Mõlemad tabid võrdselt laiad */
.auth-tabs :deep(.nav-item) {
  flex: 1;
}

/* Tegelik MDB link/nupp */
.auth-tabs :deep(.nav-link) {
  width: 100%;

  /* See muudab tabi vertikaalselt suuremaks */
  min-height: 48px;
  padding: 12px 18px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #cbd5dc;
  background: #223340;

  border-radius: 10px;

  font-size: 14px;
  font-weight: 600;
  text-transform: none;

  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.auth-tabs :deep(.nav-link:hover) {
  color: #fff;
  background: #2f485a;
}

.auth-tabs :deep(.nav-link.active) {
  color: #fff;
  background: #37546a;
}

/* Telefonis mõlemad automaatselt ekraani laiuse järgi */
@media (max-width: 600px) {
  .auth-tabs--login,
  .auth-tabs--register {
    max-width: 100%;
  }

  .auth-tabs :deep(.nav-link) {
    min-height: 46px;
    padding: 11px 12px;
  }
}
</style>