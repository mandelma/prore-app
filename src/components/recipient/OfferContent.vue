<template>
    <div>
        <!-- <MDBContainer> -->
            <MDBTable  borderless class="client-content" style="">
                <tbody>
                    <tr>
                        <td class="c-td">
                            Yritys
                        </td>
                        <td class="text-muted">
                            {{ offerContent.name }}
                        </td>
                    </tr>
                    <tr>
                        <td class="c-td">Y-tunnus</td>
                        <td class="text-muted">{{ offerContent.provider.ide }}</td>
                    </tr>
                    <tr>
                        <td class="c-td">
                            Osoite
                        </td>
                        <td class="text-muted">{{ offerContent.provider.address }}</td>
                    </tr>
                </tbody>
            </MDBTable>
            
            <div class="right-side">
                <MDBBtn color="primary"><i class="far fa-comment"></i></MDBBtn>
            </div>
            
        <!-- </MDBContainer> -->
        
    </div>
    
    
    
</template>
<script setup>
    import {MDBBtnClose, MDBContainer, MDBTable, MDBBtn} from 'mdb-vue-ui-kit';
    import { ref, computed } from 'vue';
    import clientService from '@/service/recipients'
    import { useClientStore } from '@/stores/recipientStore';
    import { useLoginStore } from '@/stores/login';
    import { useNotificationStore } from '@/stores/notificationStore';
    import { storeToRefs } from 'pinia';
    defineOptions({
        name: 'offer-content'
    })
    const {offerId} = defineProps({
        offerId: {type: String}
    })
    const clientStore = useClientStore();
    const notificationStore = useNotificationStore();
    const auth = useLoginStore();

    const { bookings } = storeToRefs(clientStore);
    const { user } = storeToRefs(auth);
    const offerContent = clientStore.getOfferById(offerId);
    const emit = defineEmits(['quit-content', 'quit-content-confirmed']);
    const back = () => {
        emit('quit-content');
        console.log("Yees")
    }

</script>
<style scoped>
.right-side {
    display: flex;
    justify-content: right;
}
.client-content {
    text-align: left;
}

.client-content .c-td {
    color: #ddd;
}

</style>