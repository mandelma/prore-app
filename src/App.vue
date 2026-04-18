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
        <MDBNavbarNav right class="ms-auto d-flex flex-row align-items-center gap-2">

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
                <template v-if="profileLoaded">
                  <MDBIcon v-if="!profile?.avatar?.isImage || avatarError" icon="user" class="icon" />
                
                  <img
                    v-else
                    :src="profile.avatar.imageUrl"
                    class="rounded-circle"
                    height="22"
                    alt=""
                    loading="lazy"
                    @error="avatarError = true"
                  />
                </template>

                
                
                <MDBBadge v-if="newNotesCount > 0" notification color="danger" pill>{{newNotesCount}}</MDBBadge>
              </MDBDropdownToggle>
              <MDBDropdownMenu class="dropdown-menu" >

                <MDBDropdownItem :tag="RouterLink" to="/profile" class="dd-item">
                  Profile
                </MDBDropdownItem>

                <MDBDropdownItem v-if="notifications.length" :tag="RouterLink" to="/notifications" class="dd-item" @click="handleShowNotifications">
                  Viestit
                  <MDBBadge v-if="newNotesCount > 0" color="danger" class="ms-2">{{ newNotesCount }}</MDBBadge>
                </MDBDropdownItem>

                <MDBDropdownItem :tag="RouterLink" to="/calendar" class="dd-item">
                  Kalenteri
                </MDBDropdownItem>

                <MDBDropdownItem :tag="RouterLink" to="/rules" class="dd-item">
                  Säännöt
                </MDBDropdownItem>

                <MDBDropdownItem :tag="RouterLink" to="/manual" class="dd-item">
                  Manual
                </MDBDropdownItem>

                <MDBDropdownItem v-if="client.isBookings" :tag="RouterLink" to="/client-panel" class="dd-item">
                  Tilaukset
                </MDBDropdownItem>

                <MDBDropdownItem :tag="RouterLink" to="/" @click="logOut" class="dd-item">
                  Kirjaudu ulos
                </MDBDropdownItem>

              </MDBDropdownMenu>
            </MDBDropdown>
          </MDBNavbarItem>

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

    <div
      id="widget-drag"
      class="widget-drag"
      :style="{ left: widgetAnchor.x + 'px', top: widgetAnchor.y + 'px' }"
      
    >
      <chat-widget 
        v-if="login.isAuthenticated && conversations.length"
        :didDrag="didDrag"
        :launcherPos="widgetAnchor"
        :is-open-mode="conversationStore.openChat"
        @start-drag="startDrag"
        @request-open="openChatFromLauncher"
        @request-close="closeChatWindow"
      />
    </div>
    
    
    



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

import { ref, watch, onMounted, onBeforeMount,  computed, onUnmounted, nextTick } from "vue";
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
import { useClientArchiveStore } from './stores/cArchiveStore';
import { useProArchiveStore } from './stores/pArchiveStore';
import { useMapStore } from './stores/mapStore';


import {useI18n} from "vue-i18n/dist/vue-i18n";
import LanguageContents from "@/components/LanguageContents.vue";
//import { loadGoogleMap } from "@/components/controllers/loadGoogleMap.js"
import recipientService from './service/recipients.js';
import providerService from './service/providers.js';
import { chatService } from './service/chat';
import clientHistoryService from './service/client_history';
import proHistoryService from './service/provider_history';
import onMap from '@/components/controllers/distance';
import socket from "@/socket";

const router = useRouter();
const route = useRoute();
const userID = ref('');
const username = ref('')
let userDropdown = ref(false);
const login = useLoginStore();
import { useRoute, useRouter } from "vue-router";
//import ProHistory from '../server/models/provider_history';
const { t } = useI18n();

const userStore = useUserStore();
const client = useClientStore();
const handleProvider = useProStore();
const notificationStore = useNotificationStore();
const conversationStore = useConversationStore();
const clientArchiveStore = useClientArchiveStore();
const proArchiveStore = useProArchiveStore();
const mapStore = useMapStore();

const { profile } = storeToRefs(userStore);
const { bookings, isBookings, clientNewOffers, clientNewOffersAmount, count, isLoading, error } = storeToRefs(client)
const { isUserPro, provider, proCredit, isIncomingOffers, incomingOffers, newOffersAmount, incomingOffersCount, isProStateLoading, proError } = storeToRefs(handleProvider);
const { notifications, newNotesCount } = storeToRefs(notificationStore);
const { openChat, conversations, totalUnread } = storeToRefs(conversationStore);


const isOrderConfirmed = ref(false);
const confirmedOrderMessage = ref("");

const profileLoaded = ref(false);

const test = ref(null);
const bb = ref(null)

const avatarError = ref(false);

const weekdays = ["Mon","Tue", "Wed"];

let bootstrappedForUserId = null;

// For chat widget dragging
const pos = ref({ x: 20, y: 70 });
const offset = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const didDrag = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const openWindowPos = ref(null);
const currentOpenSide = ref("right");
const dragAllowed = ref(false);
let activePointerId = null;



const preOpenPos = ref(null);
const wasNormalizedForOpen = ref(false);

const widgetAnchor = computed(() =>
  conversationStore.openChat && openWindowPos.value
    ? openWindowPos.value
    : pos.value
);

const placeWidgetBottomRight = () => {
  const launcherW = 57;
  const launcherH = 67;
  const marginRight = 20;
  const marginBottom = 20;

  pos.value.x = window.innerWidth - launcherW - marginRight;
  pos.value.y = window.innerHeight - launcherH - marginBottom;
};

const getPointerPos = (e) => ({
  x: e.clientX,
  y: e.clientY
});

/* const getEventPos = (e) => {
  if (e?.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  if (typeof e?.x === "number" && typeof e?.y === "number") {
    return { x: e.x, y: e.y };
  }
  return { x: e.clientX, y: e.clientY };
}; */

function getChatWindowGeometry({ x, y, viewportW, viewportH, side }) {
  const isMobile = viewportW <= 640;

  const buttonW = 57;
  const buttonH = 67;
  const gap = 12;

  const sideMargin = isMobile ? 8 : 10;
  const topMargin = isMobile ? 8 : 10;
  const bottomMargin = isMobile ? 8 : 32;

  const winW = Math.min(360, viewportW - sideMargin * 2);
  const winH = Math.min(isMobile ? 420 : 520, viewportH - topMargin - bottomMargin);
  /* const winH = isMobile
  ? viewportH - topMargin - bottomMargin
  : Math.min(520, viewportH - topMargin - bottomMargin); */

  const leftOffset = side === "left"
    ? -winW - gap + buttonW
    : buttonW + gap;

  const topOffset = 0;

  return {
    buttonW,
    buttonH,
    gap,
    sideMargin,
    topMargin,
    bottomMargin,
    winW,
    winH,
    leftOffset,
    topOffset,
    absLeft: x + leftOffset,
    absTop: y + topOffset,
    absRight: x + leftOffset + winW,
    absBottom: y + topOffset + winH
  };
}

const startDrag = (e) => {
  dragAllowed.value = true;

  const { x, y } = getPointerPos(e);

  activePointerId = e.pointerId ?? null;
  isDragging.value = true;
  didDrag.value = false;
  dragStart.value = { x, y };

  const anchor = conversationStore.openChat && openWindowPos.value
    ? openWindowPos.value
    : pos.value;

  offset.value.x = x - anchor.x;
  offset.value.y = y - anchor.y;

  window.addEventListener("pointermove", onDrag, { passive: false });
  window.addEventListener("pointerup", stopDrag);
  window.addEventListener("pointercancel", stopDrag);
};

const onDrag = (e) => {
  if (!dragAllowed.value) return;
  if (!isDragging.value) return;
  if (activePointerId !== null && e.pointerId !== activePointerId) return;

  const { x, y } = getPointerPos(e);

  const movedX = Math.abs(x - dragStart.value.x);
  const movedY = Math.abs(y - dragStart.value.y);

  if (movedX > 5 || movedY > 5) {
    didDrag.value = true;
  }

  let newX = x - offset.value.x;
  let newY = y - offset.value.y;

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  if (conversationStore.openChat) {
    const g = getChatWindowGeometry({
      x: 0,
      y: 0,
      viewportW,
      viewportH,
      side: currentOpenSide.value
    });

    newX = Math.min(
      Math.max(g.sideMargin, newX),
      viewportW - g.sideMargin - g.winW
    );

    newY = Math.min(
      Math.max(g.topMargin, newY),
      viewportH - g.bottomMargin - g.winH
    );

    openWindowPos.value = { x: newX, y: newY };
  } else {
    const launcher = document.querySelector(".chat-launcher");
    if (!launcher) return;

    const launcherWidth = launcher.offsetWidth;
    const launcherHeight = launcher.offsetHeight;

    newX = Math.min(Math.max(0, newX), viewportW - launcherWidth);
    newY = Math.min(Math.max(0, newY), viewportH - launcherHeight - 10);

    pos.value = { x: newX, y: newY };
  }

  if (e.cancelable) e.preventDefault();
};

const snapAnchorToOpenWindow = () => {
  if (!conversationStore.openChat) return;

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const side = currentOpenSide.value || "right";

  const g = getChatWindowGeometry({
    x: pos.value.x,
    y: pos.value.y,
    viewportW,
    viewportH,
    side
  });

  // Clamp the WINDOW rectangle first
  let windowLeft = g.absLeft;
  let windowTop = g.absTop;

  if (windowLeft < g.sideMargin) {
    windowLeft = g.sideMargin;
  }
  if (windowLeft + g.winW > viewportW - g.sideMargin) {
    windowLeft = viewportW - g.sideMargin - g.winW;
  }

  if (windowTop < g.topMargin) {
    windowTop = g.topMargin;
  }
  if (windowTop + g.winH > viewportH - g.bottomMargin) {
    windowTop = viewportH - g.bottomMargin - g.winH;
  }

  // Rebuild launcher/wrapper anchor from window position
  const snappedX = windowLeft - g.leftOffset;
  const snappedY = windowTop - g.topOffset;

  pos.value.x = snappedX;
  pos.value.y = snappedY;
};

const stopDrag = (e) => {
  if (activePointerId !== null && e.pointerId !== activePointerId) return;

  isDragging.value = false;
  activePointerId = null;
  dragAllowed.value = false;

  window.removeEventListener("pointermove", onDrag);
  window.removeEventListener("pointerup", stopDrag);
  window.removeEventListener("pointercancel", stopDrag);

  setTimeout(() => {
    didDrag.value = false;
  }, 80);
};


const normalizeWidgetPositionForOpen = (side = "right") => {
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  const g = getChatWindowGeometry({
    x: pos.value.x,
    y: pos.value.y,
    viewportW,
    viewportH,
    side
  });

  let nextX = pos.value.x;
  let nextY = pos.value.y;

  // ---- Horizontal normalization ----
  // If window opens to the left, shift wrapper left immediately
  // so the drag area is already aligned with the open window.
  if (side === "left") {
    nextX = Math.min(
      nextX,
      viewportW - g.sideMargin - g.winW
    );
  } else {
    nextX = Math.max(
      nextX,
      g.sideMargin
    );
  }

  // Recompute using tentative X
  let gx = getChatWindowGeometry({
    x: nextX,
    y: nextY,
    viewportW,
    viewportH,
    side
  });

  if (gx.absLeft < gx.sideMargin) {
    nextX += gx.sideMargin - gx.absLeft;
  }
  if (gx.absRight > viewportW - gx.sideMargin) {
    nextX -= gx.absRight - (viewportW - gx.sideMargin);
  }

  // ---- Vertical normalization ----
  let gy = getChatWindowGeometry({
    x: nextX,
    y: nextY,
    viewportW,
    viewportH,
    side
  });

  if (gy.absTop < gy.topMargin) {
    nextY += gy.topMargin - gy.absTop;
  }
  if (gy.absBottom > viewportH - gy.bottomMargin) {
    nextY -= gy.absBottom - (viewportH - gy.bottomMargin);
  }

  pos.value.x = nextX;
  pos.value.y = nextY;
};

const openChatFromLauncher__ = async ({ side } = {}) => {
  normalizeWidgetPositionForOpen(side || "right");
  await nextTick();
  conversationStore.openChatWidget();
};

/* const openChatFromLauncher = async ({ side } = {}) => {
  currentOpenSide.value = side || "right";
  normalizeWidgetPositionForOpen(currentOpenSide.value);
  await nextTick();
  conversationStore.openChatWidget();
}; */


const openChatFromLauncher = async ({ side } = {}) => {
  currentOpenSide.value = side || "right";

  preOpenPos.value = { ...pos.value };

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  const g = getChatWindowGeometry({
    x: pos.value.x,
    y: pos.value.y,
    viewportW,
    viewportH,
    side: currentOpenSide.value
  });

  let windowLeft = g.absLeft;
  let windowTop = g.absTop;

  if (windowLeft < g.sideMargin) {
    windowLeft = g.sideMargin;
  }
  if (windowLeft + g.winW > viewportW - g.sideMargin) {
    windowLeft = viewportW - g.sideMargin - g.winW;
  }

  if (windowTop < g.topMargin) {
    windowTop = g.topMargin;
  }
  if (windowTop + g.winH > viewportH - g.bottomMargin) {
    windowTop = viewportH - g.bottomMargin - g.winH;
  }

  openWindowPos.value = {
    x: windowLeft,
    y: windowTop
  };

  await nextTick();
  conversationStore.openChatWidget();
};

/* const restoreLauncherPositionAfterClose = () => {
  if (wasNormalizedForOpen.value && preOpenPos.value) {
    pos.value = { ...preOpenPos.value };
  }

  wasNormalizedForOpen.value = false;
  preOpenPos.value = null;
}; */

const openChatFromLauncher_old = async () => {
  normalizeWidgetPositionForOpen();

  await nextTick(); // let child receive new launcherPos first

  conversationStore.openChatWidget();
};

/* const closeChatWindow = async() => {
  restoreLauncherPositionAfterClose();
  await nextTick();
  conversationStore.closeChatWidget();
} */

const restoreLauncherPositionAfterClose = () => {
  if (preOpenPos.value) {
    pos.value = { ...preOpenPos.value };
  }
  preOpenPos.value = null;
};

const closeChatWindow = () => {
  if (openWindowPos.value) {
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const g = getChatWindowGeometry({
      x: 0,
      y: 0,
      viewportW,
      viewportH,
      side: currentOpenSide.value
    });

    pos.value = {
      x: openWindowPos.value.x - g.leftOffset,
      y: openWindowPos.value.y - g.topOffset
    };
  }

  openWindowPos.value = null;
  restoreLauncherPositionAfterClose();
  conversationStore.closeChatWidget();
};


/* watch(() => profile?.avatar?.imageUrl, () => {
  avatarError.value = false
}) */
watch(() => profile.value?.avatar?.imageUrl, () => {
  avatarError.value = false;
});

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

      
      
      clientHistoryService.setToken(login.token),
      proHistoryService.setProSideToken(login.token),
      client.orderList(u.id),
      handleProvider.getProState(u.id),
      notificationStore.handleNotifications(u.id),
      clientArchiveStore.initClientArchive(),
      proArchiveStore.initProviderArchive()
    ]);

    

    profileLoaded.value = true;

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

  placeWidgetBottomRight();

  await login.hydrate();

  await mapStore.init();
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

onUnmounted(() => {
  stopDrag();
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
    const target = await providerService.getProvByProvId(offer.provider.id);
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
  socket.on('handle client request confirm', async ({receiver, bId, _providerId, _offer}) => {
    console.log("XXXXX " + bId);


    await client.handleConfirmedOffer(bId, _providerId, _offer);
  })
  socket.on('handle client del map booking', async (receiver, bookingId, note) => {
    console.log("Del map booking " + bookingId);
    console.log("Note  " + note.id);
    //await handleProvider.removeBookingOffer(bookingId);
    await handleProvider.disableLocalBooking(bookingId);
    await notificationStore.localStateAddNotification(note);
  })

  socket.on('handle-pro-remove-public-offer', async (bookingId) => {
    console.log("REMOVE " + bookingId);
    // Move booking and disable open booking
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
    //await handleProvider.removeLocalBooking(bookingId);
    await handleProvider.disableLocalBooking(bookingId);
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

  /* socket.on('handle-pro-confirm-client', (providerId) => {
    console.log("Provider id ---- ", providerId);
    
  }) */
  // Client booking from map
  socket.on('handle-booking-done', async (bookingId) => {
    console.log("Got booking done - " + bookingId);
    await handleProvider.handleOfferDone(bookingId);
  })
  // Archieve client booking for provider
  socket.on('handle-archieve-booking', async (bookingId, pHistory) => {
    console.log("Got booking id to archieve - " + bookingId);
    console.log("PPP ", pHistory )
    await proArchiveStore.addArchiveLocal(pHistory);
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
  background-color: #0E1218; /* sinu tume värv */
  margin: 0;
  padding: 0;
  /* remove this unless you really want it on ALL pages */
  /* text-align: center; */
}
.app-content {
  padding-top: 33px; /* navbar height */
}
.dd-item {
  color: #ddd !important;
  cursor: pointer;
}

/* Chat widget drag */
.widget-drag {
  position: fixed;
  z-index: 9999;
}



.drag-handle {
  cursor: grab;
  touch-action: none;
  user-select: none;
  padding: 8px 12px;
  background: #ddd;
}
</style>
