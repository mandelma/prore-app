<template>
    <div v-if="isAuthenticated" class="admin-info-wrap">
        <div  class="admin-notice">
            <div class="admin-notice__icon">
                <i class="fas fa-bullhorn"></i>
            </div>

            <div class="admin-notice__content">
                <div class="admin-notice__title">
                DuunHub
                </div>

                <div class="admin-notice__text">
                    Admin message here!
                </div>
            </div>
        </div>
    </div>
    
</template>
<script setup>
import { useI18n } from 'vue-i18n';
const props = defineProps({
    isAuthenticated: {
        type: Boolean,
        required: true
    }
})

const { t } = useI18n();

</script>
<style scoped>
.admin-info-wrap {
  width: 100%;
  padding: 3px 14px 0;

  box-sizing: border-box;

  position: relative;
  z-index: 100;
}

.admin-notice {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  padding: 10px 14px;

  border: 1px solid rgba(56, 189, 248, 0.3);
  border-left: 4px solid #38bdf8;
  border-radius: 8px;

  background: rgba(56, 189, 248, 0.08);
  box-sizing: border-box;

  color: #e5e7eb;
}

.admin-notice__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 36px;
  height: 36px;
  flex: 0 0 36px;

  border-radius: 50%;

  background: rgba(56, 189, 248, 0.14);
  color: #38bdf8;

  font-size: 15px;
}

.admin-notice__content {
  flex: 1;
  min-width: 0;
}

.admin-notice__title {
  margin-bottom: 2px;

  color: #7dd3fc;
  font-size: 13px;
  font-weight: 700;
}

.admin-notice__text {
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  line-height: 1.4;
}
</style>
