<template>
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
            <MDBIcon  icon="bell" style="color: #0E7490; cursor: pointer;" class="icon"/>
            <MDBBadge  notification color="danger" pill>{{clientNewOffersAmount}}</MDBBadge>
          </MDBNavbarItem>
          <!-- Provider incomed offers-->
          <MDBNavbarItem  v-if="newOffersAmount > 0" @click="onIconBell" class="me-3 me-lg-5" linkClass="link-secondary">
            <MDBIcon  icon="bell" style="color: orange; cursor: pointer;" class="icon"/>
            <MDBBadge v-if="newOffersAmount > 0" notification color="danger" pill>{{newOffersAmount}}</MDBBadge>
          </MDBNavbarItem>

          <MDBNavbarItem class="me-3 me-lg-5" linkClass="link-secondary">
            <language-contents />
          </MDBNavbarItem>
          <!--User-->
          <MDBNavbarItem v-if="login.isAuthenticated" class="me-3 me-lg-0 dropdown">
            <MDBDropdown v-model="userDropdown">
              <MDBDropdownToggle 
                tag="a" class="nav-link" 
                :aria-label="t('app.openUserMenu')"
                @click="userDropdown = !userDropdown"
              >
                <template v-if="profileLoaded">
                  <MDBIcon v-if="!profile?.avatar?.isImage || avatarError" icon="user" class="icon" />
                
                  <img
                    v-else
                    :src="profile.avatar.imageUrl"
                    class="rounded-circle"
                    height="22"
                    :alt="t('app.profileAvatarAlt')"
                    loading="lazy"
                    @error="avatarError = true"
                  />
                </template>

                <MDBBadge v-if="newNotesCount > 0" notification color="danger" pill>{{newNotesCount}}</MDBBadge>
              </MDBDropdownToggle>
              <MDBDropdownMenu class="dropdown-menu" >

                <MDBDropdownItem
                  :tag="RouterLink"
                  to="/profile"
                  class="dd-item"
                >
                  {{ t("app.profile") }}
                </MDBDropdownItem>

                <MDBDropdownItem
                  v-if="notifications.length"
                  :tag="RouterLink"
                  to="/notifications"
                  class="dd-item"
                  @click="handleShowNotifications"
                >
                  {{ t("app.notifications") }}

                  <MDBBadge
                    v-if="newNotesCount > 0"
                    color="danger"
                    class="ms-2"
                  >
                    {{ newNotesCount }}
                  </MDBBadge>
                </MDBDropdownItem>

                <MDBDropdownItem
                  :tag="RouterLink"
                  to="/calendar"
                  class="dd-item"
                >
                  {{ t("app.calendar") }}
                </MDBDropdownItem>

                <MDBDropdownItem
                  :tag="RouterLink"
                  to="/rules"
                  class="dd-item"
                >
                  {{ t("app.rules") }}
                </MDBDropdownItem>

                <MDBDropdownItem
                  :tag="RouterLink"
                  to="/manual"
                  class="dd-item"
                >
                  {{ t("app.manual") }}
                </MDBDropdownItem>

                <MDBDropdownItem
                  v-if="client.isBookings || clientArchiveStore.clientHistory.length"
                  :tag="RouterLink"
                  to="/client-panel"
                  class="dd-item"
                >
                  {{ t("app.orders") }}
                </MDBDropdownItem>

                <!-- <MDBDropdownItem
                  v-if="showInstallOption"
                  class="dd-item pwa-install-item"
                  @click="handleInstall"
                >
                  <i class="fas fa-download"></i>

                  Installi DuunHub
                </MDBDropdownItem> -->

                <MDBDropdownItem
                  v-if="showInstallOption"
                  class="dd-item"
                >
                  <button
                    type="button"
                    class="pwa-install-btn"
                    @click="handleInstall"
                  >
                    <i class="fas fa-download"></i>
                    <span>{{ t('pwa.install_app') }}</span>
                  </button>
                </MDBDropdownItem>


                <MDBDropdownItem
                  :tag="RouterLink"
                  to="/"
                  class="dd-item"
                  @click="logOut"
                >
                  {{ t("app.logout") }}
                </MDBDropdownItem>

                <!-- :tag="RouterLink"
                  to="/"
                  class="dd-item" -->

                <!-- v-if="canInstall" -->


                <!-- <MDBDropdownItem
                  v-if="canInstall"
                  class="dd-item pwa-install-item"
                  @click="installApp"
                >
                  <i class="fas fa-download"></i>
                  Installi rakendus
                </MDBDropdownItem> -->

              </MDBDropdownMenu>
            </MDBDropdown>
          </MDBNavbarItem>

          <MDBNavbarItem v-else :tag="RouterLink" to="/login-register" class="me-3 me-lg-0" linkClass="link-secondary">
            <span style="color: #ef8627;">{{t('app.login')}}</span>
          </MDBNavbarItem>
        </MDBNavbarNav>
      </div>
    </MDBNavbar>

    <MDBModal
      v-model="showIOSInstallHelp"
      tabindex="-1"
    >
      <MDBModalHeader>
        <MDBModalTitle>
          Installi DuunHub
        </MDBModalTitle>
      </MDBModalHeader>

      <MDBModalBody>
        <p>
          DuunHubi installimiseks iPhone'i:
        </p>

        <ol>
          <li>
            Vajuta Safari <strong>Jaga</strong> nuppu
            <i class="fas fa-arrow-up-from-bracket ms-1"></i>
          </li>

          <li>
            Vali <strong>Lisa avakuvale</strong>.
          </li>

          <li>
            Vajuta <strong>Lisa</strong>.
          </li>
        </ol>
      </MDBModalBody>

      <MDBModalFooter>
        <MDBBtn
          color="primary"
          @click="showIOSInstallHelp = false"
        >
          Selge
        </MDBBtn>
      </MDBModalFooter>
    </MDBModal>

    <MDBModal
      id="contactModal"
      v-model="contactModal"
      side="bottom"
      position="bottom-left"
      tabindex="-1"
      labelledby="contactModalLabel"
    >
      <MDBModalHeader class="modal-header-custom">
        <MDBModalTitle id="contactModalLabel">
          {{ t("app.feedbackTitle") }}
        </MDBModalTitle>
      </MDBModalHeader>

      <MDBModalBody>
        <form
          class="form-card"
          @submit.prevent="sendClientMessage"
        >
          <div class="mb-3">
            <h6 class="brand-label">
              DuunHub
            </h6>
          </div>

          <div class="mb-3">
            <label
              for="message-text"
              class="col-form-label"
            >
              {{ t("app.feedbackLabel") }}
            </label>

            <textarea
              id="message-text"
              v-model="contactMessage"
              class="form-control feedback-textarea"
              :placeholder="t('app.feedbackPlaceholder')"
              :aria-invalid="messageFieldError"
              :aria-describedby="
                messageFieldError
                  ? 'message-error'
                  : undefined
              "
            />

            <p
              v-if="messageFieldError"
              id="message-error"
              class="text-danger mt-2"
            >
              {{ t("app.feedbackRequired") }}
            </p>
          </div>
        </form>
      </MDBModalBody>

      <MDBModalFooter class="footer-buttons">
        <MDBBtn
          color="secondary"
          @click="closeContactModal"
        >
          {{ t("app.cancel") }}
        </MDBBtn>

        <MDBBtn
          color="primary"
          :disabled="isSendingContactMessage"
          @click="sendClientMessage"
        >
          {{
            isSendingContactMessage
              ? t("app.sending")
              : t("app.sendFeedback")
          }}
        </MDBBtn>
      </MDBModalFooter>
    </MDBModal>

    <MDBToast
      :stacking="false"
      autohide
      :delay="3000"
      v-model="isOrderConfirmed"
      position="top-center"
      toast="success"
      icon="fas fa-check fa-lg me-2"
    >
      <button type="button" style="visibility: hidden;" class="btn-close ms-auto" :aria-label="t('app.close')" @click="hideError"></button>
      <template #title> PROKEIKKATORI </template>
      <!-- <template #small> 11 mins ago </template> -->
      {{ confirmedOrderMessage }}
    </MDBToast>

    <MDBToast
      :stacking="false"
      autohide
      :delay="3000"
      v-model="isContactMsgSent"
      position="top-center"
      toast="success"
      icon="fas fa-check fa-lg me-2"
    >
      <button type="button" style="visibility: hidden;" class="btn-close ms-auto" :aria-label="t('app.close')" @click="hideError"></button>
      <template #title> PROKEIKKATORI </template>
      <!-- <template #small> 11 mins ago </template> -->
      {{ contactSentMessage }}
    </MDBToast>
  
    <main class="app-content" style=" flex: 1;">

      <RouterView
          v-slot="{Component}">
        <div v-if="!$route.path.startsWith('/login')" class="page-wrap">
          <component
            :is="Component"
            :days="weekdays"
            :bookings="bookings"
            @create-booking-multiple="handleCreateBookingMultiple"
            @over="handleOver"

            @open-chat="handleOpenChat"

            @handle-user-action="sendUserAction"

            @confirm-order-toast="hConfirmOrderToast"

            :provider="provider"

            :offers-in="incomingOffers ?? []"
            :is-pro="isUserPro ?? false"
            :credit="provider?.proTime ?? 0"
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
    <!-- && conversations.length -->
     
      <chat-widget 
        v-if="login.isAuthenticated && conversations.length"
        :did-drag="didDrag"
        :launcher-pos="widgetAnchor"
        :is-open-mode="conversationStore.openChat"
        @start-drag="startDrag"
        @request-open="openChatFromLauncher"
        @request-close="closeChatWindow"
      />
    </div>

    <PwaUpdate />
    
    <MDBFooter

        bg="none"
        :text="['center', 'white']"
        style="background-color: #0F172A; margin-top: auto;"
      >
      <!-- Grid container -->
      <MDBContainer class="p-4 pb-0">
        <!-- Section: CTA -->
       <section v-if="login.isAuthenticated" class="">
        <p class="d-flex justify-content-left align-items-center">
          <MDBBtn
            outline="light"
            rounded
            @click="contactModal = true"
          >
            {{ t("app.giveFeedback") }}
          </MDBBtn>
        </p>
       </section>
        <!-- Section: CTA -->
         <section>
          <!-- <PwaInstallButton /> -->
         </section>
      </MDBContainer>
      
      <!-- Copyright -->
      <div
          class="text-center p-3"
          style="background-color: rgba(0, 0, 0, 0.2); color: #7F8A9A;"
      >
        © {{ currentYear }} DuunHub
      </div>
      <!-- Copyright -->
    </MDBFooter>
  </div>

</template>

<script setup>
import {
  MDBBtn,
  //MDBDateTimepicker,
  MDBNavbar,
  //MDBNavbarToggler,
  MDBNavbarBrand,
  MDBNavbarItem,
  MDBNavbarNav,
  MDBDropdown,
  MDBDropdownItem,
  MDBDropdownMenu,
  MDBDropdownToggle,
  MDBIcon,
  MDBBadge,
  //MDBInput,
  //MDBCollapse,
  MDBToast,
  MDBModal,
  MDBModalHeader,
  MDBModalBody,
  MDBModalFooter,
  MDBModalTitle,
  MDBFooter,
  MDBContainer
} from 'mdb-vue-ui-kit';

import { ref, watch, onMounted, computed, onUnmounted, nextTick } from "vue";
import { storeToRefs } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { usePwaInstall } from './composables/usePwaInstall.js';
//import language from './components/LanguageContents.vue'
//import userService from './service/users.js';
//import loginService from './service/login.js';
import LanguageContents from "@/components/LanguageContents.vue";
import ChatWidget from './components/ChatWidget.vue';
import contactService from './service/contact.js';
import { useLoginStore } from "@/stores/login.js";
import { useUserStore } from './stores/userStore';
import { useClientStore} from "@/stores/recipientStore.js";
import { useNotificationStore } from './stores/notificationStore';
import { useProStore } from '@/stores/providerStore.js';
import { useConversationStore } from './stores/conversationStore';
import { useClientArchiveStore } from './stores/cArchiveStore';
import { useProArchiveStore } from './stores/pArchiveStore';
import { useMapStore } from './stores/mapStore';
import { useProfessionStore } from './stores/professionStore.js';
import { useAdminStore } from './stores/adminStore.js';

import PwaUpdate from './components/PwaUpdate.vue';
import PwaInstallButton from './components/PwaInstallButton.vue'


import { useI18n } from 'vue-i18n';
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
const deviceID = ref(null);
const processedActions = ref(new Set());
const userID = ref('');
const username = ref('')
let userDropdown = ref(false);
const login = useLoginStore();
import { useRoute, useRouter } from "vue-router";
//import ProHistory from '../server/models/provider_history';
const { t } = useI18n();
const currentYear = new Date().getFullYear();
const userStore = useUserStore();
const client = useClientStore();
const handleProvider = useProStore();
const notificationStore = useNotificationStore();
const conversationStore = useConversationStore();
const clientArchiveStore = useClientArchiveStore();
const proArchiveStore = useProArchiveStore();
const mapStore = useMapStore();
const professionStore = useProfessionStore();
const adminStore = useAdminStore();

const { profile } = storeToRefs(userStore);
const { bookings, isBookings, clientNewOffers, clientNewOffersAmount, count, isLoading, error } = storeToRefs(client)
const { isUserPro, provider, proCredit, isIncomingOffers, incomingOffers, newOffersAmount, incomingOffersCount, isProStateLoading, proError } = storeToRefs(handleProvider);
const { notifications, newNotesCount } = storeToRefs(notificationStore);
const { openChat, conversations, totalUnread } = storeToRefs(conversationStore);

const { _providers } = storeToRefs(adminStore);

const contactModal = ref(false);
const contactMessage = ref("");
const isContactMsgSent = ref(false);
const contactSentMessage = ref("");
const messageFieldError = ref(false);

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

let isListening = false;

const isSendingContactMessage = ref(false);


const preOpenPos = ref(null);
const wasNormalizedForOpen = ref(false);

const widgetAnchor = computed(() =>
  conversationStore.openChat && openWindowPos.value
    ? openWindowPos.value
    : pos.value
);


//const { initPwaInstall } = usePwaInstall();

/* const {
  canInstall,
  initPwaInstall,
  installApp,
  
} = usePwaInstall(); */

const {
  canInstall,
  isIOS,
  showInstallOption,
  installApp,
  initPwaInstall
} = usePwaInstall();

const showIOSInstallHelp = ref(false);

const handleInstall = async () => {
  if (isIOS.value) {
    // iPhone/iPad → näita juhendit
    showIOSInstallHelp.value = true;
    return;
  }

  // Android / Chrome / Edge → brauseri installiaken
  await installApp();
};



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

// Update user other devices
const identifyUserDevice = () => {

  deviceID.value = localStorage.getItem("deviceId");

  if (!deviceID.value) {
    deviceID.value = uuidv4();
    localStorage.setItem("deviceId", deviceID.value);
  }

  /* const deviceId = localStorage.getItem("deviceId") || uuidv4();
  deviceID.value = deviceId;
  localStorage.setItem("deviceId", deviceId); */
}

// Will send to own account if another browser is open
const sendUserAction = (type = 'generic-update') => {
  console.log("Sended user action - " + type);
  const action = {
    id: uuidv4(),
    type,
    timestamp: Date.now(),
    userId: userID.value,
    origin: deviceID.value
  }

  processedActions.value.add(action.id);
  socket.emit("user-action", action);
}

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

const openChatAtAnchor = async ({ x, y, side = "left" }) => {
  currentOpenSide.value = side;

  openWindowPos.value = {
    x: Math.max(10, Math.min(x, window.innerWidth - 380)),
    y: Math.max(10, Math.min(y, window.innerHeight - 560)),
  };

  await nextTick();
  conversationStore.openChatWidget();
};

const handleOpenChat = async ({ otherId, bookingId, mode, anchor }) => {
  console.log("App received open-chat", otherId, bookingId, mode, anchor);
  preOpenPos.value = { ...pos.value };
  const room = await conversationStore.openCreateRoom(otherId, bookingId, mode);

  await conversationStore.getConversations();

  await nextTick();

  await openChatAtAnchor(anchor);
};


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

const restoreLauncherPositionAfterClose = () => {
  if (preOpenPos.value) {
    pos.value = { ...preOpenPos.value };
  }
  preOpenPos.value = null;
};

const closeChatWindow = () => {
  if (openWindowPos.value) {
    console.log("Close")
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


const refreshUserData = async (userId) => {
  await Promise.all([
    userStore.fetchMe(),
    client.orderList(userId),
    handleProvider.getProState(userId),
    professionStore.initProfessions(),
    notificationStore.handleNotifications(userId),
    clientArchiveStore.initClientArchive(),
    proArchiveStore.initProviderArchive(),
    conversationStore.getConversations(),
    adminStore.fetchAdminData()
  ])
}

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

    
    /* await Promise.all([
      userStore.fetchMe(),
      clientHistoryService.setToken(login.token),
      proHistoryService.setProSideToken(login.token),
      client.orderList(u.id),
      
      handleProvider.getProState(u.id),
      notificationStore.handleNotifications(u.id),
      clientArchiveStore.initClientArchive(),
      proArchiveStore.initProviderArchive()
    ]);

    if (handleProvider.isUserPro) {
      await Promise.all([
        proHistoryService.setProSideToken(login.token),
        proArchiveStore.initProviderArchive()
      ]);
    } */


    identifyUserDevice();

    clientHistoryService.setToken(login.token)
    proHistoryService.setProSideToken(login.token)

    conversationStore.initSocket()
    socket.emit("join-user-room", u.id)

    await refreshUserData(u.id)



    /* const promises = [
      userStore.fetchMe(),
      clientHistoryService.setToken(login.token),
      proHistoryService.setProSideToken(login.token),
      client.orderList(u.id),
      notificationStore.handleNotifications(u.id),
      clientArchiveStore.initClientArchive(),
      proArchiveStore.initProviderArchive()
    ];

  
    if (u.isProvider) {
      promises.push(handleProvider.getProState(u.id));
    }

    await Promise.all(promises);
 */
    

    profileLoaded.value = true;

    /* if (login.isAuthenticated) {
      conversationStore.initSocket();
      await conversationStore.getConversations();
    } */

  },
  { immediate: true } // so it runs right after hydrate sets user
);

onMounted (async () => {
  console.log("Mounted on start!");

  initPwaInstall();

  //console.log('PROCESS ENV ' + process.env.NODE_ENV)
  //client.orderList(login.user.id);
  handleProvider.getAllProviders(),
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
  stopListening();
})

const joinServer = () => {

  listen();
}

// Socket for handle user multy device state
const handleUserActionSocket = async action => {
  if (!deviceID.value) return;
  if (action.origin === deviceID.value) return;
  if (processedActions.value.has(action.id)) return;

  processedActions.value.add(action.id);
  await refreshUserData(action.userId);
};

const handleConversationRefresh = async () => {
  await conversationStore.getConversations();
};

const listen = async() => {
  if (isListening) return;
  isListening = true;

  /* socket.on("user-action", async (action) => {
   console.log("Action origin before - ", action)
   if (!deviceID.value) return;
   if (action.origin === deviceID.value) return;
   if (processedActions.value.has(action.id)) return;

   console.log("User device control...")

   processedActions.value.add(action.id);
   await refreshUserData(action.userId);
  }) */

  socket.on(
    "user-action",
    handleUserActionSocket
  );

  /* socket.on("conversation:list:refresh", async () => {
    await conversationStore.getConversations();
  }) */

  socket.on(
    "conversation:list:refresh",
    handleConversationRefresh
  );




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
    handleProvider.handleConfirmed(orderId);
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
    console.log("Notification name - ", notification);
    notificationStore.setLocalNote(notification);
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
  socket.on('handle-archive-booking', async (bookingId, pHistory) => {
    console.log("Got booking id to archieve - " + bookingId);
    console.log("PPP ", pHistory )
    await proArchiveStore.addArchiveLocal(pHistory);
  })
  

  /* socket.on('conversation-upsert', (newConvo) => {
    console.log("Peaks siin upsertima convo-")
    conversationStore.upsertConversation(newConvo);
  }) */
}

const stopListening = () => {
  socket.off(
    "user-action",
    handleUserActionSocket
  );

  socket.off(
    "conversation:list:refresh",
    handleConversationRefresh
  );

  isListening = false;
};

const hConfirmOrderToast = () => {
  console.log("CONFIRM TOAST");
  isOrderConfirmed.value = true;
  confirmedOrderMessage.value = t("app.orderConfirmed");
}

// Client created booking and finding matching providers to send this booking to
const handleCreateBookingMultiple = async booking => {
  sendUserAction();

  console.log("Booking zone:", booking.zone);
  console.log("Profession:", booking.professional);

  const origin = [
    booking.latitude,
    booking.longitude
  ];

  console.log("ORIGIN ", origin)

  const providersForBooking =
    await providerService.getProvidersMatchingByProfession({
      result: booking.professional
    });

  client.createBooking(booking);

  const proIdArr = [];
  const orderedBookings = [];

  for (const providerItem of providersForBooking) {
    const providerUserId = providerItem.user?.id;

    // Ära saada kasutaja enda teenusepakkujale.
    if (providerUserId === userID.value) {
      continue;
    }

    let isWithinZone = booking.zone === 0;

    if (!isWithinZone) {
      const destination = [
        providerItem.latitude,
        providerItem.longitude
      ];

      const distanceData = await onMap.findDistance(
        origin,
        destination
      );

      const distance = Number.parseFloat(
        distanceData.distance
      );

      if (!Number.isFinite(distance)) {
        console.warn(
          "Invalid provider distance:",
          distanceData.distance
        );

        continue;
      }

      isWithinZone = distance < Number(booking.zone);
    }

    if (!isWithinZone) {
      continue;
    }

    orderedBookings.push(providerItem);
    proIdArr.push(providerUserId);

    await recipientService.addProviderData(
      booking.id,
      providerItem.id
    );

    await providerService.addProviderBooking(
      providerItem.id,
      booking.id
    );
  }

  booking.ordered = orderedBookings;

  console.log(
    "Matching provider count:",
    proIdArr.length
  );

  if (proIdArr.length > 0) {
    socket.emit(
      "create booking multiple - pro",
      proIdArr,
      booking.id
    );
  }

  await router.push("/client-panel");
};

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

watch(() => contactMessage.value, () => {
  if (contactMessage.value.trim() !== "") {
    messageFieldError.value = false;
  }
});



const closeContactModal = () => {
  contactModal.value = false;
  contactMessage.value = "";
  messageFieldError.value = false;
};

const sendClientMessage = async () => {
  const message = contactMessage.value.trim();

  if (!message) {
    messageFieldError.value = true;
    return;
  }

  isSendingContactMessage.value = true;
  messageFieldError.value = false;

  try {
    const email = profile.value?.email ?? "";
    const name = [
      profile.value?.firstName,
      profile.value?.lastName
    ]
      .filter(Boolean)
      .join(" ");

    await contactService.sendEmail(
      name,
      email,
      message
    );

    contactSentMessage.value =
      t("app.feedbackSent");

    isContactMsgSent.value = true;
    closeContactModal();
  } catch (error) {
    contactSentMessage.value =
      t("app.feedbackSendFailed");

    isContactMsgSent.value = true;
  } finally {
    isSendingContactMessage.value = false;
  }
};

</script>

<style>
html, body { height: 100%; }

.pwa-install-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 9px 10px;

  border: 1px solid rgba(34, 211, 238, 0.2);
  border-radius: 8px;

  background: rgba(14, 116, 144, 0.16);

  color: #e2e8f0;

  font: inherit;
  text-align: left;

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.pwa-install-btn:hover {
  background: rgba(14, 116, 144, 0.3);
  border-color: rgba(34, 211, 238, 0.4);
  color: #ffffff;
}

.pwa-install-btn i {
  color: #fb923c;
  width: 18px;
  text-align: center;
}

.app-shell {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background: #0f172a;
}

.app-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding-top: 58px;
}

.page-wrap {
  width: 100%;
  flex: 1;
}

.icon-active {
  color: #dce7ef;
  font-size: 1.625rem;
  cursor: pointer;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.icon-active:hover {
  color: #67e8f9;
  transform: translateY(-1px);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  object-fit: cover;
}

.user-menu-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
}

.dropdown-menu {
  min-width: 210px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.dd-item {
  border-radius: 8px;
}

.brand-label {
  color: #fb923c;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.feedback-textarea {
  min-height: 140px;
  resize: vertical;
}

.footer-buttons {
  display: flex;
  gap: 10px;
}

.footer-copyright {
  padding: 14px;
  background: rgba(0, 0, 0, 0.2);
  color: #7f8a9a;
  text-align: center;
}

.widget-drag {
  position: fixed;
  z-index: 1050;
  touch-action: none;
}
/* .page-wrap {
  padding-top: 30px;
}
.app-content {
  padding-top: 33px;
} */
.dd-item {
  color: #ddd !important;
  cursor: pointer;
}

/* Chat widget drag */
/* .widget-drag {
  position: fixed;
  z-index: 9999;
} */



/* .drag-handle {
  cursor: grab;
  touch-action: none;
  user-select: none;
  padding: 8px 12px;
  background: #ddd;
} */

/* Contact modal footer buttons */
/* .footer-buttons {
  display: flex;
  gap: 12px;
} */
</style>
