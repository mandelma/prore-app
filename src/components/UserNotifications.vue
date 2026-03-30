<template>
    <MDBContainer style="margin-top: 17px;">
        <div v-for="note in notifications" :key="note.id">
            <MDBCard text="center" style="margin-bottom: 9px; max-height: 120px;">
                <!-- <MDBCardHeader style="display: flex; justify-content: right; color: limegreen; padding-right: 20px;">
                    <p style="cursor:pointer;" @click="removeNote(note.id)">Selvä</p>
                </MDBCardHeader> -->
                <MDBCardBody>
                    <MDBCardTitle style="color: burlywood">
                        
                        {{ note.title }}
                    </MDBCardTitle>
                    <MDBCardText>
                        {{ note.content }}
                        <div style="display: flex; justify-content: right;">
                            <p style="cursor:pointer; color: aqua;" @click="removeNote(note.id)">Selvä</p>
                        </div>
                        
                    </MDBCardText>
                </MDBCardBody>
                <!-- <MDBCardFooter class="text-muted">2 days ago</MDBCardFooter> -->
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