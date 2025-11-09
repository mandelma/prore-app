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
              @click="router.push('/')"
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

          <!-- Client incomed offers -->
          <MDBNavbarItem  v-if="clientNewOffersAmount > 0 && route.name !== 'recipient-page'" @click="seeClientOffer" class="me-3 me-lg-5" linkClass="link-secondary">
            <MDBIcon  icon="bell" style="color: #0E7490;" class="icon"/>
            <MDBBadge  notification color="danger" pill>{{clientNewOffersAmount}}</MDBBadge>
          </MDBNavbarItem>
          <!-- Provider incomed offers-->
          <MDBNavbarItem  v-if="isIncomingOffers" @click="onIconBell" class="me-3 me-lg-5" linkClass="link-secondary">
            <MDBIcon  icon="bell" style="color: orange;" class="icon"/>
            <MDBBadge v-if="newOffersAmount > 0" notification color="danger" pill>{{newOffersAmount}}</MDBBadge>
          </MDBNavbarItem>

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
                  <RouterLink :to="{name: 'calendar', params: {count: 10}}" style="color: #ddd;" >Kalenteri</RouterLink>

                </MDBDropdownItem>
<!--                <MDBDropdownItem href="#">Something else here</MDBDropdownItem>-->
                <MDBDropdownItem v-if="client.isBookings" href="#">
                  <RouterLink to="/client-panel">Tilaukset</RouterLink>
                </MDBDropdownItem>
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
<!--      <RouterView-->
<!--          style="padding-top: 50px; text-align: center;"-->
<!--      />-->
      <RouterView
          style="padding-top: 50px; text-align: center;"
          v-slot="{Component}">
        <component
            :is="Component"
            :days="weekdays"
            :bookings="bookings"
            @createBookingMultiple="handleCreateBookingMultiple"
            @over="handleOver"

            @createPro="handleCreatePro"
            :provider="provider"

            :offersIn="incomingOffers ?? []"
            :isPro="isUserPro ?? false"
            :credit="proCredit ?? 0"
        />
      </RouterView>
    </main>

<!--    <h2>is user pro  {{isUserPro}}</h2><br>-->
<!--    <h2>incoming offers {{incomingOffers}}</h2><br>-->
<!--    <p>offers count {{incomingOffersCount}}</p><br>-->
<!--    <p>Credit left: {{proCredit}}</p><br>-->
<!--    <p>Incoming offers {{isIncomingOffers}}</p><br>-->
<!--    <p>booking {{bookings}}</p><br>-->
<!--    <p>Is bookings {{isBookings}}</p><br>-->
<!--    <p>Bookings count {{count}}</p><br>-->
<!--    <p>Is pro {{isUserPro}}</p>-->



<!--    <p v-if="isLoading">Loading…</p>-->
<!--    <p v-else-if="error" class="text-red-600">{{ error }}</p>-->
<!--    <template v-else>-->
<!--      <h2>My bookings ({{ count }})</h2>-->
<!--      <ul v-if="bookings.length">-->
<!--        <li v-for="b in bookings" :key="b.id">-->
<!--          {{ b.header }} — {{ b.date }}-->
<!--        </li>-->
<!--      </ul>-->
<!--      <p v-else>No bookings yet.</p>-->
<!--    </template>-->

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

import { ref, watch, onMounted } from "vue";
import { storeToRefs } from 'pinia';
import language from './components/LanguageContents.vue'
import userService from './service/users.js';
import loginService from './service/login.js';
import { useLoginStore } from "@/stores/login.js";
import { useClientStore} from "@/stores/recipientStore.js";
import { useProStore } from '@/stores/providerStore.js';


import {useI18n} from "vue-i18n/dist/vue-i18n";
import LanguageContents from "@/components/LanguageContents.vue";
//import { loadGoogleMap } from "@/components/controllers/loadGoogleMap.js"
import recipientService from './service/recipients.js'
import providerService from './service/providers.js'
import onMap from '@/components/controllers/distance'
import socket from "@/socket";
const router = useRouter();
const route = useRoute();
const userID = ref('');
const username = ref('')
let userDropdown = ref(false);
const login = useLoginStore();
import { useRoute, useRouter } from "vue-router";
const { t } = useI18n();
const client = useClientStore();
const handleProvider = useProStore();
const { bookings, isBookings, clientNewOffers, clientNewOffersAmount, count, isLoading, error } = storeToRefs(client)
const { isUserPro, provider, proCredit, isIncomingOffers, incomingOffers, newOffersAmount, incomingOffersCount, isProStateLoading, proError } = storeToRefs(handleProvider);
const test = ref(null);
const bb = ref(null)

const weekdays = ["Mon","Tue", "Wed"];

// watch(() => login.user?.id, async (id) => {
//   if (id) {
//     await client.orderList(id)
//     console.log("IsBookings - " + client.isBookings)
//     console.log("AUTH " + login.isAuthenticated)
//     console.log('Client orders count is', count.value)
//   }
// }, { immediate: true })

onMounted (async () => {
  console.log("Mounted on start!");
  //console.log('PROCESS ENV ' + process.env.NODE_ENV)
  //client.orderList(login.user.id);


  await login.hydrate();
  if (login.user) {
    const user = login.user;

    userID.value = user.id;
    username.value = user.username;
    await client.orderList(user.id);
    await handleProvider.getProState(user.id);
    //joinServer (user.id, user.username);
  }

  joinServer();

  console.log("IsBookings - " + client.isBookings)
  console.log("AUTH " + login.isAuthenticated)
  console.log('Client orders count is', count.value)

  //console.log("ID " + login.user.id)


})

const joinServer = () => {

  listen();
}
const listen = async() => {
  socket.on('create booking mtp', async(id, bookingId, proIdArr) => {
    console.log("GOT THE BOOKING " + bookingId + ": ");
    console.log("Booking id + " + bookingId)
    const b = await recipientService.getBookingById(bookingId);
    bb.value = b
    if (userID.value === id) {
      //await handleProvider.addBooking(bookingID);
      await handleProvider.upsertBooking(b);
    }
  })
  socket.on('client use offer', async(bookingID, offer) => {
    console.log("I got the offer - " + offer.name);
    await client.getProviderOffer(bookingID, offer);
  })
  socket.on('pro-handle-confirmed', async({sender, orderId, offerId}) => {
    console.log("PRO GOT IT - " + orderId);
    await handleProvider.handleConfirmed(orderId);
  })
}

const handleCreatePro = (pro) => {
  handleProvider.createPro(pro);
}

// Client created booking and finding matching providers to send this booking to
const handleCreateBookingMultiple = async (booking) => {

  console.log("Booking zone - " + booking.zone);
  booking.ordered = [];
  //const createBookingStatus = await recipientService.updateRecipient(booking.id, {status: "notSeen"});
  let origin = [booking.latitude, booking.longitude];
  let destination = [];
  const providersForBooking = await providerService.getProvidersMatchingByProfession(
      {result: booking.professional}
  )

  client.createBooking(booking);

  console.log("Professional. " + booking.professional)

  let proIdArr = [];

  let orderedBookings = [];

  for (let i = 0; i < providersForBooking.length; i++) {
    if (providersForBooking[i].user.id !== userID.value) {

    }

    destination = [providersForBooking[i].latitude, providersForBooking[i].longitude];
    console.log("Pro id " + providersForBooking[i].id);
    //if (providersForBooking[i].user.id !== userInID.value) {
      if (booking.zone === 0) {

        if (providersForBooking[i].user.id !== userID) {
          console.log("PRP ID, zone is 0: " + providersForBooking[i].user.id)

          orderedBookings = [
            ...orderedBookings,
            providersForBooking[i]
          ]

          if (providersForBooking[i].user.id !== userID) {
            proIdArr = [
              ...proIdArr,
              providersForBooking[i].user.id
            ]
          }

          await recipientService.addProviderData(booking.id, providersForBooking[i].id);
          await providerService.addProviderBooking(providersForBooking[i].id, booking.id);
        }
      } else {
        onMap.findDistance(origin, destination)
            .then(async (data) => {
              console.log("Data distance: " + data.distance)
              console.log("Data duration: " + data.duration)
              console.log("Data distance type - " + typeof data.distance);

              if (parseInt(data.distance) < booking.zone) {
                booking.ordered = [
                  ...booking.ordered,
                  providersForBooking[i]
                ]
                if (providersForBooking[i].user.id !== userID) {
                  console.log("PRP ID: " + providersForBooking[i].user.id)
                  proIdArr = [
                    ...proIdArr,
                    providersForBooking[i].user.id
                  ]

                }
                await recipientService.addProviderData(booking.id, providersForBooking[i].id);
                await providerService.addProviderBooking(providersForBooking[i].id, booking.id);

              }
            })
      }
    //}



  }
  // if (_image) {
  //   booking.image = [];
  //   booking.image = booking.image.concat(_image);
  //   console.log("IMAGE DATA " + image.name)
  // }
  console.log("proIdArr length is " + proIdArr.length)

  if (proIdArr.length > 0) {
    socket.emit('create booking multiple - pro', proIdArr, booking.id);
  }




  booking.ordered = orderedBookings;


  await router.push('/client-panel');

  //const proBooking = await recipientService.getBookingById(booking.id);
  //socket.emit("send created booking", proIdArr, proBooking);
  //this.recipientBookings = this.recipientBookings.concat(booking);
}

const handleOver = (greeting) => {
  test.value = greeting;
}
const logOut = () => {
  login.onLogOut()
  router.push('/');
}

const onIconBell = () => {
  console.log("Clicked on icon ");
  router.push("/client-offers");
}
const seeClientOffer = () => {
  console.log("opening the offer");
  router.push('/client-panel');
}


</script>

<style>
html, body { height: 100%; }            /* ensures the body can size to the viewport */
body {
  /* better on mobile (address bar) */
  /* display: flex;
  flex-direction: column; */
}
</style>
