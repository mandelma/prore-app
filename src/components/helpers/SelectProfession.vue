<template>
    <div>
        <Select
            style="width: 100%;"
            v-model="selectedProfessionCode"
            :options="groupedProfessions"
            option-label="label"
            option-value="code"
            option-group-label="label"
            option-group-children="items"
            filter
            filter-by="label"
            :placeholder="label"
            showClear
            class="booking-control"
        >
            <template #optiongroup="{ option }">
                <div class="profession-group">
                <i :class="option.icon" />
                &nbsp;&nbsp;<span>{{ option.label }}</span>
                </div>
            </template>

            <template #option="{ option }">
                <div class="profession-option">
                    <i style="color: orange;" :class="option.icon" />
                    <strong>&nbsp;&nbsp;&nbsp;{{ option.label }}</strong>
                    <div>
                        <small v-if="option.localizedDescription">
                        {{ option.localizedDescription }}
                        </small>
                    </div>
                </div>
            </template>
        </Select>
        <small
            v-if="errors.profession"
            class="profession-field__error"
            >
            <i class="fa-solid fa-circle-exclamation" />
            {{ errors.profession }}
        </small>
    </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n'; 
import Select from 'primevue/select';
import { storeToRefs } from 'pinia';
import { useProfessionStore } from '@/stores/professionStore';

import '@/styles/form.css';

const props = defineProps({
    modelValue: {
        type: String,
        default: undefined
    },
    form: {
        type: Object,
        default: null
    },
    label: {
        type: String,
        required: true
    },
    errors: {
        type: Object,
        default: () => ({})
    },
    professions: {
        type: Array,
        required: true
    }
});

const emit = defineEmits([
  "update:modelValue",
  "change"
]);

const { t, locale } = useI18n();

const professionStore = useProfessionStore();
const { professionCategories, professions } = storeToRefs(professionStore);

const selectedProfessionCode = computed({
  get() {
    if (props.modelValue !== undefined) {
      return props.modelValue;
    }

    return props.form?.profession ?? "";
  },

  set(code) {
    const value = code ?? "";

    if (props.modelValue !== undefined) {
      emit("update:modelValue", value);
    }

    if (props.form) {
      props.form.profession = value;
    }

    emit("change", value);
  }
});

const getLocalizedValue = translations => {
  if (!translations) {
    return "";
  }

  return (
    translations[locale.value] ||
    translations.en ||
    translations.fi ||
    Object.values(translations).find(Boolean) ||
    ""
  );
};

const groupedProfessions = computed(() => {
  return professionCategories.value
    .filter(category => category.enabled)
    .sort((a, b) => {
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    })
    .map(category => {
      const items = professions.value
        .filter(profession => {
          return (
            profession.enabled &&
            profession.categoryCode === category.code
          );
        })
        .sort((a, b) => {
          return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        })
        .map(profession => ({
          ...profession,

          label: getLocalizedValue(profession.name),

          localizedDescription: getLocalizedValue(
            profession.description
          )
        }));

      

      return {
        code: category.code,
        label: getLocalizedValue(category.name),
        description: getLocalizedValue(category.description),
        icon: category.icon,
        sortOrder: category.sortOrder,
        items
      };
    })
    .filter(category => category.items.length > 0);
});

</script>
<style scoped>

</style>