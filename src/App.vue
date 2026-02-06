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
          <MDBNavbarItem  v-if="newOffersAmount > 0" @click="onIconBell" class="me-3 me-lg-5" linkClass="link-secondary">
            <MDBIcon  icon="bell" style="color: orange;" class="icon"/>
            <MDBBadge v-if="newOffersAmount > 0" notification color="danger" pill>{{newOffersAmount}}</MDBBadge>
          </MDBNavbarItem>

          <MDBNavbarItem class="me-3 me-lg-5" linkClass="link-secondary">
            <language-contents />
          </MDBNavbarItem>
          <!--User-->
          <MDBNavbarItem v-if="login.isAuthenticated" class="me-3 me-lg-0 dropdown">
            <MDBDropdown v-model="userDropdown">
              <MDBDropdownToggle tag="a" class="nav-link" @click="userDropdown = !userDropdown">
                <MDBIcon icon="user" class="icon" />
                <MDBBadge v-if="newNotesCount > 0" notification color="danger" pill>{{newNotesCount}}</MDBBadge>
              </MDBDropdownToggle>
              <MDBDropdownMenu class="dropdown-menu" >

                <!-- <MDBDropdownItem href="#">
                  <RouterLink to="/profile" style="color: #ddd;">Profile</RouterLink>
                </MDBDropdownItem> -->
                <MDBDropdownItem :tag="RouterLink" to="/profile" class="dd-item">
                  Profile
                </MDBDropdownItem>

                <MDBDropdownItem v-if="notifications.length" :tag="RouterLink" to="/notifications" class="dd-item" @click="handleShowNotifications">
                  Viestit
                  <MDBBadge v-if="newNotesCount > 0" color="danger" class="ms-2">{{ newNotesCount }}</MDBBadge>
                </MDBDropdownItem>

                <!-- <MDBDropdownItem v-if="notifications.length" style="color: #ddd;" href="" @click="handleShowNotifications">
                  <RouterLink to="/notifications" style="color: #ddd;" >
                    Viestit
                    <MDBBadge v-if="notifications.length" color="danger" class="ms-2">{{ newNotesCount }}</MDBBadge>
                     
                  </RouterLink>
                </MDBDropdownItem> -->

                <MDBDropdownItem :tag="RouterLink" to="/calendar" class="dd-item">
                  Kalenteri
                </MDBDropdownItem>

                <!-- <MDBDropdownItem style="color: #ddd;" href="">
                  <RouterLink :to="{name: 'calendar', params: {count: 10}}" style="color: #ddd;" >Kalenteri</RouterLink>

                </MDBDropdownItem> -->

                <MDBDropdownItem :tag="RouterLink" to="/rules" class="dd-item">
                  Säännöt
                </MDBDropdownItem>

                <!-- <MDBDropdownItem href="#">
                  <RouterLink to="/rules" style="color: #ddd;">Rules</RouterLink>
                </MDBDropdownItem> -->

                <MDBDropdownItem :tag="RouterLink" to="/manual" class="dd-item">
                  Manual
                </MDBDropdownItem>


                <!-- <MDBDropdownItem href="#">
                  <RouterLink to="/manual" style="color: #ddd;">Manual</RouterLink>
                </MDBDropdownItem> -->

                <MDBDropdownItem v-if="client.isBookings" :tag="RouterLink" to="/client-panel" class="dd-item">
                  Tilaukset
                </MDBDropdownItem>


                <!-- <MDBDropdownItem v-if="client.isBookings" href="#">
                  <RouterLink to="/client-panel" style="color: #ddd;">Tilaukset</RouterLink>
                </MDBDropdownItem> -->

                <MDBDropdownItem :tag="RouterLink" to="/" @click="logOut" class="dd-item">
                  Kirjaudu ulos
                </MDBDropdownItem>


                
                <!-- <MDBDropdownItem style="color: #ddd;"  @click="logOut">Log out</MDBDropdownItem> -->
              </MDBDropdownMenu>
            </MDBDropdown>
          </MDBNavbarItem>

          <!-- <MDBNavbarItem v-else to="/login-register" class="me-3 me-lg-0" linkClass="link-secondary">
            {{t('login')}}
          </MDBNavbarItem> -->
          <MDBNavbarItem v-else :tag="RouterLink" to="/login-register" class="me-3 me-lg-0" linkClass="link-secondary">
            {{t('login')}}
          </MDBNavbarItem>
        </MDBNavbarNav>
      </div>
    </MDBNavbar>

    <MDBToast
      :stacking="false"
      autohide
      :delay="3000"
      v-model="isOrderConfirmed"
      position="top-center"
      toast="success"
      icon="fas fa-check fa-lg me-2"
    >
      <button type="button" style="visibility: hidden;" class="btn-close ms-auto" aria-label="Close" @click="hideError"></button>
      <template #title> PROKEIKKATORI </template>
      <!-- <template #small> 11 mins ago </template> -->
      {{ confirmedOrderMessage }}
    </MDBToast>
    <!--      <MDBNavbarItem href="#" class="me-3 me-lg-0">-->
    <!--        <img-->
    <!--            src="https://mdbootstrap.com/img/Photos/Avatars/img (31).jpg"-->
    <!--            class="rounded-circle"-->
    <!--            height="22"-->
    <!--            alt=""-->
    <!--            loading="lazy"-->
    <!--        />-->
    <!--      </MDBNavbarItem>-->

<!--    <router-view />   class="container py-4" -->
    <main class="app-content" style=" flex: 1;">

      <RouterView
          v-slot="{Component}">
        <div v-if="!$route.path.startsWith('/login')" class="page-wrap">
          <component
            :is="Component"
            :days="weekdays"
            :bookings="bookings"
            @createBookingMultiple="handleCreateBookingMultiple"
            @over="handleOver"

            @confirm-order-toast="hConfirmOrderToast"

            :provider="provider"

            :offersIn="incomingOffers ?? []"
            :isPro="isUserPro ?? false"
            :credit="proCredit ?? 0"
          />
        </div>
        <component
          v-else
          :is="Component"
        />
      </RouterView>
    </main>

    <chat-widget 
      v-if="login.isAuthenticated && conversations.length"
      :isOpenWidget="openChat"
    />
    
    



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
         <section>

         </section>
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
  MDBToast,
  MDBFooter,
  MDBContainer
} from 'mdb-vue-ui-kit';

import { ref, watch, onMounted, onBeforeMount,  computed } from "vue";
import { storeToRefs } from 'pinia';
import language from './components/LanguageContents.vue'
import userService from './service/users.js';
import loginService from './service/login.js';
import ChatWidget from './components/ChatWidget.vue';
import { useLoginStore } from "@/stores/login.js";
import { useUserStore } from './stores/userStore';
import { useClientStore} from "@/stores/recipientStore.js";
import { useNotificationStore } from './stores/notificationStore';
import { useProStore } from '@/stores/providerStore.js';
import { useConversationStore } from './stores/conversationStore';


import {useI18n} from "vue-i18n/dist/vue-i18n";
import LanguageContents from "@/components/LanguageContents.vue";
//import { loadGoogleMap } from "@/components/controllers/loadGoogleMap.js"
import recipientService from './service/recipients.js';
import providerService from './service/providers.js';
import { chatService } from './service/chat';
import onMap from '@/components/controllers/distance';
import socket from "@/socket";

const router = useRouter();
const route = useRoute();
const userID = ref('');
const username = ref('')
let userDropdown = ref(false);
const login = useLoginStore();
import { useRoute, useRouter } from "vue-router";
const { t } = useI18n();

const userStore = useUserStore();
const client = useClientStore();
const handleProvider = useProStore();
const notificationStore = useNotificationStore();
const conversationStore = useConversationStore();

const { bookings, isBookings, clientNewOffers, clientNewOffersAmount, count, isLoading, error } = storeToRefs(client)
const { isUserPro, provider, proCredit, isIncomingOffers, incomingOffers, newOffersAmount, incomingOffersCount, isProStateLoading, proError } = storeToRefs(handleProvider);
const { notifications, newNotesCount } = storeToRefs(notificationStore);
const { openChat, conversations, totalUnread } = storeToRefs(conversationStore);

const isOrderConfirmed = ref(false);
const confirmedOrderMessage = ref("");

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

/* watch(
  async () => login.isAuthenticated,
  async (isAuth) => {
    if (isAuth) {
      const user = login.user;

    userStore.fetchMe();

    userID.value = user.id;
    username.value = user.username;
    await client.orderList(user.id);
    await handleProvider.getProState(user.id);
    await notificationStore.handleNotifications(user.id);
    conversationStore.initSocket();
    await conversationStore.getConversations();
    }
  }
) */

let bootstrappedForUserId = null;

watch(
  () => login.isAuthenticated,
  async (isAuth) => {
    if (!isAuth) {
      if (login.hydrated) {
        conversationStore.disconnect?.();
      }
      bootstrappedForUserId = null;
      // IMPORTANT: cleanup stuff that must stop on logout
      //conversationStore.disconnect?.(); // if you have it
      //notificationStore.reset?.();
      return;
    }

    const u = login.user;
    if (!u?.id) return;

    // Prevent re-running everything if watcher fires again
    if (bootstrappedForUserId === u.id) return;
    bootstrappedForUserId = u.id;

    userID.value = u.id;
    username.value = u.username;

    // If these are independent, run in parallel
    await Promise.all([
      userStore.fetchMe(),
      client.orderList(u.id),
      handleProvider.getProState(u.id),
      notificationStore.handleNotifications(u.id),
    ]);

    if (login.isAuthenticated) {
      conversationStore.initSocket();
      await conversationStore.getConversations();
    }

    // If joinServer requires auth, do it here (not in onMounted)
    // joinServer();
  },
  { immediate: true } // so it runs right after hydrate sets user
);

onMounted (async () => {
  console.log("Mounted on start!");
  //console.log('PROCESS ENV ' + process.env.NODE_ENV)
  //client.orderList(login.user.id);

  await login.hydrate();
  /* await login.hydrate();
  if (login.user) {
    const user = login.user;

    userStore.fetchMe();

    userID.value = user.id;
    username.value = user.username;
    await client.orderList(user.id);
    await handleProvider.getProState(user.id);
    await notificationStore.handleNotifications(user.id);
    conversationStore.initSocket();
    await conversationStore.getConversations();
  } */

  joinServer();

  console.log("IsBookings - " + client.isBookings)
  console.log("AUTH " + login.isAuthenticated)
  console.log('Client orders count is', count.value)

  //console.log("ID " + login.user.id)


})

const goProfile = () => {
  console.log("goProfile");
  router.push("/profilex");
};

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
      handleProvider.upsertBooking(b);
    }
  })
  socket.on('client use offer', async(bookingID, offer) => {
    console.log("I got the offer - " + offer.name);
    const target = await providerService.getProvByProvId(offer.provider);
    if (target) offer.provider = target;
    
    await client.getProviderOffer(bookingID, offer);
  })
  socket.on('pro-handle-confirmed', async({sender, orderId, offerId}) => {
    console.log("PRO GOT IT - " + orderId);
    await handleProvider.handleConfirmed(orderId);
  })
  socket.on('handle client request', async ({bookingId}) => {
    console.log("Requested booking id is " + bookingId);
    const request = await recipientService.getBookingById(bookingId);
    if (!request) return;
    handleProvider.upsertBooking(request);
  })
  socket.on('handle client request confirm', async ({receiver, bId, _offer}) => {
    console.log("XXXXX " + bId);
    await client.handleConfirmedOffer(bId, _offer);
  })
  socket.on('handle client del map booking', async (receiver, bookingId, note) => {
    console.log("Del map booking " + bookingId);
    console.log("Note  " + note.id);
    //await handleProvider.removeBookingOffer(bookingId);
    await notificationStore.localStateAddNotification(note);
  })

  socket.on('handle-pro-remove-public-offer', async (bookingId) => {
    console.log("REMOVE " + bookingId);
    await client.localRemovePublicBooking(bookingId);
  })


  socket.on('handle pro-side del map booking', async (receiver, bookingId) => {
    console.log("Pro-side remove booking " + bookingId);
    await client.removeProRejectedMapOffer_ls(bookingId);
  })

  socket.on('on pro del client map order note', async (receiver, bookingId, note) => {
    await notificationStore.localStateAddNotification(note);
  })

  socket.on('local-confirmed-deal-notification', async (bookingId, notes) => {
    console.log("Confirmed booking id - " + bookingId);
    await notificationStore.localStateAddNotification(notes.cNote);
  })

  socket.on('local-handle-del-client-public-booking', async (bookingId, note) => {
    console.log("Notification locally added - " + note.content);
    await handleProvider.removeLocalBooking(bookingId);
    await notificationStore.localStateAddNotification(note);
  })
  // Same, only no offers
  socket.on('local-client-del-public-booking', async (bookingId) => {
    //await handleProvider.removeLocalBooking(bookingId);
    await handleProvider.disableLocalBooking(bookingId);
  })

  socket.on('local-handle-client-confirmed-deal', (bookingId, notification) => {
    // --Tegemisel--
    console.log("Notification name - " + notification.author);
  })

  // Conversations
  socket.on('update-other-user-local-room', async (rooms) => {
    //conversationStore.localOtheruserRoom(rooms);
    //computed (() => conversationStore.getConversations());
  })
  socket.on('send-private-message', async (message) => {
    console.log("Got message: " + message.text);
    //conversationStore.localMessage(message);
  })

  socket.on('message:new', async (msg) => {
    //conversationStore.addMessageLocal(msg);
    const convoId = String(msg.conversationId);
    const myId = conversationStore.me_id;       // computed
    const isFromMe = String(msg.senderId) === myId;
    const isActive = String(conversationStore.activeConversationId) === convoId;
    const isOpen = openChat.value;  // ref

    // If message is from someone else, and I'm currently viewing this convo,
    // tell the server "I have read it"
    if (!isFromMe && isActive && isOpen) {
      try {
        await chatService.markRead(convoId);
      } catch (e) {
        console.error("markRead failed", e);
      }
    }
  })

  /* socket.on('conversation-upsert', (newConvo) => {
    console.log("Peaks siin upsertima convo-")
    conversationStore.upsertConversation(newConvo);
  }) */
}

/* const handleCreatePro = (pro) => {
  handleProvider.createPro(pro);
} */

const hConfirmOrderToast = () => {
  console.log("CONFIRM TOAST");
  isOrderConfirmed.value = true;
  confirmedOrderMessage.value = "Olet vahvistanut tilauksen!"
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
      console.log("")
    }

    destination = [providersForBooking[i].latitude, providersForBooking[i].longitude];
    console.log("Pro id " + providersForBooking[i].id);
    //if (providersForBooking[i].user.id !== userInID.value) {
      if (booking.zone === 0) {

        if (providersForBooking[i].user.id !== userID.value) {
          console.log("PRP ID: " + providersForBooking[i].user.id);

          orderedBookings = [
            ...orderedBookings,
            providersForBooking[i]
          ]

          if (providersForBooking[i].user.id !== userID.value) {
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
                if (providersForBooking[i].user.id !== userID.value) {
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
  //router.push('/');
}

const onIconBell = () => {
  console.log("Clicked on icon ");
  router.push("/admin/provider");
}
const seeClientOffer = () => {
  console.log("opening the offer");
  router.push('/client-panel');
}
const handleShowNotifications = async () => {
  if (newNotesCount.value > 0) {
    await notificationStore.upsertNotificationStatus();
    //router.push('/notifications');
  }
}


</script>

<style>
html, body { height: 100%; }            /* ensures the body can size to the viewport */
.page-wrap {
  padding-top: 30px;
  /* remove this unless you really want it on ALL pages */
  /* text-align: center; */
}
.app-content {
  padding-top: 56px; /* navbar height */
}
.dd-item {
  color: #ddd !important;
  cursor: pointer;
}
</style>
