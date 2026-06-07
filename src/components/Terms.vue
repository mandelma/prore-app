<template>
    <MDBContainer class="my-5">
        <div class="terms-close mb-4">
            <MDBBtnClose white aria-label="Close" @click="$router.push('/login-register')"/>
        </div>
        <div class="terms-container">
        <h1 style="text-align: center;">Terms and conditions</h1>
        <p>Siia koik kasutatingimused ja privaatsuspolitiikka.</p>
    </div>
    </MDBContainer>
    
</template>
<script setup>
import { useI18n } from 'vue-i18n';
import { MDBContainer, MDBBtnClose, MDBCheckbox, MDBBtn } from "mdb-vue-ui-kit";
import { useRouter } from 'vue-router';
const { t } = useI18n();
const router = useRouter();

</script>
<style scoped>
.terms-close {
    display: flex;
    justify-content: flex-end;
}
</style>