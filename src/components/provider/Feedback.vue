<template>
    <MDBContainer>
        <div style="display: flex; justify-content: right; padding: 7px 0 7px 0">
            <MDBBtnClose white @click="router.go(-1)"/>
        </div>
        <div class="feedback-box" v-for="fb in provider?.feedback" :key="fb.date">
            <MDBCard style="" v-if="fb?.text !==''">
                <MDBCardHeader>
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
        
        <!-- <div style="display:flex; gap:14px; flex-wrap:wrap;">

            <MDBCard style="flex:1; min-width:260px;">
                <MDBCardBody>
                <MDBBadge color="success" className="mb-2">Positive</MDBBadge>
                <MDBCardText>
                    Very friendly staff and quick service.
                </MDBCardText>
                </MDBCardBody>
            </MDBCard>

            <MDBCard style="flex:1; min-width:260px;">
                <MDBCardBody>
                <MDBBadge color="danger" className="mb-2">Negative</MDBBadge>
                <MDBCardText>
                    Waiting time was long.
                </MDBCardText>
                </MDBCardBody>
            </MDBCard>

        </div> -->
    </MDBContainer>
    
</template>
<script setup>
import { MDBContainer, MDBCard, MDBCardBody, MDBCardText, MDBCardTitle, MDBBadge, MDBBtnClose, MDBCardHeader } from 'mdb-vue-ui-kit';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia';
import { useProStore } from '@/stores/providerStore';

defineOptions ({
    name: 'pro-feedback'
})

const router = useRouter();
const providerStore = useProStore();

const provider = computed(() => providerStore?.provider);

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