<template>
    <MDBContainer>
        <div v-if="route.name === 'pro-feedback'" style="display: flex; justify-content: right; padding: 7px 0 7px 0">
            <MDBBtnClose white @click="router.go(-1)"/>
        </div>
        <div class="feedback-box" v-for="fb in provider?.feedback" :key="fb.date">
            <MDBCard style="" v-if="fb?.text !==''">
                
                <MDBCardHeader>
                    <!-- <Stars :rating="fb.rating" /> -->
                    <p class="text-muted">{{formatDateTime(fb.date)}}</p>
                </MDBCardHeader>
                <MDBCardBody>
                    <MDBCardTitle style="color:aqua;">{{ fb?.sender }}</MDBCardTitle>
                    <MDBCardText>
                        {{ fb?.text  }}
                    </MDBCardText>
                </MDBCardBody>
            </MDBCard>
        </div>
        
    </MDBContainer>
    
</template>
<script setup>
import { MDBContainer, MDBCard, MDBCardBody, MDBCardText, MDBCardTitle, MDBBadge, MDBBtnClose, MDBCardHeader } from 'mdb-vue-ui-kit';
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia';
import { useProStore } from '@/stores/providerStore';
import providerService from '../../service/providers';

import Stars from '../Stars.vue';

defineOptions ({
    name: 'pro-feedback'
})

const props = defineProps({
    target: {type: Object}
})

const router = useRouter();
const route = useRoute();
const providerStore = useProStore();
const provider = ref(null);

//const provider = computed(() => providerStore?.provider);


//const providerId = computed(() => route.params.id);

onMounted( async() => {
    
    // 1. If component received provider via props, use it
    if (props.target) {
        provider.value = props.target;
        return;
    }

    // 2. Otherwise get id from route params and fetch
    const providerId = route.params.id;

    if (providerId) {
        const pro = await providerService.getProvByProvId(providerId);
        if (pro) {
        provider.value = pro;
        }
    }


})

const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);

  return d.toLocaleString("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

</script>
<style scoped>
.feedback-box {
    width: 70%;
    margin: 11px auto;
}

@media (max-width: 1000px) {
    .feedback-box {
        width: 100%;
    }
}
</style>