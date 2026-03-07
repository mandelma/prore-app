<template>
    <MDBContainer>
        <div style="display: flex; justify-content: right; padding: 7px 0 7px 0">
            <MDBBtnClose white @click="router.go(-1)"/>
        </div>
        <div style="display:flex; gap:14px; flex-wrap:wrap;">

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

    </div>
    </MDBContainer>
    
</template>
<script setup>
import { MDBContainer, MDBCard, MDBCardBody, MDBCardText, MDBBadge, MDBBtnClose } from 'mdb-vue-ui-kit';
import { useRouter } from 'vue-router'

defineOptions ({
    name: 'pro-feedback'
})

const router = useRouter();
</script>