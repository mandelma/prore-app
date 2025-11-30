<template>
    <MDBContainer>
        <div v-for="note in notifications" :key="note.id">
            <MDBCard text="center">
                <MDBCardBody>
                    <MDBCardTitle style="display: flex; justify-content: right; color: limegreen; padding-right: 20px;">
                        <p style="cursor:pointer;" @click="removeNote(note.id)">Selvä</p>
                    </MDBCardTitle>
                    <MDBCardText>
                        {{ note.content }}
                    </MDBCardText>
                </MDBCardBody>
                <MDBCardFooter class="text-muted">2 days ago</MDBCardFooter>
            </MDBCard>
        </div>
    </MDBContainer>
</template>
<script setup>
    import { MDBContainer, MDBCard, MDBCardHeader, MDBCardBody, MDBCardTitle, MDBCardText, MDBCardFooter, MDBBtn } from 'mdb-vue-ui-kit';
    import { ref, onMounted} from 'vue'
    import { useNotificationStore } from '@/stores/notificationStore';
    import { storeToRefs } from 'pinia';
    

    const notificationStore = useNotificationStore();
    const { notifications } = storeToRefs(notificationStore);

    const removeNote = async (id) => {
        notificationStore.removeNotification(id);
    }
</script>
<style scoped>

</style>