<template>
  <button
    v-if="canInstall"
    type="button"
    class="pwa-install-button"
    @click="installApp"
  >
    <i class="fa-solid fa-download" />

    <span>
      {{ t("pwa.install_app") }}
    </span>
  </button>
</template>

<script setup>
import {
  onBeforeUnmount,
  onMounted,
  ref
} from "vue";

import { useI18n } from "vue-i18n";

const { t } = useI18n();

const deferredPrompt = ref(null);
const canInstall = ref(false);

const handleBeforeInstallPrompt = event => {
  /*
   * Väldib brauseri automaatset prompti,
   * et saaksime kasutada enda nuppu.
   */
  event.preventDefault();

  deferredPrompt.value = event;
  canInstall.value = true;
};

const handleAppInstalled = () => {
  deferredPrompt.value = null;
  canInstall.value = false;

  console.info("DuunHub paigaldati seadmesse.");
};

const installApp = async () => {
  if (!deferredPrompt.value) {
    return;
  }

  try {
    await deferredPrompt.value.prompt();

    const choiceResult =
      await deferredPrompt.value.userChoice;

    console.info(
      "DuunHubi installimise valik:",
      choiceResult.outcome
    );
  } catch (error) {
    console.error(
      "DuunHubi installimine ebaõnnestus:",
      error
    );
  } finally {
    deferredPrompt.value = null;
    canInstall.value = false;
  }
};

onMounted(() => {
  window.addEventListener(
    "beforeinstallprompt",
    handleBeforeInstallPrompt
  );

  window.addEventListener(
    "appinstalled",
    handleAppInstalled
  );
});

onBeforeUnmount(() => {
  window.removeEventListener(
    "beforeinstallprompt",
    handleBeforeInstallPrompt
  );

  window.removeEventListener(
    "appinstalled",
    handleAppInstalled
  );
});
</script>

<style scoped>
.pwa-install-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;

  min-height: 42px;
  padding: 10px 16px;

  color: #ffffff;
  background:
    linear-gradient(
      135deg,
      #2563eb,
      #1d4ed8
    );

  border: 1px solid rgba(96, 165, 250, 0.55);
  border-radius: 10px;

  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  box-shadow:
    0 8px 20px rgba(37, 99, 235, 0.25);

  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
}

.pwa-install-button:hover {
  transform: translateY(-1px);

  box-shadow:
    0 10px 25px rgba(37, 99, 235, 0.34);
}
</style>