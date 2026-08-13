<template>
  <Transition name="pwa-update">
    <aside
      v-if="needRefresh || manualRefreshAvailable"
      class="pwa-update"
      role="status"
      aria-live="polite"
    >
      <div class="pwa-update__icon">
        <i class="fa-solid fa-rotate" />
      </div>

      <div class="pwa-update__content">
        <strong>
          {{ t("pwa.update_available") }}
        </strong>

        <p>
          {{ t("pwa.update_description") }}
        </p>
      </div>

      <div class="pwa-update__actions">
        <button
          type="button"
          class="pwa-update__button pwa-update__button--primary"
          @click="installUpdate"
        >
          {{ t("pwa.update_now") }}
        </button>

        <button
          type="button"
          class="pwa-update__button pwa-update__button--secondary"
          @click="close"
        >
          {{ t("pwa.later") }}
        </button>
      </div>
    </aside>
  </Transition>
</template>

<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount
} from "vue";

import { useI18n } from "vue-i18n";
import { useRegisterSW } from "virtual:pwa-register/vue";

const { t } = useI18n();

const manualRefreshAvailable = ref(false);

const {
  needRefresh,
  updateServiceWorker
} = useRegisterSW({
  immediate: true,

  onRegisteredSW(swUrl, registration) {
    console.log(
      "SW registered:",
      swUrl
    );

    if (!registration) {
      return;
    }

    registration.update().catch(
      console.error
    );
  },

  onRegisterError(error) {
    console.error(
      "SW registration failed:",
      error
    );
  }
});


/*
 * Uue versiooni kontroll
 */
const checkForUpdate = async () => {
  try {
    const registration =
      await navigator.serviceWorker
        .getRegistration();

    if (!registration) {
      return;
    }

    await registration.update();

    console.log(
      "waiting:",
      registration.waiting
    );

    console.log(
      "installing:",
      registration.installing
    );

    if (registration.waiting) {
      manualRefreshAvailable.value = true;
    }

  } catch (error) {
    console.error(
      "PWA update check failed:",
      error
    );
  }
};


/*
 * Installi uus versioon
 */
const installUpdate = async () => {
  console.log(
    "installUpdate CALLED"
  );

  try {
    const registration =
      await navigator.serviceWorker
        .getRegistration();

    /*
     * Eriti oluline iOS PWA puhul.
     */
    if (registration?.waiting) {
      console.log(
        "Activating waiting SW"
      );

      registration.waiting.postMessage({
        type: "SKIP_WAITING"
      });

      return;
    }

    /*
     * Fallback vite-plugin-pwa jaoks.
     */
    await updateServiceWorker(true);

  } catch (error) {
    console.error(
      "PWA update failed:",
      error
    );
  }
};


/*
 * Kui uus SW saab rakenduse controlleriks,
 * laadime Vue rakenduse uuesti.
 */
let refreshing = false;

const handleControllerChange = () => {
  if (refreshing) {
    return;
  }

  refreshing = true;

  console.log(
    "New service worker activated"
  );

  window.location.reload();
};


/*
 * Kui PWA tuuakse iPhone'is uuesti
 * foreground'i, kontrollime uuendusi.
 */
const handleVisibilityChange = () => {
  if (
    document.visibilityState === "visible"
  ) {
    checkForUpdate();
  }
};


onMounted(() => {
  navigator.serviceWorker?.addEventListener(
    "controllerchange",
    handleControllerChange
  );

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  checkForUpdate();
});


onBeforeUnmount(() => {
  navigator.serviceWorker?.removeEventListener(
    "controllerchange",
    handleControllerChange
  );

  document.removeEventListener(
    "visibilitychange",
    handleVisibilityChange
  );
});


const close = () => {
  needRefresh.value = false;
  manualRefreshAvailable.value = false;
};
</script>

<style scoped>
.pwa-update {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 10000;

  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;

  width: min(430px, calc(100vw - 32px));
  padding: 18px;

  color: #eaf2ff;
  background:
    linear-gradient(
      145deg,
      rgba(24, 42, 77, 0.98),
      rgba(17, 29, 53, 0.98)
    );

  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 16px;

  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.35),
    0 4px 14px rgba(0, 0, 0, 0.2);

  backdrop-filter: blur(14px);
}

.pwa-update__icon {
  display: grid;
  place-items: center;

  width: 42px;
  height: 42px;

  color: #93c5fd;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.25);
  border-radius: 12px;
}

.pwa-update__content {
  min-width: 0;
}

.pwa-update__content strong {
  display: block;
  margin-bottom: 5px;
  font-size: 15px;
  color: #ffffff;
}

.pwa-update__content p {
  margin: 0;
  color: #b9c7dc;
  font-size: 13px;
  line-height: 1.5;
}

.pwa-update__actions {
  grid-column: 1 / -1;

  display: flex;
  justify-content: flex-end;
  gap: 9px;

  padding-top: 2px;
}

.pwa-update__button {
  min-height: 38px;
  padding: 8px 14px;

  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  transition:
    transform 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.pwa-update__button:hover {
  transform: translateY(-1px);
}

.pwa-update__button--primary {
  color: #ffffff;
  background: #2563eb;
  border: 1px solid #3b82f6;
}

.pwa-update__button--primary:hover {
  background: #1d4ed8;
}

.pwa-update__button--secondary {
  color: #cbd5e1;
  background: transparent;
  border: 1px solid rgba(203, 213, 225, 0.25);
}

.pwa-update__button--secondary:hover {
  color: #ffffff;
  border-color: rgba(203, 213, 225, 0.45);
}

.pwa-update-enter-active,
.pwa-update-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.pwa-update-enter-from,
.pwa-update-leave-to {
  opacity: 0;
  transform: translateY(14px);
}

@media (max-width: 600px) {
  .pwa-update {
    right: 12px;
    bottom: 12px;
    left: 12px;
    width: auto;
  }

  .pwa-update__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>