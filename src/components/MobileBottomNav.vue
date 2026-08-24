<template>
  <nav class="mobile-bottom-nav">
    <!-- Home -->
    <RouterLink
      to="/"
      class="mobile-nav-item"
      :class="{ active: route.path === '/' }"
    >
      <i class="fas fa-house"></i>
      <span>Kotisivu</span>
    </RouterLink>

    <!-- Bookings list / calendar -->
    <RouterLink
      v-if="!isProvider"
      to="/client-panel"
      class="mobile-nav-item"
      :class="{ active: route.path.startsWith('/client-panel') }"
    >
      <i class="fas fa-list-alt"></i>
      <span>Tilaukset</span>
    </RouterLink>

    <RouterLink
      v-else
      to="/calendar"
      class="mobile-nav-item"
      :class="{ active: route.path.startsWith('/calendar') }"
    >
      <i class="fas fa-calendar-alt"></i>
      <span>Kalenteri</span>
    </RouterLink>

    <!-- Main action -->
    <button
      type="button"
      class="mobile-nav-main-action"
      
      @click="openMainAction"
    >
      <span class="main-action-circle">
        <i class="fas fa-plus"></i>
      </span>

      <span class="main-action-label">
        Tee tilaus
      </span>
    </button>

    <!-- Chat -->
    <RouterLink
      to="/notifications"
      class="mobile-nav-item 
      nav-item-chat"
      :class="{ active: route.path.startsWith('/notifications') }"
    >
      <span class="icon-wrap">
        <i class="fas fa-envelope-open-text"></i>
        <span
          v-if="unreadCount > 0"
          class="unread-badge"
        >
          {{ unreadCount > 99 ? "99+" : unreadCount }}
        </span>
      </span>

      <span>viestit</span>
    </RouterLink>

    <!-- Profile -->
     <MDBDropdown v-model="mobileBottomDropdown" class="mobile-nav-item" :class="{ active: mobileBottomDropdown === true }">
        <MDBDropdownToggle 
          tag="a" class="nav-link"
          :aria-label="t('app.openUserMenu')"
          @click="mobileBottomDropdown = !mobileBottomDropdown"
        >
          <i class="fas fa-bars"></i>
          
          <template >
            
          </template>

          <!-- <MDBBadge v-if="newNotesCount > 0" notification color="danger" pill>{{newNotesCount}}</MDBBadge> -->
        </MDBDropdownToggle>
        <span>asiointti</span>
        <MDBDropdownMenu>

          <MDBDropdownItem
            :tag="RouterLink"
            to="/profile"
            class="dd-item"
          >
            {{ t("app.profile") }}
          </MDBDropdownItem>

          <MDBDropdownItem
            v-if="!isProvider"
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

          <!-- isBookings || clientHistory.length -->
          <MDBDropdownItem
            v-if="isProvider"
            :tag="RouterLink"
            to="/client-panel"
            class="dd-item"
          >
            {{ t("app.orders") }}
          </MDBDropdownItem>

          
          <MDBDropdownItem
            v-if="showInstallOption"
            class="dd-item"
            style="margin-bottom: 20px;"
          >
            <button
              type="button"
              class="pwa-install-btn"
              @click="$emit('handle-install')"
            >
              <i class="fas fa-download"></i>
              <span>{{ t('pwa.install_app') }}</span>
            </button>
          </MDBDropdownItem>

          <MDBDropdownItem
            class="dd-item contact-item"
          >
            <button
              type="button"
              class="contact-btn"
              @click="handleOpenContact"
            >
              <i class="fas fa-envelope"></i>
              <span>Anna palautteetta</span>
            </button>
          </MDBDropdownItem>

          <MDBDropdownItem
            :tag="RouterLink"
            to="/"
            class="dd-item logout-item"
            @click="$emit('log-out')"
          >
            {{ t("app.logout") }}
          </MDBDropdownItem>

        </MDBDropdownMenu>
      </MDBDropdown>
  </nav>
</template>

<script setup>
import { ref } from "vue";
import {
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownItem,
  MDBDropdownMenu
} from "mdb-vue-ui-kit";

import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

defineProps({
  unreadCount: {
    type: Number,
    default: 0
  },
  isProvider: {
    type: Boolean
  },
  showInstallOption: {
    type: Boolean
  }
});

const emit = defineEmits(['open-contact', 'log-out']);

const route = useRoute();
const router = useRouter();

const { t } = useI18n();



const mobileBottomDropdown = ref(false);

const openMainAction = () => {
  router.push("/client-form");
};

const handleOpenContact = () => {
  emit('open-contact');
  mobileBottomDropdown.value = false;
}
</script>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  
  left: 12px;
  right: 12px;
  bottom: calc(10px + env(safe-area-inset-bottom));

  height: 64px;

  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;

  padding: 6px 8px;

  /* background: rgba(15, 23, 42, 0.88); */
  background: rgba(30, 41, 59, 0.82);

  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 22px;

  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.28),
    0 2px 8px rgba(0, 0, 0, 0.18);

  /* backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px); */
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);

  z-index: 2000;
}
.mobile-bottom-nav-prev {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;

  height: calc(66px + env(safe-area-inset-bottom));

  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: flex-start;

  padding: 7px 6px env(safe-area-inset-bottom);

  background: rgba(15, 23, 42, 0.97);

  border-top: 1px solid rgba(148, 163, 184, 0.18);

  box-shadow:
    0 -4px 16px rgba(0, 0, 0, 0.18);

  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  z-index: 2000;
}

/* Normal navigation item */

.nav-item-prev {
  position: relative;

  height: 54px;
 
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  gap: 4px;

  text-decoration: none;

  color: #94a3b8;

  font-size: 10px;
  font-weight: 500;

  transition:
    color 0.18s ease,
    transform 0.18s ease;
}

.nav-item-prev i {
  font-size: 20px;
  
}

.nav-item-prev.active {
  color: #22d3ee;
  
}

.nav-item-prev.active i {
  transform: translateY(-1px);
}

.nav-item-prev:active {
  transform: scale(0.94);
}






.mobile-nav-item {
  height: 52px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 3px;

  color: #94a3b8;
  text-decoration: none;

  font-size: 10px;
  font-weight: 500;

  border-radius: 16px;

  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
}

.mobile-nav-item i {
  font-size: 20px;
  
}

.mobile-nav-item.active {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.10);
  
}

.mobile-nav-item:active {
  transform: scale(0.92);
}


/* Center button */

.mobile-nav-main-action {
  position: relative;
  top: -22px;

  display: flex;
  flex-direction: column;
  align-items: center;

  border: 0;
  background: transparent;

  padding: 0;

  cursor: pointer;
}

.main-action-circle {
  width: 56px;
  height: 56px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background:
    linear-gradient(
      135deg,
      #0ea5e9,
      #22d3ee
    );

  border: 4px solid #0f172a;

  box-shadow:
    0 4px 16px rgba(14, 165, 233, 0.38);

  color: #ffffff;

  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.main-action-prev-circle i {
  font-size: 23px;
}

.nav-main-action:active .main-action-circle {
  transform: scale(0.91);
}



.main-action-label {
  margin-top: 2px;

  color: #cbd5e1;

  font-size: 10px;
  font-weight: 600;

  white-space: nowrap;
}


/* Chat badge */

.icon-wrap {
  position: relative;
  display: flex;
}

.unread-badge {
  position: absolute;

  top: -8px;
  right: -12px;

  min-width: 17px;
  height: 17px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 4px;

  border-radius: 10px;

  background: #f97316;

  border: 2px solid #0f172a;

  color: white;

  font-size: 9px;
  font-weight: 700;

  line-height: 1;
}

.mobile-bottom-nav .pwa-install-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 9px 10px;
  margin-bottom: 9px;
  color: #e5e7eb;
  background: rgba(14, 116, 144, 0.18);

  border: 1px solid rgba(34, 211, 238, 0.30);
  border-radius: 8px;

  cursor: pointer;
}

.mobile-bottom-nav .pwa-install-btn:hover {
  color: #ffffff;
  background: rgba(14, 116, 144, 0.32);
  border-color: rgba(34, 211, 238, 0.50);
}

.mobile-bottom-nav .pwa-install-btn i {
  color: #fb923c;
}





.mobile-bottom-nav :deep(.dropdown-item.dd-item) {
  color: #e5e7eb !important;
  padding: 9px 10px !important;
  border-radius: 7px;

  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}



.mobile-bottom-nav :deep(.dropdown-menu) {
  background: #202b3c !important;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 10px;
  padding: 6px;

  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.35),
    0 2px 8px rgba(0, 0, 0, 0.18);
}

.mobile-bottom-nav .dropdown-menu .dd-item {
  color: #e5e7eb !important;

  /* padding: 9px 10px; */
  padding: 9px 10px;
  border-radius: 7px;

  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.mobile-bottom-nav :deep(.dd-item.logout-item) {
  margin-top: 5px;
  padding-top: 9px !important;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
}

.mobile-bottom-nav :deep(.dropdown-item.dd-item:hover) {
  color: #ffffff !important;
  background-color: rgba(56, 189, 248, 0.12) !important;
}

.mobile-bottom-nav :deep(.dropdown-item.dd-item:focus) {
  color: #ffffff !important;
  background-color: rgba(56, 189, 248, 0.12) !important;
}

.mobile-bottom-nav :deep(.dd-item.contact-item) {
  margin-top: 5px;
  padding-top: 9px !important;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
}



.mobile-bottom-nav .contact-item {
  margin-top: 5px;
  padding-top: 5px;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
}

.mobile-bottom-nav .contact-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 9px 10px;

  color: #e5e7eb;
  background: rgba(14, 116, 144, 0.18);

  border: 1px solid rgba(34, 211, 238, 0.30);
  border-radius: 8px;

  cursor: pointer;
}

.mobile-bottom-nav .contact-btn:hover {
  color: #ffffff;
  background: rgba(14, 116, 144, 0.32);
  border-color: rgba(34, 211, 238, 0.50);
}

.mobile-bottom-nav .contact-btn i {
  color: #fb923c;
}

</style>