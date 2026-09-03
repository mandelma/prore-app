<template>
  <div class="history">

    <!-- Close -->
    <div
      v-if="!showDetails"
      class="history__close"
    >
      <MDBBtnClose
        white
        @click="router.go(-1)"
      />
    </div>

    <!-- LIST VIEW -->
    <div v-if="!showDetails">

      <div class="history__detailTop">

        <div class="history__header">
          <div class="history__eyebrow">
            <i class="fas fa-clock-rotate-left"></i>
            {{ t("providerHistory.history") }}
          </div>

          <h3 class="history__title">
            {{ t("providerHistory.title") }}
          </h3>

          <p class="history__subtitle">
            {{ t("providerHistory.subtitle") }}
          </p>
        </div>

        <div class="search-wrap">
          <MDBInput
            size="sm"
            :label="t('providerHistory.search')"
            v-model="clientQuery"
          />
        </div>

      </div>

      <!-- EMPTY STATE -->
      <div
        v-if="!filteredClientsHistory.length"
        class="historyEmpty"
      >
        <div class="historyEmpty__icon">
          <i class="fas fa-box-archive"></i>
        </div>

        <div class="historyEmpty__title">
          {{ t("providerHistory.empty_title") }}
        </div>

        <div class="historyEmpty__text">
          {{ t("providerHistory.empty_text") }}
        </div>
      </div>

      <!-- MOBILE -->
      <div
        v-else
        class="history__cards d-md-none"
      >
        <div
          v-for="b in filteredClientsHistory"
          :key="b.id"
          class="historyCard"
        >
          <div class="historyCard__top">

            <div class="historyCard__content">
              <div class="historyCard__date">
                <i class="far fa-calendar me-1"></i>
                {{ formatDateTime(b.start ?? b.date) }}
              </div>

              <div class="historyCard__company">
                {{ b.name }}
              </div>

              <div class="historyCard__service">
                {{ b.header }}
              </div>
            </div>

            <span class="statusBadge statusBadge--done">
              <i class="fas fa-check"></i>
              {{ t("providerHistory.completed") }}
            </span>

          </div>

          <div class="historyCard__actions">

            <MDBBtn
              outline="info"
              size="sm"
              @click="openDetails(b)"
            >
              <i class="fas fa-eye me-1"></i>
              {{ t("providerHistory.details") }}
            </MDBBtn>

            <MDBBtn
              outline="danger"
              size="sm"
              @click="removeRow(b)"
            >
              <i class="far fa-trash-can me-1"></i>
              {{ t("providerHistory.delete") }}
            </MDBBtn>

          </div>
        </div>
      </div>

      <!-- DESKTOP -->
      <MDBTable
        v-if="filteredClientsHistory.length"
        borderless
        class="historyTable d-none d-md-table"
      >
        <thead>
          <tr>
            <th>{{ t("providerHistory.date") }}</th>
            <th>{{ t("providerHistory.client") }}</th>
            <th>{{ t("providerHistory.task") }}</th>
            <th>{{ t("providerHistory.status") }}</th>
            <th class="text-end">
              {{ t("providerHistory.actions") }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="b in filteredClientsHistory"
            :key="b.id"
            class="historyTable__row"
          >
            <td class="history__muted">
              {{ formatDateTime(b.start ?? b.date) }}
            </td>

            <td class="history__strong">
              {{ b.name }}
            </td>

            <td class="history__muted">
              {{ b.header }}
            </td>

            <td>
              <span class="statusBadge statusBadge--done">
                <i class="fas fa-check"></i>
                {{ t("providerHistory.completed") }}
              </span>
            </td>

            <td class="text-end historyTable__actions">

              <MDBBtn
                outline="info"
                size="sm"
                @click="openDetails(b)"
              >
                <i class="fas fa-eye me-1"></i>
                {{ t("providerHistory.details") }}
              </MDBBtn>

              <MDBBtn
                outline="danger"
                size="sm"
                @click="removeRow(b)"
              >
                <i class="far fa-trash-can me-1"></i>
                {{ t("providerHistory.delete") }}
              </MDBBtn>

            </td>
          </tr>
        </tbody>
      </MDBTable>

    </div>


    <!-- DETAILS VIEW -->
    <div v-else>

      <div class="history__detailTop history__detailTop--details">

        <MDBBtn
          outline="light"
          size="sm"
          @click="closeDetails"
        >
          <i class="fas fa-arrow-left me-2"></i>
          {{ t("providerHistory.back") }}
        </MDBBtn>

        <span class="statusBadge statusBadge--done">
          <i class="fas fa-check"></i>
          {{ t("providerHistory.completed") }}
        </span>

      </div>


      <section class="historySection">

        <div class="historySection__header">
          <div class="historySection__icon">
            <i class="far fa-calendar-check"></i>
          </div>

          <div>
            <h4 class="historySection__title">
              {{ t("providerHistory.booking") }}
            </h4>

            <div class="historySection__subtitle">
              {{ selectedRow?.header }}
            </div>
          </div>
        </div>


        <div class="kv">

          <div class="kv__k">
            {{ t("providerHistory.date") }}
          </div>

          <div class="kv__v">
            {{ formatDateTime(selectedRow?.start ?? selectedRow?.date) }}
          </div>


          <div class="kv__k">
            {{ t("providerHistory.client") }}
          </div>

          <div class="kv__v">
            {{ selectedRow?.name || "—" }}
          </div>


          <div class="kv__k">
            {{ t("providerHistory.task") }}
          </div>

          <div class="kv__v">
            {{ selectedRow?.header || "—" }}
          </div>


          <div class="kv__k">
            {{ t("providerHistory.description") }}
          </div>

          <div class="kv__v">
            {{ selectedRow?.content || "—" }}
          </div>


          <div class="kv__k">
            {{ t("providerHistory.distance") }}
          </div>

          <div class="kv__v">
            {{ selectedRow?.distance != null
              ? `${selectedRow.distance} km`
              : "—"
            }}
          </div>


          <div class="kv__k">
            {{ t("providerHistory.duration") }}
          </div>

          <div class="kv__v">
            {{ getWorkDuration(
              selectedRow?.start,
              selectedRow?.end
            ) }}
          </div>


          <div class="kv__k">
            {{ t("providerHistory.status") }}
          </div>

          <div class="kv__v">
            <span class="statusBadge statusBadge--done">
              <i class="fas fa-check"></i>
              {{ t("providerHistory.completed") }}
            </span>
          </div>


          <template v-if="selectedRow?.wage != null">

            <div class="kv__k">
              {{ t("providerHistory.price") }}
            </div>

            <div class="kv__v kv__v--price">
              {{ selectedRow.wage }} €
            </div>

          </template>


          <template v-if="selectedRow?.notes">

            <div class="kv__k">
              {{ t("providerHistory.additional_info") }}
            </div>

            <div class="kv__v">
              {{ selectedRow.notes }}
            </div>

          </template>

        </div>

      </section>
    </div>
  </div>


  <ConfirmModal
    v-model="showDeleteModal"
    :title="t('providerHistory.delete_title')"
    :message="t('providerHistory.delete_message')"
    :confirm-text="t('providerHistory.delete')"
    :cancel-text="t('providerHistory.cancel')"
    :danger="true"
    @confirm="handleRemoveRow"
    @cancel="handleCancelRemoving"
  />
</template>
<script setup>
import {
  MDBBtn,
  MDBBtnClose,
  MDBInput,
  MDBTable
} from "mdb-vue-ui-kit";

import {
  ref,
  computed
} from "vue";

import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";

import { useProArchiveStore } from "@/stores/pArchiveStore";
import pArchiveService from "../../service/provider_history";

import ConfirmModal from "../helpers/ConfirmModal.vue";


defineOptions({
  name: "provider-history"
});


const router = useRouter();

const {
  t,
  locale
} = useI18n();

const proArchiveStore = useProArchiveStore();

const {
  providerHistory
} = storeToRefs(proArchiveStore);


const clientQuery = ref("");

const showDetails = ref(false);

const selectedRow = ref(null);

const rowId = ref(null);

const showDeleteModal = ref(false);


/*
 * Locale mapping for Intl.DateTimeFormat
 */
const dateLocale = computed(() => {
  const locales = {
    fi: "fi-FI",
    en: "en-GB",
    sv: "sv-SE",
    et: "et-EE",
    ru: "ru-RU"
  };

  return locales[locale.value] ?? "fi-FI";
});


const formatDateTime = (iso) => {
  if (!iso) {
    return "—";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(
    dateLocale.value,
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }
  );
};


/*
 * Search
 */
const filteredClientsHistory = computed(() => {
  const query =
    clientQuery.value
      .trim()
      .toLowerCase();

  if (!query) {
    return providerHistory.value ?? [];
  }

  return (providerHistory.value ?? []).filter(
    booking => {
      const searchable = [
        booking?.name,
        booking?.header,
        booking?.content
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    }
  );
});


/*
 * Duration
 */
const getWorkDuration = (start, end) => {

  if (!start || !end) {
    return "—";
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  const diffMs =
    endDate.getTime() -
    startDate.getTime();

  if (
    !Number.isFinite(diffMs) ||
    diffMs <= 0
  ) {
    return "—";
  }

  const totalMinutes =
    Math.floor(
      diffMs / (1000 * 60)
    );

  const hours =
    Math.floor(
      totalMinutes / 60
    );

  const minutes =
    totalMinutes % 60;

  const parts = [];

  if (hours > 0) {
    parts.push(
      t(
        "providerHistory.duration_hours",
        { count: hours }
      )
    );
  }

  if (minutes > 0) {
    parts.push(
      t(
        "providerHistory.duration_minutes",
        { count: minutes }
      )
    );
  }

  return parts.join(" ") || "—";
};


const openDetails = booking => {
  selectedRow.value = booking;
  showDetails.value = true;
};


const closeDetails = () => {
  showDetails.value = false;
  selectedRow.value = null;
};


const removeRow = booking => {
  rowId.value = booking.id;
  showDeleteModal.value = true;
};


const handleRemoveRow = async () => {
  const id = rowId.value;

  if (!id) {
    return;
  }

  try {

    await pArchiveService
      .deleteProviderArchiveRow(id);

    /*
     * Jätsin sinu olemasoleva store meetodi alles.
     * Kontrolli ainult, et upsertArchive(id)
     * eemaldab rea store'ist.
     */
    proArchiveStore.upsertArchive(id);

    rowId.value = null;

    if (!providerHistory.value?.length) {
      router.go(-1);
    }

  } catch (error) {

    console.error(
      "Failed to remove archived booking:",
      error
    );
  }
};


const handleCancelRemoving = () => {
  rowId.value = null;
};

</script>
<style scoped>
.history {
  width: 100%;
  max-width: 1050px;

  margin: 0 auto;
  padding: 18px;

  color: rgba(255, 255, 255, 0.92);
}


/* =========================
   CLOSE
========================= */

.history__close {
  display: flex;
  justify-content: flex-end;

  margin-bottom: 4px;
}


/* =========================
   HEADER
========================= */

.history__detailTop {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  gap: 20px;

  margin: 8px 0 22px;
}


.history__header {
  min-width: 0;
}


.history__eyebrow {
  display: flex;
  align-items: center;

  gap: 7px;

  margin-bottom: 7px;

  color: #60a5fa;

  font-size: 0.72rem;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.09em;
}


.history__title {
  margin: 0;

  font-size: 1.45rem;
  font-weight: 700;

  letter-spacing: -0.015em;

  color: #f8fafc;
}


.history__subtitle {
  margin: 6px 0 0;

  max-width: 520px;

  font-size: 0.82rem;
  line-height: 1.5;

  color: #94a3b8;
}


/* =========================
   SEARCH
========================= */

.search-wrap {
  width: 230px;
  flex-shrink: 0;
}


.search-wrap :deep(.form-outline) {
  width: 100%;
}


.search-wrap :deep(.form-control) {
  color: #e2e8f0;

  background: rgba(15, 23, 42, 0.55);

  border-radius: 10px;
}


.search-wrap :deep(.form-label) {
  color: #94a3b8;
}


/* =========================
   TABLE
========================= */

.historyTable {
  width: 100%;

  overflow: hidden;

  font-size: 0.83rem;

  background: rgba(15, 23, 42, 0.48);

  border: 1px solid rgba(148, 163, 184, 0.12);

  border-radius: 16px;

  box-shadow:
    0 14px 35px rgba(0, 0, 0, 0.12);
}


.historyTable thead th {
  padding: 12px 14px;

  font-size: 0.66rem;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.09em;

  color: #64748b;

  background: rgba(15, 23, 42, 0.55);

  border-bottom:
    1px solid rgba(148, 163, 184, 0.12);
}


.historyTable__row td {
  padding: 13px 14px;

  vertical-align: middle;

  border-bottom:
    1px solid rgba(148, 163, 184, 0.08);

  transition:
    background 0.15s ease;
}


.historyTable__row:last-child td {
  border-bottom: none;
}


.historyTable__row:hover td {
  background: rgba(59, 130, 246, 0.045);
}


.historyTable__actions {
  white-space: nowrap;
}


.historyTable__actions .btn + .btn {
  margin-left: 7px;
}


.history__muted {
  color: #94a3b8;
}


.history__strong {
  color: #e2e8f0;

  font-weight: 600;
}


/* =========================
   STATUS
========================= */

.statusBadge {
  display: inline-flex;
  align-items: center;

  gap: 5px;

  padding: 5px 9px;

  border-radius: 999px;

  font-size: 0.68rem;
  font-weight: 700;

  white-space: nowrap;
}


.statusBadge--done {
  color: #6ee7b7;

  background: rgba(16, 185, 129, 0.10);

  border:
    1px solid rgba(16, 185, 129, 0.22);
}


.statusBadge--done i {
  font-size: 0.58rem;
}


/* =========================
   MOBILE CARDS
========================= */

.history__cards {
  display: grid;

  gap: 12px;
}


.historyCard {
  padding: 15px;

  background:
    linear-gradient(
      145deg,
      rgba(30, 41, 59, 0.68),
      rgba(15, 23, 42, 0.60)
    );

  border:
    1px solid rgba(148, 163, 184, 0.12);

  border-radius: 16px;

  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.12);
}


.historyCard__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 12px;

  margin-bottom: 14px;
}


.historyCard__content {
  min-width: 0;
}


.historyCard__date {
  margin-bottom: 4px;

  font-size: 0.72rem;

  color: #64748b;
}


.historyCard__company {
  overflow: hidden;

  font-size: 0.94rem;
  font-weight: 700;

  color: #f1f5f9;

  text-overflow: ellipsis;
  white-space: nowrap;
}


.historyCard__service {
  margin-top: 3px;

  font-size: 0.8rem;
  line-height: 1.4;

  color: #94a3b8;
}


.historyCard__actions {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 9px;
}


/* =========================
   DETAILS
========================= */

.history__detailTop--details {
  align-items: center;
}


.historySection {
  width: min(720px, 100%);

  margin: 0 auto;

  padding: 20px;

  background:
    linear-gradient(
      145deg,
      rgba(30, 41, 59, 0.70),
      rgba(15, 23, 42, 0.60)
    );

  border:
    1px solid rgba(148, 163, 184, 0.12);

  border-radius: 18px;

  box-shadow:
    0 16px 38px rgba(0, 0, 0, 0.16);
}


.historySection__header {
  display: flex;
  align-items: center;

  gap: 12px;

  padding-bottom: 16px;
  margin-bottom: 18px;

  border-bottom:
    1px solid rgba(148, 163, 184, 0.10);
}


.historySection__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 38px;
  height: 38px;

  flex-shrink: 0;

  border-radius: 11px;

  color: #60a5fa;

  background:
    rgba(59, 130, 246, 0.10);

  border:
    1px solid rgba(59, 130, 246, 0.16);
}


.historySection__title {
  margin: 0;

  font-size: 0.95rem;
  font-weight: 700;

  color: #f1f5f9;
}


.historySection__subtitle {
  margin-top: 2px;

  font-size: 0.75rem;

  color: #64748b;
}


/* =========================
   KEY / VALUE GRID
========================= */

.kv {
  display: grid;

  grid-template-columns: 155px 1fr;

  column-gap: 22px;
  row-gap: 0;
}


.kv__k,
.kv__v {
  padding: 10px 0;

  border-bottom:
    1px solid rgba(148, 163, 184, 0.07);
}


.kv__k {
  font-size: 0.66rem;
  font-weight: 700;

  color: #64748b;

  text-transform: uppercase;

  letter-spacing: 0.07em;
}


.kv__v {
  font-size: 0.84rem;
  line-height: 1.5;

  color: #cbd5e1;

  overflow-wrap: anywhere;
}


.kv__v--price {
  font-weight: 700;

  color: #6ee7b7;
}


/* =========================
   EMPTY
========================= */

.historyEmpty {
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  min-height: 260px;

  padding: 30px;

  text-align: center;

  background:
    rgba(15, 23, 42, 0.35);

  border:
    1px dashed rgba(148, 163, 184, 0.16);

  border-radius: 16px;
}


.historyEmpty__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 48px;
  height: 48px;

  margin-bottom: 12px;

  border-radius: 14px;

  font-size: 1.1rem;

  color: #64748b;

  background:
    rgba(148, 163, 184, 0.08);
}


.historyEmpty__title {
  font-size: 0.9rem;
  font-weight: 700;

  color: #cbd5e1;
}


.historyEmpty__text {
  max-width: 350px;

  margin-top: 5px;

  font-size: 0.76rem;
  line-height: 1.5;

  color: #64748b;
}


/* =========================
   MOBILE
========================= */

@media (max-width: 767px) {

  .history {
    padding: 13px;
  }


  .history__detailTop {
    align-items: stretch;

    flex-direction: column;

    gap: 14px;
  }


  .history__detailTop--details {
    flex-direction: row;

    align-items: center;
  }


  .search-wrap {
    width: 100%;
  }


  .historySection {
    padding: 16px;
  }


  .kv {
    grid-template-columns: 1fr;
  }


  .kv__k {
    padding-bottom: 2px;

    border-bottom: none;
  }


  .kv__v {
    padding-top: 1px;
    padding-bottom: 11px;
  }

}


@media (max-width: 420px) {

  .historyCard__actions {
    grid-template-columns: 1fr;
  }


  .history__title {
    font-size: 1.25rem;
  }

}
</style>