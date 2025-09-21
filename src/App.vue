<template>
<!--  light-->
<!--  style="background-color: #275155"-->
  <div class="app-shell">
    <MDBNavbar class="dark" position="top" container expand="lg">
      <div class="d-flex align-items-center w-100">
        <MDBNavbarBrand class="me-2">
          <MDBIcon
              icon="home"
              class="icon-active"

              style="cursor: pointer; font-size: 26px;"
              @click="$router.push('/')"
          />
        </MDBNavbarBrand>
<!--        me-lg-0-->

        <MDBNavbarNav right class="ms-auto d-flex flex-row align-items-center gap-2">
<!--          <MDBNavbarItem class="me-3 me-lg-5" linkClass="link-secondary">-->
<!--            <MDBIcon icon="calendar" class="icon" @click="$router.push('calendar')" />-->

<!--          </MDBNavbarItem>-->
<!--          <MDBNavbarItem class="me-3 me-lg-5" linkClass="link-secondary">-->
<!--            <MDBIcon icon="comment" class="icon" />-->
<!--            <MDBBadge notification color="danger" pill>2</MDBBadge>-->
<!--          </MDBNavbarItem>-->
<!--          <MDBNavbarItem class="me-3 me-lg-5" linkClass="link-secondary">-->
<!--            <MDBIcon icon="comments" class="icon" />-->
<!--          </MDBNavbarItem>-->
<!--          <MDBNavbarItem class="me-3 me-lg-5" linkClass="link-secondary">-->
<!--            <MDBIcon icon="bell" style="color: #0E7490;" class="icon" />-->
<!--          </MDBNavbarItem>-->

<!--          <MDBNavbarItem class="me-3 me-lg-5" linkClass="link-secondary">-->
<!--            <MDBIcon icon="bell" style="color: orange;" class="icon" @click="onIcon" />-->
<!--            <MDBBadge notification color="danger" pill>1</MDBBadge>-->
<!--          </MDBNavbarItem>-->
          <MDBNavbarItem class="me-3 me-lg-5" linkClass="link-secondary">
            <language-contents />
          </MDBNavbarItem>
          <MDBNavbarItem v-if="login.isAuthenticated" class="me-3 me-lg-0 dropdown">
            <MDBDropdown v-model="userDropdown">
              <MDBDropdownToggle tag="a" class="nav-link" @click="userDropdown = !userDropdown">
                <MDBIcon icon="user" class="icon" />
              </MDBDropdownToggle>
              <MDBDropdownMenu class="dropdown-menu" >
<!--                <MDBDropdownItem href="#">Action</MDBDropdownItem>-->
                <MDBDropdownItem style="color: #ddd;" href="">
                  <RouterLink to="/calendar" >Kalenteri</RouterLink>
                </MDBDropdownItem>
<!--                <MDBDropdownItem href="#">Something else here</MDBDropdownItem>-->
                <MDBDropdownItem style="color: #ddd;" href="#" @click="logOut">Log out</MDBDropdownItem>
              </MDBDropdownMenu>
            </MDBDropdown>
          </MDBNavbarItem>

          <MDBNavbarItem v-else to="/login-register" class="me-3 me-lg-0" linkClass="link-secondary">
            {{t('login')}}
          </MDBNavbarItem>
        </MDBNavbarNav>
      </div>
    </MDBNavbar>
    <!--      <MDBNavbarItem href="#" class="me-3 me-lg-0">-->
    <!--        <img-->
    <!--            src="https://mdbootstrap.com/img/Photos/Avatars/img (31).jpg"-->
    <!--            class="rounded-circle"-->
    <!--            height="22"-->
    <!--            alt=""-->
    <!--            loading="lazy"-->
    <!--        />-->
    <!--      </MDBNavbarItem>-->

<!--    <router-view />-->
    <main class="container py-4" style=" flex: 1;">
      <RouterView style="padding-top: 50px; text-align: center;"/>
    </main>

    <MDBFooter

        bg="none"
        :text="['center', 'white']"
        style="background-color: #0F172A; margin-top: auto;"
      >
      <!-- Grid container -->
      <MDBContainer class="p-4 pb-0">
        <!-- Section: CTA -->
<!--        <section class="">-->
<!--          <p class="d-flex justify-content-center align-items-center">-->
<!--            <span class="me-3">Register for free</span>-->
<!--            <MDBBtn outline="light" rounded> Sign up! </MDBBtn>-->
<!--          </p>-->
<!--        </section>-->
        <!-- Section: CTA -->
      </MDBContainer>
      <!-- Grid container -->
      <!-- Copyright -->
      <div
          class="text-center p-3"
          style="background-color: rgba(0, 0, 0, 0.2); color: #7F8A9A;"
      >
        © 2025 Copyright: DuVa OY

      </div>
      <!-- Copyright -->
    </MDBFooter>
  </div>




</template>

<script setup>
import {
  MDBBtn,
  MDBDateTimepicker,
  MDBNavbar,
  MDBNavbarToggler,
  MDBNavbarBrand,
  MDBNavbarItem,
  MDBNavbarNav,
  MDBDropdown,
  MDBDropdownItem,
  MDBDropdownMenu,
  MDBDropdownToggle,
  MDBIcon,
  MDBBadge,
  MDBInput,
  MDBCollapse,
  MDBFooter,
  MDBContainer
} from 'mdb-vue-ui-kit';
//import Calendar from './components/Calendar.vue'
import { ref, onMounted } from "vue";
import language from './components/LanguageContents.vue'
import userService from './service/users.js';
import loginService from './service/login.js';
import { useLoginStore } from "@/stores/login.js";

import {useI18n} from "vue-i18n/dist/vue-i18n";
import LanguageContents from "@/components/LanguageContents.vue";
import { loadGoogleMap } from "@/components/controllers/loadGoogleMap.js"
const router = useRouter();
const userData = ref("")
const userDropdown = ref(false);
const login = useLoginStore();
import { useRouter } from "vue-router";
const { t } = useI18n();
onMounted (async () => {
  console.log("Mounted on start!");
  console.log("ENV variable: " + import.meta.env.VITE_APP_MAP_KEY);
  login.hydrate();

  if (!window.google) {
    await loadGoogleMap();
    // const script = document.createElement("script");
    // script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.VUE_APP_MAP_KEY}&libraries=places,geometry&v=beta`;
    // script.async = true;
    // script.defer = true;
    // document.head.appendChild(script);
    console.log("Map is inited in APP!");
  }
})
// const addUser = async () => {
//   const new_user = {
//     username: "sama",
//     password: "sama",
//     firstname: "Sanna",
//     lastname: "Marin"
//   }
//
//   const userAdded = await userService.addUser(new_user);
// };
// const logIn = async () => {
//   let user = "";
//   const userLogin = {
//     username: 'sama',
//     password: 'sama'
//   }
//
//   user = await loginService.login(userLogin)
//   if (user.error !== "login error") {
//     console.log("User logged in")
//     login.onLogin(user);
//   } else {
//     console.log("No user logged in - " + user);
//   }
// }
const logOut = () => {
  login.onLogOut()
  router.push('/');
  // "mdb-vue-ui-kit": "file:../../OneDrive/Desktop/mdb5-vue-ui-kit-pro-essential-master.tar.gz",

  //"mdb-vue-ui-kit": "file:server/vendor/mdb-vue-ui-kit.tgz",

  //"mdb-vue-ui-kit": "file:vendor/mdb-vue-ui-kit.tgz",
  // "^20.19.0 || >=22.12.0"
}

const onIcon = () => {
  console.log("Clicked on icon ")
}


</script>

<style>
html, body { height: 100%; }            /* ensures the body can size to the viewport */
body {
  /* better on mobile (address bar) */
  display: flex;
  flex-direction: column;
}
</style>
