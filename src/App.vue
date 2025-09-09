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

          <MDBNavbarItem v-if="login.isAuthenticated" class="me-3 me-lg-0 dropdown">
            <MDBDropdown v-model="userDropdown">
              <MDBDropdownToggle tag="a" class="nav-link" @click="userDropdown = !userDropdown">
                <MDBIcon icon="user" class="icon" />
              </MDBDropdownToggle>
              <MDBDropdownMenu class="dropdown-menu">
                <MDBDropdownItem href="#">Action</MDBDropdownItem>
                <MDBDropdownItem href="#">Another Action</MDBDropdownItem>
                <MDBDropdownItem href="#">Something else here</MDBDropdownItem>
                <MDBDropdownItem href="#" @click="logOut">Log out</MDBDropdownItem>
              </MDBDropdownMenu>
            </MDBDropdown>
          </MDBNavbarItem>

          <MDBNavbarItem v-else to="/login-register" class="me-3 me-lg-0" linkClass="link-secondary">
            Kirjaudu
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
        © 2025 Copyright: DUVA OY

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
import { ref, onMounted } from "vue";

import userService from './service/users.js';
import loginService from './service/login.js';
import {useLoginStore} from "@/stores/login.js";

const userData = ref("")
const userDropdown = ref(false);
const login = useLoginStore();

onMounted (() => {
  console.log("Mounted on start!");

  login.hydrate();
})
const addUser = async () => {
  const new_user = {
    username: "sama",
    password: "sama",
    firstname: "Sanna",
    lastname: "Marin"
  }

  const userAdded = await userService.addUser(new_user);
};
const logIn = async () => {
  let user = "";
  const userLogin = {
    username: 'sama',
    password: 'sama'
  }

  user = await loginService.login(userLogin)
  if (user.error !== "login error") {
    console.log("User logged in")
    login.onLogin(user);
  } else {
    console.log("No user logged in - " + user);
  }
}
const logOut = () => {
  login.onLogOut()
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
