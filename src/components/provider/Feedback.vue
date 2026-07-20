<template>
  <MDBContainer class="feedback-page">
    <header
      v-if="route.name === 'pro-feedback'"
      class="feedback-page__header"
    >
      <div>
        <span class="feedback-page__eyebrow">
          {{ t("feedback.reviews") }}
        </span>

        <h1 class="feedback-page__title">
          {{ t("feedback.customer_reviews") }}
        </h1>
      </div>

      <button
        type="button"
        class="close-button"
        :aria-label="t('feedback.close')"
        @click="router.go(-1)"
      >
        <span aria-hidden="true">×</span>
      </button>
    </header>

    <section
      v-if="writtenFeedback.length"
      class="feedback-list"
      :aria-label="t('feedback.customer_reviews')"
    >
      <article
        v-for="(feedbackItem, index) in writtenFeedback"
        :key="feedbackItem.id || feedbackItem.date || index"
        class="feedback-card"
      >
        <header class="feedback-card__header">
          <div class="feedback-card__author">
            <div
              class="feedback-card__avatar"
              aria-hidden="true"
            >
              {{ getInitial(feedbackItem.sender) }}
            </div>

            <div class="feedback-card__author-info">
              <h2 class="feedback-card__name">
                {{
                  feedbackItem.sender ||
                  t("feedback.anonymous")
                }}
              </h2>

              <time
                v-if="feedbackItem.date"
                class="feedback-card__date"
                :datetime="feedbackItem.date"
              >
                {{ formatDateTime(feedbackItem.date) }}
              </time>
            </div>
          </div>

          <div
            class="feedback-card__quote-mark"
            aria-hidden="true"
          >
            “
          </div>
        </header>

        <div class="feedback-card__body">
          <p class="feedback-card__text">
            {{ feedbackItem.text }}
          </p>
        </div>
      </article>
    </section>

    <section
      v-else-if="provider"
      class="empty-feedback"
    >
      <div
        class="empty-feedback__icon"
        aria-hidden="true"
      >
        <span>☆</span>
      </div>

      <h2 class="empty-feedback__title">
        {{ t("feedback.no_written_reviews") }}
      </h2>

      <p class="empty-feedback__text">
        {{ t("feedback.no_written_reviews_description") }}
      </p>
    </section>

    <section
      v-else
      class="feedback-loading"
      role="status"
      :aria-label="t('feedback.loading')"
    >
      <div class="feedback-loading__spinner" />
    </section>
  </MDBContainer>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref
} from "vue";
import { MDBContainer } from "mdb-vue-ui-kit";
import { useI18n } from "vue-i18n";
import {
  useRoute,
  useRouter
} from "vue-router";

import providerService from "../../service/providers";

defineOptions({
  name: "ProFeedback"
});

const props = defineProps({
  target: {
    type: Object,
    default: null
  }
});

const {
  t,
  locale
} = useI18n();

const router = useRouter();
const route = useRoute();

const provider = ref(null);

const writtenFeedback = computed(() => {
  const feedback = provider.value?.feedback;

  if (!Array.isArray(feedback)) {
    return [];
  }

  return feedback.filter(item => {
    return (
      typeof item?.text === "string" &&
      item.text.trim().length > 0
    );
  });
});

onMounted(async () => {
  if (props.target) {
    provider.value = props.target;
    return;
  }

  const providerId = route.params.id;

  if (!providerId) {
    provider.value = {};
    return;
  }

  try {
    const result =
      await providerService.getProvByProvId(
        providerId
      );

    provider.value = result || {};
  } catch (error) {
    console.error(
      "Provider feedback loading failed:",
      error
    );

    provider.value = {};
  }
});

const formatDateTime = iso => {
  if (!iso) {
    return "—";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    locale.value || "fi-FI",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }
  ).format(date);
};

const getInitial = sender => {
  if (
    typeof sender !== "string" ||
    !sender.trim()
  ) {
    return "?";
  }

  return sender.trim().charAt(0).toUpperCase();
};
</script>

<style scoped>
.feedback-page {
  --feedback-surface: #1a2332;
  --feedback-surface-soft:
    rgba(255, 255, 255, 0.035);
  --feedback-border:
    rgba(255, 255, 255, 0.09);
  --feedback-border-strong:
    rgba(255, 255, 255, 0.15);
  --feedback-text: #f1f5f9;
  --feedback-text-secondary: #aeb8c8;
  --feedback-text-muted: #778397;
  --feedback-accent: #38bdf8;
  --feedback-accent-soft:
    rgba(56, 189, 248, 0.12);

  width: 100%;
  max-width: 900px;
  padding-top: 18px;
  padding-bottom: 36px;
  color: var(--feedback-text);
}

.feedback-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
  padding: 18px 20px;
  border: 1px solid var(--feedback-border);
  border-radius: 16px;
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.025),
      transparent 40%
    ),
    var(--feedback-surface);
  box-shadow:
    0 14px 34px rgba(0, 0, 0, 0.15);
}

.feedback-page__eyebrow {
  display: block;
  margin-bottom: 5px;
  color: var(--feedback-accent);
  font-size: 0.7rem;
  font-weight: 750;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.feedback-page__title {
  margin: 0;
  color: var(--feedback-text);
  font-size: clamp(1.1rem, 3vw, 1.4rem);
  font-weight: 700;
  line-height: 1.3;
}

.close-button {
  display: inline-flex;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--feedback-border-strong);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.035);
  color: var(--feedback-text-secondary);
  font: inherit;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.close-button:hover {
  border-color: rgba(56, 189, 248, 0.4);
  background: var(--feedback-accent-soft);
  color: var(--feedback-accent);
  transform: translateY(-1px);
}

.close-button:focus-visible {
  outline: 2px solid var(--feedback-accent);
  outline-offset: 2px;
}

.feedback-list {
  display: grid;
  gap: 14px;
}

.feedback-card {
  overflow: hidden;
  border: 1px solid var(--feedback-border);
  border-radius: 16px;
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.02),
      transparent 42%
    ),
    var(--feedback-surface);
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.13);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.feedback-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow:
    0 16px 36px rgba(0, 0, 0, 0.17);
}

.feedback-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 17px 18px 13px;
  border-bottom: 1px solid var(--feedback-border);
  background: rgba(255, 255, 255, 0.016);
}

.feedback-card__author {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.feedback-card__avatar {
  display: inline-flex;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 50%;
  background: var(--feedback-accent-soft);
  color: #7dd3fc;
  font-size: 0.95rem;
  font-weight: 750;
  text-transform: uppercase;
}

.feedback-card__author-info {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.feedback-card__name {
  margin: 0;
  color: var(--feedback-text);
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.feedback-card__date {
  color: var(--feedback-text-muted);
  font-size: 0.69rem;
  line-height: 1.4;
}

.feedback-card__quote-mark {
  color: rgba(56, 189, 248, 0.38);
  font-family: Georgia, serif;
  font-size: 2.4rem;
  font-weight: 700;
  line-height: 0.8;
}

.feedback-card__body {
  padding: 17px 18px 19px;
}

.feedback-card__text {
  margin: 0;
  color: var(--feedback-text-secondary);
  font-size: 0.88rem;
  line-height: 1.7;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.empty-feedback {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 11px;
  padding: 34px 24px;
  border: 1px dashed var(--feedback-border-strong);
  border-radius: 17px;
  background: var(--feedback-surface-soft);
  text-align: center;
}

.empty-feedback__icon {
  display: inline-flex;
  width: 58px;
  height: 58px;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  border-radius: 50%;
  background: var(--feedback-accent-soft);
  color: var(--feedback-accent);
  font-size: 1.7rem;
}

.empty-feedback__title {
  margin: 0;
  color: var(--feedback-text);
  font-size: 1rem;
  font-weight: 700;
}

.empty-feedback__text {
  max-width: 420px;
  margin: 0;
  color: var(--feedback-text-muted);
  font-size: 0.79rem;
  line-height: 1.6;
}

.feedback-loading {
  display: grid;
  min-height: 220px;
  place-items: center;
}

.feedback-loading__spinner {
  width: 38px;
  height: 38px;
  border: 3px solid rgba(255, 255, 255, 0.14);
  border-top-color: var(--feedback-accent);
  border-radius: 50%;
  animation: feedback-spin 0.75s linear infinite;
}

@keyframes feedback-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 600px) {
  .feedback-page {
    padding-top: 10px;
  }

  .feedback-page__header {
    margin-bottom: 14px;
    padding: 15px;
    border-radius: 13px;
  }

  .feedback-page__eyebrow {
    font-size: 0.62rem;
  }

  .close-button {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
  }

  .feedback-list {
    gap: 10px;
  }

  .feedback-card {
    border-radius: 13px;
  }

  .feedback-card__header {
    padding: 14px;
  }

  .feedback-card__body {
    padding: 14px 15px 16px;
  }

  .feedback-card__avatar {
    width: 37px;
    height: 37px;
    flex-basis: 37px;
  }

  .feedback-card__quote-mark {
    display: none;
  }

  .empty-feedback {
    min-height: 220px;
    padding: 28px 18px;
  }
}
</style>
