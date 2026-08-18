```vue
<template>
  <MDBContainer class="notifications-page">
    <header class="notifications-header">
      <div>
        <h1 class="notifications-title">
          {{ t("notifications.title") }}
        </h1>

        <p class="notifications-description">
          {{ t("notifications.description") }}
        </p>
      </div>

      <span
        v-if="notifications.length"
        class="notifications-count"
      >
        {{ notifications.length }}
      </span>
    </header>

    <div
      v-if="notifications.length"
      class="notifications-list"
    >
      <article
        v-for="note in notifications"
        :key="note.id"
        class="notification-card"
      >
        <div class="notification-icon">
          <i
            class="fas fa-bell"
            aria-hidden="true"
          />
        </div>

        <div class="notification-content">
          <div class="notification-heading">
            <h2 class="notification-title">
              {{ note.title }}
            </h2>

            <time
              class="notification-time"
              :datetime="note.created"
            >
              {{ formatTimeAgo(note.created) }}
            </time>
          </div>

          <p class="notification-message">
            {{ note.content }}
          </p>

          <div class="notification-actions">
            <button
              type="button"
              class="notification-dismiss"
              :disabled="removingId === note.id"
              @click="removeNote(note.id, note.isLink)"
            >
              <i v-if="note.isLink" class="fas fa-calendar-alt"></i>
              <span
                v-if="removingId === note.id"
                class="notification-spinner"
                aria-hidden="true"
              />
              {{
                removingId === note.id
                  ? t("notifications.removing")
                  : note.isLink
                    ? t("notifications.open_calendar")
                    : t("notifications.dismiss")
              }}
            </button>
          </div>
        </div>
      </article>
    </div>

    <div
      v-else
      class="notifications-empty"
    >
      <div class="notifications-empty-icon">
        <i
          class="far fa-bell"
          aria-hidden="true"
        />
      </div>

      <h2 class="notifications-empty-title">
        {{ t("notifications.emptyTitle") }}
      </h2>

      <p class="notifications-empty-text">
        {{ t("notifications.emptyDescription") }}
      </p>
    </div>
  </MDBContainer>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { MDBContainer } from "mdb-vue-ui-kit";

import { useRouter } from "vue-router";
import { useNotificationStore } from "@/stores/notificationStore";
import { timeAgo } from "./helpers/timekeeping.js";

defineOptions({
  name: "Notifications"
});

const { t } = useI18n();

const router = useRouter();
const notificationStore = useNotificationStore();
const { notifications } = storeToRefs(notificationStore);

const removingId = ref(null);

const formatTimeAgo = iso => {
  return timeAgo(iso, t);
};

const removeNote = async (id, isLink) => {
  if (removingId.value !== null) {
    return;
  }

  removingId.value = id;

  try {
    await notificationStore.removeNotification(id);
    if (isLink) {
      await router.push("/calendar");
    }
  } finally {
    removingId.value = null;
  }
};
</script>

<style scoped>
.notifications-page {
  width: 100%;
  max-width: 860px;
  margin-top: 24px;
  padding-bottom: 48px;
}

.notifications-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.notifications-title {
  margin: 0 0 6px;
  font-size: clamp(1.65rem, 3vw, 2.2rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.notifications-description {
  max-width: 580px;
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.95rem;
  line-height: 1.6;
}

.notifications-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid rgba(13, 202, 240, 0.3);
  border-radius: 999px;
  background: rgba(13, 202, 240, 0.1);
  color: #70e4fa;
  font-size: 0.88rem;
  font-weight: 700;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.045);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.notification-card:hover {
  transform: translateY(-2px);
  border-color: rgba(13, 202, 240, 0.28);
  background: rgba(255, 255, 255, 0.065);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.17);
}

.notification-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 12px;
  background: rgba(222, 184, 135, 0.14);
  color: burlywood;
  font-size: 1rem;
}

.notification-content {
  min-width: 0;
  flex: 1;
}

.notification-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.notification-title {
  margin: 0;
  color: #f4f4f4;
  font-size: 1.05rem;
  font-weight: 650;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.notification-time {
  flex-shrink: 0;
  padding-top: 2px;
  color: rgba(255, 255, 255, 0.48);
  font-size: 0.78rem;
  white-space: nowrap;
}

.notification-message {
  margin: 8px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.94rem;
  line-height: 1.6;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.notification-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.notification-dismiss {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #63ddeb;
  font-size: 0.86rem;
  font-weight: 650;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.notification-dismiss:hover:not(:disabled) {
  background: rgba(13, 202, 240, 0.1);
  color: #9af1fb;
}

.notification-dismiss:focus-visible {
  outline: 2px solid #0dcaf0;
  outline-offset: 2px;
}

.notification-dismiss:disabled {
  cursor: wait;
  opacity: 0.65;
}

.notification-spinner {
  width: 13px;
  height: 13px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: notification-spin 0.65s linear infinite;
}

.notifications-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 24px;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.025);
  text-align: center;
}

.notifications-empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  margin-bottom: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.46);
  font-size: 1.3rem;
}

.notifications-empty-title {
  margin: 0 0 8px;
  font-size: 1.15rem;
  font-weight: 650;
}

.notifications-empty-text {
  max-width: 420px;
  margin: 0;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.92rem;
  line-height: 1.55;
}

@keyframes notification-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 575px) {
  .notifications-page {
    margin-top: 16px;
    padding-inline: 12px;
  }

  .notifications-header {
    margin-bottom: 18px;
  }

  .notification-card {
    gap: 12px;
    padding: 16px;
    border-radius: 14px;
  }

  .notification-icon {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
  }

  .notification-heading {
    flex-direction: column;
    gap: 4px;
  }

  .notification-time {
    order: -1;
  }

  .notification-actions {
    justify-content: flex-start;
  }

  .notification-dismiss {
    padding-left: 0;
  }

  .notification-dismiss:hover:not(:disabled) {
    background: transparent;
  }
}
</style>
```
