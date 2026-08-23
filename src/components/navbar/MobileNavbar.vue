<template>
    <MDBNavbar class="dark" position="top" container expand="lg">
      <div class="d-flex align-items-center w-100">
        <MDBNavbarBrand class="me-2">
            <div style="cursor: pointer;" @click="router.push('/')">
                <img
                
                    :src="navLogo"
                    :alt="t('home.logoAlt')"
                    width="67"
                    height="30px"
                    
                />
            </div>
            

           
          <!-- <MDBIcon
              icon="home"
              class="icon-active"

              style="cursor: pointer; font-size: 26px;"
              @click="router.push('/')"
          /> -->
        </MDBNavbarBrand>
        <MDMNavbarNav v-if="!isAuthenticated" right class="ms-auto d-flex flex-row align-items-center gap-2">
            <MDBNavbarItem>
            <button
                type="button"
                class="pwa-install-btn"
                @click="$emit('handle-install')"
            >
                <i class="fas fa-download"></i>
                <span>{{ t('pwa.install_app') }}</span>
            </button>
          </MDBNavbarItem>
        </MDMNavbarNav>
        <MDBNavbarNav right class="ms-auto d-flex flex-row align-items-center gap-2">
          
          <!-- Client incomed offers -->
          <MDBNavbarItem  v-if="clientNewOffersAmount > 0 && route.name !== 'recipient-page'" @click="$emit('on-client-bell')" class="me-3 me-lg-5" linkClass="link-secondary">
            <MDBIcon  icon="bell" style="color: #0E7490; cursor: pointer;" class="icon"/>
            <MDBBadge  notification color="danger" pill>{{clientNewOffersAmount}}</MDBBadge>
          </MDBNavbarItem>
          <!-- Provider incomed offers-->
          <MDBNavbarItem  v-if="newOffersAmount > 0" @click="$emit('on-provider-bell')" class="me-3 me-lg-5" linkClass="link-secondary">
            <MDBIcon  icon="bell" style="color: orange; cursor: pointer;" class="icon"/>
            <MDBBadge v-if="newOffersAmount > 0" notification color="danger" pill>{{newOffersAmount}}</MDBBadge>
          </MDBNavbarItem>

          <MDBNavbarItem class="me-3 me-lg-5" linkClass="link-secondary">
            <language-contents />
          </MDBNavbarItem>
          <!--User-->
          <MDBNavbarItem v-if="isAuthenticated" class="me-3 me-lg-0 dropdown">
            <MDBDropdown v-model="userDropdown">
              <MDBDropdownToggle 
                tag="a" class="nav-link"
                :aria-label="t('app.openUserMenu')"
                @click="userDropdown = !userDropdown"
              >
                <template v-if="profileLoaded">
                  <MDBIcon v-if="!avatarIsImage || avatarError" icon="user" class="icon" />
                
                  <img
                    v-else
                    :src="imageUrl"
                    class="rounded-circle"
                    height="22"
                    :alt="t('app.profileAvatarAlt')"
                    loading="lazy"
                    @error="avatarError = true"
                  />
                </template>

                <MDBBadge v-if="newNotesCount > 0" notification color="danger" pill>{{newNotesCount}}</MDBBadge>
              </MDBDropdownToggle>
              <MDBDropdownMenu >

                <!-- <MDBDropdownItem
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
                  @click="$emit('show-notifications')"
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
                  v-if="isBookings || clientHistory.length"
                  :tag="RouterLink"
                  to="/client-panel"
                  class="dd-item"
                >
                  {{ t("app.orders") }}
                </MDBDropdownItem> -->

                <MDBDropdownItem
                  v-if="showInstallOption"
                  class="dd-item"
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
                  :tag="RouterLink"
                  to="/"
                  class="dd-item logout-item"
                  @click="$emit('log-out')"
                >
                  {{ t("app.logout") }}
                </MDBDropdownItem>

              </MDBDropdownMenu>
            </MDBDropdown>
          </MDBNavbarItem>

          <MDBNavbarItem v-else :tag="RouterLink" to="/login-register" class="me-3 me-lg-0" linkClass="link-secondary">
            <span style="color: #ef8627;">{{t('app.login')}}</span>
          </MDBNavbarItem>
        </MDBNavbarNav>
      </div>
    </MDBNavbar>
</template>
<script setup>
import {
    MDBNavbar,
    MDBNavbarNav,
    MDBNavbarBrand,
    MDBIcon,
    MDBNavbarItem,
    MDBBadge,
    MDBDropdown,
    MDBDropdownToggle,
    MDBDropdownItem,
    MDBDropdownMenu
} from "mdb-vue-ui-kit"
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import navLogo from '@/assets/duun_hub_hero_nav.png'
import LanguageContents from "../LanguageContents.vue";

const props = defineProps({
    isAuthenticated: {
        type: Boolean
    },
    clientNewOffersAmount: {
        type: Number
    },
    newOffersAmount: {
        type: Number
    },
    isAuthenticated: {
        type: Boolean
    },
    profileLoaded: {
        type: Boolean,
        default: false
    },
    avatarIsImage: {
        type: Boolean
    },
    imageUrl: {
        type: String
    },
    avatarError: {
        type: Boolean
    },
    newNotesCount: {
        type: Number
    },
    notifications: {
        type: Array,
        default: []
    },
    showInstallOption: {
        type: Boolean
    },
    isBookings: {
      type: Boolean
    },
    clientHistory: {
      type: Boolean
    }
})

const emit = defineEmits([
  'on-provider-bell', 
  'on-client-bell', 
  'show-notifications', 
  'handle-install', 
  'log-out'
])

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const userDropdown = ref(false);

</script>