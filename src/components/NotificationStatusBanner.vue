<template>


  <div
  v-if="isAuthenticated && permission !== 'granted'"
  class="notification-warning-wrap"
>
  <!-- Permission DENIED -->
  <div
    v-if="permission === 'denied'"
    class="notification-warning notification-warning--denied"
  >
    <div class="notification-warning__icon">
      <i class="fas fa-bell-slash"></i>
    </div>

    <div class="notification-warning__content">
      <strong class="notification-warning__title">
        {{ t("notification.disabled") }}
      </strong>

      <div class="notification-warning__text">
        {{ t("notification.disabled_description") }}
      </div>
    </div>

    <MDBBtn
      size="sm"
      class="notification-warning__button"
      @click="showNotificationsBlockedModal"
    >
      {{ t("notification.how_to_enable") }}
    </MDBBtn>
  </div>

  <!-- Permission DEFAULT -->
  <div
    v-else-if="permission === 'default'"
    class="notification-warning notification-warning--default"
  >
    <div class="notification-warning__icon">
      <i class="fas fa-bell"></i>
    </div>

    <div class="notification-warning__content">
      <strong class="notification-warning__title">
        {{ t("notification.not_enabled") }}
      </strong>

      <div class="notification-warning__text">
        {{ t("notification.not_enabled_description") }}
      </div>
    </div>

    <MDBBtn
      size="sm"
      class="notification-warning__button"
      @click="showNotificationModal"
    >
      {{ t("notification.enable") }}
    </MDBBtn>
  </div>
</div>

</template>
<script setup>
import { useI18n } from "vue-i18n";

defineOptions({
    name: 'notification-permission-banner'
})
const props = defineProps({
    isAuthenticated: {
        type: Boolean,
        required: true
    },
    permission: {
        type: String,
        default: ""
    }
})
const emit = defineEmits(['showBlockedModal', 'showNotificationsModal'])
const { t } = useI18n();

// For permission denied
const showNotificationsBlockedModal = () => {
    emit("showBlockedModal");
}

// For permission default
const showNotificationModal = () => {
  emit('showNotificationsModal');
}
</script>
<style scoped>
.notification-warning-wrap {
  width: 100%;
  padding: 8px 14px;
  box-sizing: border-box;
}

.notification-warning {
  display: flex;
  align-items: center;
  gap: 12px;

  width: 100%;
  max-width: 1200px;
  min-height: 58px;
  margin: 0 auto;
  padding: 10px 12px;

  border: 1px solid rgba(139, 197, 202, 0.22);
  border-radius: 12px;

  background: rgba(25, 38, 51, 0.94);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);

  color: #e8f0f2;
}

/* Icon */

.notification-warning__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 38px;
  height: 38px;
  flex: 0 0 38px;

  border-radius: 10px;

  font-size: 15px;
}

/* Content */

.notification-warning__content {
  flex: 1 1 auto;
  min-width: 0;
}

.notification-warning__title {
  display: block;

  margin-bottom: 2px;

  color: #f1f5f6;
  font-size: 13px;
  font-weight: 650;
  line-height: 1.3;
}

.notification-warning__text {
  color: rgba(220, 230, 234, 0.66);

  font-size: 11px;
  line-height: 1.4;
}

/* Button */

.notification-warning__button {
  flex: 0 0 auto;
  text-align: center;
  cursor: pointer;
  min-width: 110px;
  margin: 0 !important;
  padding: 7px 11px !important;

  border-radius: 8px !important;
  box-shadow: none !important;

  font-size: 11px !important;
  font-weight: 600 !important;
  text-transform: none !important;
}

/* DEFAULT */

.notification-warning--default {
  border-color: rgba(95, 158, 160, 0.3);
  background:
    linear-gradient(
      135deg,
      rgba(30, 53, 65, 0.96),
      rgba(24, 39, 52, 0.96)
    );
}

.notification-warning--default .notification-warning__icon {
  color: #91c9cd;
  background: rgba(95, 158, 160, 0.14);
}

.notification-warning--default .notification-warning__button {
  color: #eaf7f8 !important;
  border: 1px solid rgba(113, 190, 197, 0.3) !important;
  background: rgba(63, 145, 154, 0.22) !important;
}

/* DENIED */

.notification-warning--denied {
  border-color: rgba(230, 157, 78, 0.28);
  background:
    linear-gradient(
      135deg,
      rgba(59, 45, 39, 0.96),
      rgba(31, 38, 48, 0.96)
    );
}

.notification-warning--denied .notification-warning__icon {
  color: #efb36e;
  background: rgba(226, 146, 53, 0.14);
}

.notification-warning--denied .notification-warning__button {
  color: #f4c58d !important;
  border: 1px solid rgba(230, 157, 78, 0.3) !important;
  background: rgba(226, 146, 53, 0.12) !important;
}

/* Mobile */

@media (max-width: 600px) {
  .notification-warning-wrap {
    padding: 7px 10px;
  }

  .notification-warning {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 9px;

    padding: 10px;
  }

  .notification-warning__icon {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
  }

  .notification-warning__content {
    width: calc(100% - 45px);
  }

  .notification-warning__button {
    width: 100%;
    /* margin-left: 43px !important; */
  }
}

@media (max-width: 420px) {
  .notification-warning__button {
    width: 100%;
    /* margin-left: 0 !important; */
  }
}


</style>