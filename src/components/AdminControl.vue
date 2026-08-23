<template>
  <MDBContainer fluid class="admin-page">
    <!-- Header -->
    <div class="admin-header">
      <div>
        <p class="admin-eyebrow">DuunHub SaaS</p>
        <h1>Administraatori ülevaade</h1>
        <p class="admin-subtitle">
          Platvormi kasutajad, tellimused, tehingud ja süsteemi seisund.
        </p>
      </div>

      <div class="admin-header-actions">
        <span class="system-status">
          <span class="status-dot"></span>
          Süsteem töötab
        </span>

        <MDBBtn
          color="primary"
          class="refresh-btn"
          @click="loadDashboard"
        >
          <i class="fas fa-rotate me-2"></i>
          Värskenda
        </MDBBtn>
      </div>
    </div>

    <!-- KPI CARDS -->
    <MDBRow class="g-3 mb-4">
      <MDBCol
        v-for="card in overviewCards"
        :key="card.key"
        xl="3"
        md="6"
      >
        <div class="stat-card">
          <div class="stat-card-top">
            <div>
              <p class="stat-label">
                {{ card.label }}
              </p>

              <h2 class="stat-value">
                {{ card.value }}
              </h2>
            </div>

            <div class="stat-icon">
              <i :class="card.icon"></i>
            </div>
          </div>

          <div class="stat-footer">
            <span
              class="stat-today"
              :class="{
                negative: card.today < 0
              }"
            >
              {{ card.today > 0 ? "+" : "" }}
              {{ card.today }}
            </span>

            <span class="stat-period">
              täna
            </span>
          </div>
        </div>
      </MDBCol>
    </MDBRow>

    <!-- SECONDARY METRICS -->
    <MDBRow class="g-3 mb-4">
      <MDBCol lg="8">
        <section class="admin-panel">
          <div class="panel-header">
            <div>
              <h3>Platvormi aktiivsus</h3>
              <p>Olulisemad operatiivsed näitajad</p>
            </div>
          </div>

          <div class="metric-grid">
            <div
              v-for="metric in activityMetrics"
              :key="metric.key"
              class="metric-item"
            >
              <div class="metric-icon">
                <i :class="metric.icon"></i>
              </div>

              <div>
                <span class="metric-label">
                  {{ metric.label }}
                </span>

                <strong>
                  {{ metric.value }}
                </strong>
              </div>
            </div>
          </div>
        </section>
      </MDBCol>

      <MDBCol lg="4">
        <section class="admin-panel">
          <div class="panel-header">
            <div>
              <h3>Hoiatused</h3>
              <p>Vajavad tähelepanu</p>
            </div>

            <span
              v-if="alerts.length"
              class="alert-count"
            >
              {{ alerts.length }}
            </span>
          </div>

          <div
            v-if="alerts.length"
            class="alerts-list"
          >
            <div
              v-for="alert in alerts"
              :key="alert.id"
              class="alert-item"
              :class="alert.level"
            >
              <i :class="alert.icon"></i>

              <div>
                <strong>{{ alert.title }}</strong>
                <p>{{ alert.text }}</p>
              </div>
            </div>
          </div>

          <div
            v-else
            class="empty-state"
          >
            <i class="fas fa-circle-check"></i>
            <span>Kõik korras</span>
          </div>
        </section>
      </MDBCol>
    </MDBRow>

    <!-- BOOKINGS + USERS -->
    <MDBRow class="g-3 mb-4">
      <MDBCol lg="7">
        <section class="admin-panel">
          <div class="panel-header">
            <div>
              <h3>Tellimused ametite järgi</h3>
              <p>Lõpetatud tehingute jaotus</p>
            </div>

            <span class="panel-total">
              {{ completedOrdersTotal }}
            </span>
          </div>

          <div class="search-wrap">
            <MDBInput
              v-model="searchProfession"
              label="Otsi ameti järgi..."
            >
              <template #append>
                <MDBBtn color="primary">
                  <MDBIcon icon="search" />
                </MDBBtn>
              </template>
            </MDBInput>
          </div>

          <div class="profession-list">
            <div
              v-for="(order, index) in filteredCompletedOrders"
              :key="order.profession"
              class="profession-row"
            >
              <div class="profession-info">
                <span class="profession-number">
                  {{ index + 1 }}
                </span>

                <div>
                  <strong>
                    {{ order.profession }}
                  </strong>

                  <span>
                    {{ order.count }} tehingut
                  </span>
                </div>
              </div>

              <div class="profession-count">
                {{ order.count }}
              </div>
            </div>

            <div
              v-if="!filteredCompletedOrders.length"
              class="empty-state"
            >
              <i class="fas fa-magnifying-glass"></i>
              <span>Tulemusi ei leitud</span>
            </div>
          </div>
        </section>
      </MDBCol>

      <MDBCol lg="5">
        <section class="admin-panel">
          <div class="panel-header">
            <div>
              <h3>Kasutajate jaotus</h3>
              <p>Platvormi kasutajad rollide järgi</p>
            </div>
          </div>

          <div class="user-summary">
            <div class="user-summary-row">
              <div>
                <span class="summary-dot provider"></span>
                Teenusepakkujad
              </div>

              <strong>
                {{ stats.providers }}
              </strong>
            </div>

            <div class="user-summary-row">
              <div>
                <span class="summary-dot client"></span>
                Kliendid
              </div>

              <strong>
                {{ stats.clients }}
              </strong>
            </div>

            <div class="user-summary-row">
              <div>
                <span class="summary-dot inactive"></span>
                Mitteaktiivsed
              </div>

              <strong>
                {{ stats.inactiveUsers }}
              </strong>
            </div>

            <div class="user-summary-row">
              <div>
                <span class="summary-dot blocked"></span>
                Blokeeritud
              </div>

              <strong>
                {{ stats.blockedUsers }}
              </strong>
            </div>
          </div>
        </section>
      </MDBCol>
    </MDBRow>

    <!-- BUSINESS HEALTH -->
    <MDBRow class="g-3">
      <MDBCol lg="6">
        <section class="admin-panel">
          <div class="panel-header">
            <div>
              <h3>Ärilised näitajad</h3>
              <p>SaaS-i kasvu ja kasutuse tervis</p>
            </div>
          </div>

          <div class="business-grid">
            <div class="business-item">
              <span>Tehingute väärtus</span>
              <strong>
                {{ formatCurrency(stats.transactionVolume) }}
              </strong>
            </div>

            <div class="business-item">
              <span>Keskmine tellimus</span>
              <strong>
                {{ formatCurrency(stats.averageOrderValue) }}
              </strong>
            </div>

            <div class="business-item">
              <span>Konversioon</span>
              <strong>
                {{ stats.conversionRate }}%
              </strong>
            </div>

            <div class="business-item">
              <span>Tühistamise määr</span>
              <strong>
                {{ stats.cancellationRate }}%
              </strong>
            </div>
          </div>
        </section>
      </MDBCol>

      <MDBCol lg="6">
        <section class="admin-panel">
          <div class="panel-header">
            <div>
              <h3>Süsteemi tervis</h3>
              <p>Tehnilised näitajad ja teenused</p>
            </div>
          </div>

          <div class="system-list">
            <div
              v-for="service in systemServices"
              :key="service.name"
              class="system-row"
            >
              <div>
                <span
                  class="system-service-dot"
                  :class="service.status"
                ></span>

                {{ service.name }}
              </div>

              <span
                class="system-service-status"
                :class="service.status"
              >
                {{ service.label }}
              </span>
            </div>
          </div>
        </section>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script setup>
import {
  computed,
  reactive,
  ref,
  onMounted
} from "vue";

import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBBtn,
  MDBIcon
} from "mdb-vue-ui-kit";

import { storeToRefs } from "pinia";
import adminService from ".././service/admin";
import { useLoginStore } from "@/stores/login";


const searchProfession = ref("");

const loginStore = useLoginStore();
const { token } = storeToRefs(loginStore);

const stats = reactive({
  users: 0,
  usersToday: 0,

  providers: 0,
  providersToday: 0,

  clients: 0,
  clientsToday: 0,

  activeBookings: 0,
  bookingsToday: 0,

  completedOrders: 0,
  completedOrdersToday: 0,

  openOffers: 0,

  inactiveUsers: 0,
  blockedUsers: 0,

  transactionVolume: 0,
  averageOrderValue: 0,

  conversionRate: 0,
  cancellationRate: 0,

  failedPayments: 0,
  unresolvedReports: 0
});


const completedOrders = ref([
  {
    profession: "Siivooja",
    count: 23
  },
  {
    profession: "Laatoittaja",
    count: 18
  },
  {
    profession: "Putkiasentaja",
    count: 12
  },
  {
    profession: "Sähköasentaja",
    count: 9
  }
]);


const overviewCards = computed(() => [
  {
    key: "users",
    label: "Kasutajad",
    value: stats.users,
    today: stats.usersToday,
    icon: "fas fa-users"
  },

  {
    key: "providers",
    label: "Teenusepakkujad",
    value: stats.providers,
    today: stats.providersToday,
    icon: "fas fa-user-tie"
  },

  {
    key: "bookings",
    label: "Aktiivsed tellimused",
    value: stats.activeBookings,
    today: stats.bookingsToday,
    icon: "fas fa-clipboard-list"
  },

  {
    key: "completed",
    label: "Lõpetatud tehingud",
    value: stats.completedOrders,
    today: stats.completedOrdersToday,
    icon: "far fa-handshake"
  }
]);


const activityMetrics = computed(() => [
  {
    key: "offers",
    label: "Avatud pakkumised",
    value: stats.openOffers,
    icon: "fas fa-tags"
  },

  {
    key: "clients",
    label: "Kliendid",
    value: stats.clients,
    icon: "fas fa-user"
  },

  {
    key: "failedPayments",
    label: "Ebaõnnestunud maksed",
    value: stats.failedPayments,
    icon: "fas fa-credit-card"
  },

  {
    key: "reports",
    label: "Lahendamata raportid",
    value: stats.unresolvedReports,
    icon: "fas fa-triangle-exclamation"
  }
]);


const alerts = computed(() => {
  const result = [];

  if (stats.failedPayments > 0) {
    result.push({
      id: "payments",
      title: "Makseprobleemid",
      text: `${stats.failedPayments} ebaõnnestunud makset`,
      level: "warning",
      icon: "fas fa-credit-card"
    });
  }

  if (stats.unresolvedReports > 0) {
    result.push({
      id: "reports",
      title: "Kasutajate raportid",
      text: `${stats.unresolvedReports} raportit ootab lahendamist`,
      level: "danger",
      icon: "fas fa-triangle-exclamation"
    });
  }

  return result;
});


const systemServices = ref([
  {
    name: "API server",
    status: "online",
    label: "Online"
  },
  {
    name: "MongoDB",
    status: "online",
    label: "Online"
  },
  {
    name: "AWS S3",
    status: "online",
    label: "Online"
  },
  {
    name: "Socket.IO",
    status: "online",
    label: "Online"
  },
  {
    name: "Push notifications",
    status: "online",
    label: "Online"
  }
]);


const filteredCompletedOrders = computed(() => {
  const search =
    searchProfession.value
      .trim()
      .toLowerCase();

  if (!search) {
    return completedOrders.value;
  }

  return completedOrders.value.filter(
    order =>
      order.profession
        .toLowerCase()
        .includes(search)
  );
});


const completedOrdersTotal = computed(() =>
  completedOrders.value.reduce(
    (sum, item) => sum + item.count,
    0
  )
);


const formatCurrency = value =>
  new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR"
  }).format(value || 0);


const loadDashboard = async () => {
  /*
   * Hiljem:
   *
   * const response =
   *   await adminService.getDashboard();
   *
   * Object.assign(
   *   stats,
   *   response.stats
   * );
   *
   * completedOrders.value =
   *   response.completedOrders;
  */

  console.log("TOKEN - " + token.value);

  const response = await adminService.getDashboard(token.value);

  console.log("----- ADMIN ---- ", response);

  Object.assign(
    stats,
    response.stats
  );

  console.log("Load admin dashboard");
};


onMounted(() => {
  //loadDashboard();
});
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  padding-top: 34px;
  padding-bottom: 60px;

  color: #e5e7eb;
}


/* HEADER */

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  gap: 24px;

  margin-bottom: 26px;
}

.admin-eyebrow {
  margin: 0 0 4px;

  color: #38bdf8;

  font-size: 12px;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.admin-header h1 {
  margin: 0;

  color: #f8fafc;

  font-size: clamp(24px, 3vw, 32px);
  font-weight: 700;
}

.admin-subtitle {
  margin: 6px 0 0;

  color: #94a3b8;

  font-size: 14px;
}

.admin-header-actions {
  display: flex;
  align-items: center;

  gap: 12px;
}

.system-status {
  display: flex;
  align-items: center;

  gap: 7px;

  color: #94a3b8;

  font-size: 13px;
}

.status-dot {
  width: 8px;
  height: 8px;

  background: #22c55e;

  border-radius: 50%;

  box-shadow:
    0 0 8px rgba(34, 197, 94, 0.6);
}

.refresh-btn {
  border-radius: 9px;
}


/* CARDS */

.stat-card,
.admin-panel {
  background:
    linear-gradient(
      145deg,
      rgba(30, 41, 59, 0.97),
      rgba(15, 23, 42, 0.97)
    );

  border:
    1px solid rgba(148, 163, 184, 0.15);

  border-radius: 15px;

  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.15);
}

.stat-card {
  height: 100%;

  padding: 18px;
}

.stat-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-label {
  margin: 0 0 7px;

  color: #94a3b8;

  font-size: 13px;
}

.stat-value {
  margin: 0;

  color: #f8fafc;

  font-size: 29px;
  font-weight: 700;
}

.stat-icon {
  width: 43px;
  height: 43px;

  display: grid;
  place-items: center;

  color: #38bdf8;

  background:
    rgba(14, 165, 233, 0.12);

  border:
    1px solid rgba(56, 189, 248, 0.15);

  border-radius: 12px;

  font-size: 18px;
}

.stat-footer {
  display: flex;
  align-items: center;

  gap: 6px;

  margin-top: 17px;
}

.stat-today {
  color: #22c55e;

  font-size: 13px;
  font-weight: 700;
}

.stat-today.negative {
  color: #ef4444;
}

.stat-period {
  color: #64748b;

  font-size: 12px;
}


/* PANELS */

.admin-panel {
  height: 100%;

  padding: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  gap: 14px;

  margin-bottom: 18px;
}

.panel-header h3 {
  margin: 0;

  color: #f8fafc;

  font-size: 16px;
  font-weight: 650;
}

.panel-header p {
  margin: 4px 0 0;

  color: #64748b;

  font-size: 12px;
}

.panel-total,
.alert-count {
  min-width: 30px;
  height: 30px;

  display: grid;
  place-items: center;

  padding: 0 8px;

  color: #38bdf8;

  background:
    rgba(56, 189, 248, 0.11);

  border-radius: 9px;

  font-size: 12px;
  font-weight: 700;
}


/* METRICS */

.metric-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 12px;
}

.metric-item {
  display: flex;
  align-items: center;

  gap: 12px;

  padding: 14px;

  background:
    rgba(15, 23, 42, 0.55);

  border:
    1px solid rgba(148, 163, 184, 0.10);

  border-radius: 11px;
}

.metric-icon {
  width: 38px;
  height: 38px;

  display: grid;
  place-items: center;

  color: #fb923c;

  background:
    rgba(249, 115, 22, 0.10);

  border-radius: 10px;
}

.metric-item div:last-child {
  display: flex;
  flex-direction: column;
}

.metric-label {
  color: #94a3b8;

  font-size: 11px;
}

.metric-item strong {
  color: #f8fafc;

  font-size: 18px;
}


/* ALERTS */

.alerts-list {
  display: flex;
  flex-direction: column;

  gap: 9px;
}

.alert-item {
  display: flex;
  align-items: flex-start;

  gap: 10px;

  padding: 11px;

  background:
    rgba(245, 158, 11, 0.08);

  border:
    1px solid rgba(245, 158, 11, 0.15);

  border-radius: 9px;
}

.alert-item.danger {
  background:
    rgba(239, 68, 68, 0.08);

  border-color:
    rgba(239, 68, 68, 0.15);
}

.alert-item i {
  margin-top: 2px;

  color: #f59e0b;
}

.alert-item.danger i {
  color: #ef4444;
}

.alert-item strong {
  display: block;

  color: #e5e7eb;

  font-size: 12px;
}

.alert-item p {
  margin: 3px 0 0;

  color: #94a3b8;

  font-size: 11px;
}


/* SEARCH */

.search-wrap {
  margin-bottom: 14px;
}


/* PROFESSION LIST */

.profession-list {
  display: flex;
  flex-direction: column;

  gap: 7px;


  max-height: 200px;
  overflow-y: auto;

  padding-right: 5px;
}

/* scrollbar */
.profession-list::-webkit-scrollbar {
  width: 5px;
}

.profession-list::-webkit-scrollbar-track {
  background: transparent;
}

.profession-list::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 10px;
}

.profession-list::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

.profession-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 11px 12px;

  background:
    rgba(15, 23, 42, 0.55);

  border:
    1px solid rgba(148, 163, 184, 0.08);

  border-radius: 9px;
}

.profession-info {
  display: flex;
  align-items: center;

  gap: 11px;
}

.profession-number {
  width: 28px;
  height: 28px;

  display: grid;
  place-items: center;

  color: #38bdf8;

  background:
    rgba(56, 189, 248, 0.10);

  border-radius: 8px;

  font-size: 11px;
  font-weight: 700;
}

.profession-info div {
  display: flex;
  flex-direction: column;
}

.profession-info strong {
  color: #e5e7eb;

  font-size: 13px;
}

.profession-info span {
  color: #64748b;

  font-size: 11px;
}

.profession-count {
  color: #f8fafc;

  font-size: 14px;
  font-weight: 700;
}


/* USER SUMMARY */

.user-summary {
  display: flex;
  flex-direction: column;

  gap: 5px;
}

.user-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 12px 4px;

  border-bottom:
    1px solid rgba(148, 163, 184, 0.09);

  color: #cbd5e1;

  font-size: 13px;
}

.user-summary-row:last-child {
  border-bottom: 0;
}

.user-summary-row > div {
  display: flex;
  align-items: center;

  gap: 9px;
}

.summary-dot {
  width: 8px;
  height: 8px;

  border-radius: 50%;
}

.summary-dot.provider {
  background: #38bdf8;
}

.summary-dot.client {
  background: #22c55e;
}

.summary-dot.inactive {
  background: #64748b;
}

.summary-dot.blocked {
  background: #ef4444;
}


/* BUSINESS */

.business-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 11px;
}

.business-item {
  display: flex;
  flex-direction: column;

  gap: 5px;

  padding: 14px;

  background:
    rgba(15, 23, 42, 0.55);

  border-radius: 10px;
}

.business-item span {
  color: #64748b;

  font-size: 11px;
}

.business-item strong {
  color: #f8fafc;

  font-size: 19px;
}


/* SYSTEM */

.system-list {
  display: flex;
  flex-direction: column;

  gap: 3px;
}

.system-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 10px 3px;

  border-bottom:
    1px solid rgba(148, 163, 184, 0.08);

  color: #cbd5e1;

  font-size: 12px;
}

.system-row > div {
  display: flex;
  align-items: center;

  gap: 8px;
}

.system-service-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;
}

.system-service-dot.online {
  background: #22c55e;
}

.system-service-dot.warning {
  background: #f59e0b;
}

.system-service-dot.offline {
  background: #ef4444;
}

.system-service-status {
  font-size: 11px;
}

.system-service-status.online {
  color: #22c55e;
}

.system-service-status.warning {
  color: #f59e0b;
}

.system-service-status.offline {
  color: #ef4444;
}


/* EMPTY */

.empty-state {
  min-height: 90px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 7px;

  color: #64748b;

  font-size: 12px;
}

.empty-state i {
  color: #22c55e;

  font-size: 20px;
}


/* MOBILE */

@media (max-width: 768px) {
  .admin-page {
    padding-top: 20px;
  }

  .admin-header {
    flex-direction: column;
  }

  .admin-header-actions {
    width: 100%;

    justify-content: space-between;
  }

  .metric-grid,
  .business-grid {
    grid-template-columns: 1fr;
  }
}
</style>