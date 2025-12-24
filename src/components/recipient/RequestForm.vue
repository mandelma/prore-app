<template>
    <MDBContainer>
        <form style="background-color: #0b1618; padding: 17px; border: 1px solid #1B2330; border-radius: 8px;">
          <div style="display: flex; justify-content: right;">
            <MDBBtn color="dark">
              <i class="far fa-comment"></i>
            </MDBBtn>
            
          </div>
        
          <div class="field-wrapper">
          <p>{{ props.target?.profession.join(', ')}}</p>
          </div>
          <div class="field-wrapper">
              <!-- <p>{{ formatLocalDate(props.date) }}</p> -->
              <p>{{ props.date }}</p>
          </div>
          <div class="field-wrapper">
              <MDBInput
                  label="Syötä tilauksen avainsana *"
                  v-model="form.requestHeader"
                  size="lg"
                  invalidFeedback="Ole hyvä ja kirjoita avainsana."
                  validFeedback="Ok!"
                  required

              />
              <span v-if="errors.requestHeader" class="field-footer">{{ errors.requestHeader }}</span>
              <!-- custom error text -->
              
          <div style="margin-top: 17px;" class="field-wrapper">
              <MDBTextarea
                  maxlength="70"
                  label="Kuvaus tilauksen sisällöstä *"
                  rows="3"
                  v-model="form.requestContent"
                  invalidFeedback="Ole hyvä ja kirjoita tehtävän kuvaus."
                  validFeedback="Ok!"
                  required
              />
              <span v-if="errors.requestContent" class="field-footer">{{ errors.requestContent }}</span>
              <span class="message-counter"> {{form.requestContent.length}} / 70</span>
              </div>

          </div>
          
          <MDBBtn color="primary" @click="handleRequest">LÄHETÄÄ TILAUS</MDBBtn>
        </form>
        
    </MDBContainer>
</template>
<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount, computed, nextTick, reactive, watch } from 'vue'
import {MDBContainer, MDBTextarea, MDBInput, MDBBtn, MDBIcon} from 'mdb-vue-ui-kit';
defineOptions({
    name: 'request-form'
})
const props = defineProps({
    target: {type: null},
    date: String
})
const emit = defineEmits(['sendRequest']);

const form = reactive({
  requestHeader: "",
  requestContent: ""
});
const errors = reactive({});

const validateForm = () => {
  errors.requestHeader = form.requestHeader ? "" : "Avainsana on pakollinen kentä!";
 
  errors.requestContent = form.requestContent ? "" : "Tilauksen lyhyt kuvaus on pakollinen!";

  return !errors.requestHeader && !errors.requestContent;
}

watch(() => form.requestHeader, () => (errors.requestHeader = ""));

watch(() => form.requestContent, () => (errors.requestContent = ""));

const isValidDate = (d) => d instanceof Date && !isNaN(+d);


// 2) sanitize string→Date parsing (return null if bad)
function parseMaybeDate(v) {
  if (v instanceof Date) return isValidDate(v) ? v : null;
  if (typeof v === 'string') {
    const d = new Date(v);
    return isValidDate(d) ? d : null;
  }
  if (typeof v === 'number') {
    const d = new Date(v);
    return isValidDate(d) ? d : null;
  }
  return null;
}

const fromLocalInput = (v) => {
  if (!v) return null;
  if (v instanceof Date) return isValidDate(v) ? v : null;

  if (typeof v === 'string') {
    // 1) ISO or ISO-like
    const dIso = new Date(v.includes('T') ? v : v.replace(',', '').replace(' ', 'T'));
    if (isValidDate(dIso)) return dIso;

    // 2) "YYYY-MM-DD, HH:mm" or "YYYY-MM-DD HH:mm"
    let m = v.match(/^(\d{4})-(\d{2})-(\d{2})[,\s]+(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (m) {
      const [, y, mo, d, h, mi, s] = m.map(Number);
      return new Date(y, mo - 1, d, h, mi, s || 0); // local time
    }

    // 3) "DD.MM.YYYY HH:mm"
    m = v.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (m) {
      const [, d, mo, y, h, mi, s] = m.map(Number);
      return new Date(y, mo - 1, d, h, mi, s || 0);
    }
  }
  return null;
};

const formatLocalDate = (value) => {
  const d = fromLocalInput(value);
  if (!isValidDate(d)) return '';
  return new Intl.DateTimeFormat('fi-FI', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Helsinki',
    hour12: false,
    hourCycle: 'h23',
  }).format(d);
};

const handleRequest = () => {

    if (!validateForm()) {
        console.log("No validated");
    } else {
        console.log("Validated");

        

        emit('sendRequest', {
            header: form.requestHeader,
            content: form.requestContent,
        });
    }
}

</script>
<style scoped>
.message-counter {
  float: right;
  opacity: 0.5;
}
</style>