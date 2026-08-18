<template>
  <nav class="mobile-bottom-nav">
    <!-- Home -->
    <RouterLink
      to="/"
      class="nav-item"
      :class="{ active: route.path === '/' }"
    >
      <i class="fas fa-house"></i>
      <span>{{ t("mobileNav.home") }}</span>
    </RouterLink>

    <!-- Map -->
    <RouterLink
      to="/map"
      class="nav-item"
      :class="{ active: route.path.startsWith('/map') }"
    >
      <i class="fas fa-location-dot"></i>
      <span>{{ t("mobileNav.map") }}</span>
    </RouterLink>

    <!-- Main action -->
    <button
      type="button"
      class="nav-main-action"
      @click="openMainAction"
    >
      <span class="main-action-circle">
        <i class="fas fa-plus"></i>
      </span>

      <span class="main-action-label">
        {{ t("mobileNav.create") }}
      </span>
    </button>

    <!-- Chat -->
    <RouterLink
      to="/chat"
      class="nav-item nav-item-chat"
      :class="{ active: route.path.startsWith('/chat') }"
    >
      <span class="icon-wrap">
        <i class="fas fa-comments"></i>

        <span
          v-if="unreadCount > 0"
          class="unread-badge"
        >
          {{ unreadCount > 99 ? "99+" : unreadCount }}
        </span>
      </span>

      <span>{{ t("mobileNav.messages") }}</span>
    </RouterLink>

    <!-- Profile -->
    <RouterLink
      to="/profile"
      class="nav-item"
      :class="{ active: route.path.startsWith('/profile') }"
    >
      <i class="fas fa-user"></i>
      <span>{{ t("mobileNav.profile") }}</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const route = useRoute();
const router = useRouter();

const { t } = useI18n();

defineProps({
  unreadCount: {
    type: Number,
    default: 0
  }
});

const openMainAction = () => {
  router.push("/create-request");
};
</script>

<style scoped>
.mobile-bottom-nav {
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

.nav-item {
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

.nav-item i {
  font-size: 20px;
}

.nav-item.active {
  color: #22d3ee;
}

.nav-item.active i {
  transform: translateY(-1px);
}

.nav-item:active {
  transform: scale(0.94);
}


/* Center button */

.nav-main-action {
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

.main-action-circle i {
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
</style>