<template>
    <MDBNavbar class="dark" position="top" container expand="lg">
      <div class="d-flex align-items-center w-100">
        <MDBNavbarBrand class="me-2">
            <div style="cursor: pointer;" @click="router.push('/')">
                <img
                
                    :src="navLogo"
                    :alt="t('home.logoAlt')"
                    width="37"
                    
                    
                />
            </div>
            

           
          <!-- <MDBIcon
              icon="home"
              class="icon-active"

              style="cursor: pointer; font-size: 26px;"
              @click="router.push('/')"
          /> -->
        </MDBNavbarBrand>
        <!-- <MDBNavbarNav v-if="!isAuthenticated" right class="ms-auto d-flex flex-row align-items-center gap-2">
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
        </MDBNavbarNav> -->
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
          
          <!-- <MDBNavbarItem v-if="!isAuthenticated" :tag="RouterLink" to="/login-register" class="me-3 me-lg-0" linkClass="link-secondary">
            <span style="color: #ef8627;">{{t('app.login')}}</span>
          </MDBNavbarItem> -->
          <MDBNavbarItem
            v-if="!isAuthenticated"
          >
             <RouterLink
              to="/login-register"
              class="duunhub-login"
            >
              <i class="fas fa-sign-in-alt"></i>
              <span>{{ t("app.login") }}</span>
            </RouterLink>
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
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
//import navLogo from '@/assets/duun_hub_hero_nav.png'
import navLogo from '/icon-48x48.png'
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
      type: Array
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
<style scoped>
.duunhub-login {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  padding: 8px 16px;
  border: 1.5px solid #ef8627;
  border-radius: 20px;

  color: #ef8627;
  background-color: transparent;

  font-size: 14px;
  font-weight: 600;
  text-decoration: none;

  white-space: nowrap;
  transition: all 0.25s ease;
}

.duunhub-login:hover {
  background-color: #ef8627;
  color: white;
  box-shadow: 0 3px 10px rgba(239, 134, 39, 0.25);
  transform: translateY(-1px);
}

.duunhub-login:active {
  transform: scale(0.97);
}

.duunhub-login:focus-visible {
  outline: 2px solid #ef8627;
  outline-offset: 3px;
}

@media (max-width: 768px) {
  .duunhub-login {
    padding: 6px 12px;
    font-size: 13px;
    gap: 6px;
  }
}
</style>