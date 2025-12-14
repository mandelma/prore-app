<template>
  <MDBContainer v-if="isOfferContent">
    <div >
      <offer-content :offerId="offerId" @quit-content="isOfferContent = false" @quit-content-confirmed="handleQuitOfferContentConfirmed" />
    </div>
  </MDBContainer>
  <MDBContainer v-else>
    
    <div  style="display: flex; justify-content: right; padding: 20px;">
      <MDBBtnClose
          white
          style="cursor: pointer;"
          @click="handleQuitContent"
      />
    </div>

    <div v-if="!bookings" class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
    <div v-else class="booking-content">
      <h2 class="client-result-header">{{t('recipient_result_need_a_pro')}} - {{booking.professional[0]}}</h2>

      <h5 v-if="booking.created_ms - new Date().getTime() <= 0 && booking.offers.length < 1" class="expired_date">
        {{t('recipient_result_order_is_expired')}}
      </h5>


      <MDBRow style="margin-top: 50px;">
        <MDBCol class="client-result">

          <MDBTable borderless style="font-size: 14px; color: #dddddd; text-align: left;">
            <tbody>
            <tr>
              <td v-if="!isEditDescription">
                <p>{{booking.description}}</p>


              </td>
              <td v-else>
                <MDBRow>

                  <MDBCol >
                    <MDBTextarea
                        :label="t('recipient_result_edit_description')"
                        white
                        rows="4" v-model="description"
                        style="font-size: 14px; padding: 20px;"
                    />
                  </MDBCol>
                  <MDBCol col="1">
                    <div style="display: flex; justify-content: right; cursor: pointer">
                      <MDBBtnClose
                          white
                          @click="isEditDescription = false"
                      />
                    </div>

                  </MDBCol>
                </MDBRow>




              </td>
            </tr>
            <tr v-if="booking.offers.length < 1">
              <td v-if="!isEditDescription">
                <MDBBtn outline="info" block size="lg" @click="pressedEditDescription">Muokkaa tehtävän kuvausta</MDBBtn>
              </td>
              <td v-else>
                <MDBBtn outline="info" block size="lg" @click="saveEditedDescription">Tallenna tehtävän kuvaus</MDBBtn>
              </td>
            </tr>
            <tr>
              <td v-if="!isEditDate">
                <p :class="{expired_date: booking.created_ms - new Date().getTime() <= 0 && booking.offers.length < 1}">
                  {{booking.date}} &emsp;
                  <!-- klo &nbsp;
                  {{new Date(booking.created).getHours() < 10 ? "0" + new Date(booking.created).getHours() : new Date(booking.created).getHours()}}
                  :
                  {{new Date(booking.created).getMinutes() < 10 ? "0" + new Date(booking.created).getMinutes() : new Date(booking.created).getMinutes()}}
 -->
                </p>
                <MDBBtn v-if="booking.offers.length < 1" block size="lg" outline="info" @click="editDate">
                  <span :class="{expired_warning: booking.created_ms - new Date().getTime() <= 0}">{{t('recipient_result_edit_date')}}</span>
                </MDBBtn>
              </td>
              <td v-else>
                <MDBRow>
                  <MDBCol col="8">
                    <h4 :class="{expired_date: booking.created_ms - new Date().getTime() <= 0}">
                      {{bookingDateToDisplay}}<br>
                      klo &nbsp;
                      {{new Date(booking.created).getHours() < 10 ? "0" + new Date(booking.created).getHours() : new Date(booking.created).getHours()}}
                      :
                      {{new Date(booking.created).getMinutes() < 10 ? "0" + new Date(booking.created).getMinutes() : new Date(booking.created).getMinutes()}}
                    </h4>

                    <VueDatePicker
                        style="margin-bottom: 20px;"
                        dark
                        v-model="bookingDate"
                        :min-date="new Date()"
                        :placeholder="t('recipient_result_select_date')"
                        @internal-model-change="handleInternalDate"
                        :state="isNoDate ? false : null"
                    >

                    </VueDatePicker>
                  </MDBCol>
                  <MDBCol col="4">
                    <MDBBtnClose
                        white
                        @click="isEditDate = false"
                        style="float: right; cursor: pointer"

                    />
                  </MDBCol>
                </MDBRow>

              </td>

            </tr>

            </tbody>
          </MDBTable>
          <!--require(`/server/uploads/${im.name}`)        -->


          <!-- <div v-if="booking.offers.length < 1">
            <div v-for="(item, i) in images" :key="i">
              <img
                  class="loading"
                  style="width: 100%;"
                  :src="item.blob ? item.blob : item.imageUrl"
                  :alt="item.id"
              />

              <MDBBtn v-if="!isEditPanel" block outline="success" @click="pressEditPanel(i)">{{t('recipient_result_edit_picture')}}</MDBBtn>
              <div class="edit-panel" v-if="isEditPanel && imageIndex === i">
                <error-message :message = wrong_SizeType_Message />
                <MDBRow v-if="booking.offers.length < 1">
                  <MDBCol>
                    <MDBBtnClose
                        v-if="!value"
                        white
                        class="close-btn"
                        style="float: right;"
                        @click="closeEditPanel"
                    />
                    <input  id="file-upload" type="file" @change="handleFileChange($event, i)"/>
                    <label  for="file-upload" class="custom-file-upload">
                    <span v-if="value">
                    {{t('recipient_result_edit_order_picture')}}: {{value.name}}

                    </span>
                      <span v-else>{{t('recipient_result_select_new_image')}}</span>
                    </label>
                    <MDBBtn v-if="isEditImage" block color="success" @click="uploadEditedImage(i, item.key)">{{ t('recipient_result_upload_edited_image') }}</MDBBtn>
                    <MDBBtn class="btn" block size="lg" color="danger" @click="removeImg(i, item.key)">{{ t('recipient_result_remove_image') }}</MDBBtn>
                  </MDBCol>
                  <MDBCol v-if="value">
                    <MDBBtnClose
                        white
                        class="close-btn"
                        style="float: right;"
                        @click="closeEditPanel"
                    />
                    <img
                        style="width:100px; padding-top: 20px;"
                        :src="this.showImage"
                        alt="addEdit"
                    />
                  </MDBCol>
                </MDBRow>

              </div>

            </div>
          </div> -->

          <!--New image-->


          <!-- <MDBBtn v-if="!isPressedAddlmage & booking.offers.length < 1" block color="primary" @click="pressedAddImage">{{ t('recipient_result_add_image') }}</MDBBtn>
          <div class="add-panel" v-if="isPressedAddlmage && isAddImagePanel">

            <MDBRow>

              <MDBCol>
                <MDBBtnClose
                    v-if="!value"
                    white
                    class="close-btn"
                    @click="closeAddPanel"
                />
                <input   id="file-upload-x" type="file" @change="handleFileChange($event, i)"/>
                <label  for="file-upload-x" class="custom-file-upload">
                    <span v-if="value">
                    Muokka tehtävän kuvausta: {{value.name}}
  +
                    </span>
                  <span v-else>Valitse lisää kuva tehtävästä</span>
                </label>
                <MDBBtn v-if="isAddImage" block outline="primary" @click="addAdditionalImage">Tallenna kuva</MDBBtn>
              </MDBCol>
              <MDBCol v-if="value">
                <MDBBtnClose
                    class="close-btn"
                    white
                    @click="closeAddPanel"
                />
                <img
                    style="width:100px"
                    :src="this.showImage"
                    alt="addShow"
                />
              </MDBCol>
            </MDBRow>

          </div> -->

        </MDBCol>

        <MDBCol lg="6">
          <div v-if="booking.offers.length > 0" class="form-card">
            <h3 style="padding: 13px;">Tehtyjä tarjouksia</h3>
            <MDBSelect theme="dark" size="lg" style="margin-bottom: 17px;" white  v-model:options = filterOptions label="Filter" />

            <MDBTable  style="width: 100%; font-size: 12px; text-align: center;">
              <tbody>
              <tr v-for="offer in booking.offers" :key="offer.id">

                <td>
                  <div class="w-100 position-relative">
                    <MDBBtn
                      class="provider-selection"
                      outline="info"
                      block
                      size="lg"
                      @click="getProviderInfo(offer.provider, offer)"
                  >

                      {{offer.name}} <br>
                      <span style="font-size: 12px;">{{ t('recipient_result_distance') }} {{offer.distance}}</span><br>

                    </MDBBtn>
                    <MDBBadge
                      v-if="offer.isNewOffer"
                      color="danger"
                      class="translate-middle p-2"
                      pill
                      notification
                  >
                    <span style=" font-size: 11px; ">
                      {{t('recipient_result_new')}} <br>{{offer.price}} eur
                    </span>
                  </MDBBadge>
                  <MDBBadge
                      v-else
                      color="info"
                      class="position-absolute top-0 start-100 translate-middle"
                      pill
                      notification
                  >
                    <span style=" font-size: 11px; ">
                      {{offer.price}} eur
                    </span>
                  </MDBBadge>
                  </div>

                </td>

              </tr>
              </tbody>
            </MDBTable>

          </div>
          <div v-else>
            <h2 style="width: 100%; margin-top: 12px;">{{ t('recipient_result_waiting_offers') }}</h2>
            <img :src="loadOffers" alt="loading_offers" />
          </div>
          
          <!-- <MDBBtn style="float: right; margin-top: 27px;" color="danger" size="lg" @click="removePublicBooking">{{ t('recipient_result_remove_order') }}</MDBBtn> -->
          <MDBPopconfirm 
            modal 
            style="float: right; margin-top: 27px;" 
            class="pc-trigger-danger" 
            message="Oletko varma, että haluat poista tilauksen?" 
            cancelText="En" 
            confirmBtnClasses="popconfirm-ok-btn"
            confirmText="Poista tilaus" 
            tag="button" 
            @confirm="removePublicBooking">
              {{ t('recipient_result_remove_order') }}
          </MDBPopconfirm>
        </MDBCol>

        
      </MDBRow>
    </div>

    

    

    <!--    Booking offers {{booking_offers}}-->
    <!--  images {{images}}-->

  </MDBContainer>
</template>

<script setup>
import {MDBContainer, MDBRow, MDBCol, MDBBtnClose, MDBBtn, MDBTable, MDBBadge, MDBSelect, MDBPopconfirm} from 'mdb-vue-ui-kit';
import { useI18n } from 'vue-i18n';
import { ref, toRefs} from 'vue';
import { useClientStore } from '@/stores/recipientStore';
import OfferContent from './OfferContent.vue';
import { storeToRefs } from 'pinia';
import load_offers from '@/assets/load-pro-offers.gif';
import '@/styles/theme.css';
//import '@/styles/form.css';
defineOptions({
  name: "recipient-content"
});
const props = defineProps({
  booking: {type: Object},
  bIndex: {type: Number}
})

/* const _props = defineProps({
  booking: {type: Object}
})

const { booking } = toRefs(_props) */

const emit = defineEmits(['cancelRecipientContent', 'canselRecipientContentConfirmed', 'out-here', 'updateOfferState'])

const {t} = useI18n();
const clientStore = useClientStore();
const booking_offers = ref([])
const offerId = ref("");
const isOfferContent = ref(false);
const loadOffers = load_offers;
const filterOptions = ref([
  {text: "Distance", value: 25 }
])
const isEditDate = ref(false);

const { bookings } = storeToRefs(clientStore);



const getProviderInfo = async (proID, offer) => {
  console.log("Provider info" + proID);
  console.log("booking id - " + offer.bookingID);
  isOfferContent.value = true;
  offerId.value = offer.id;
  await clientStore.readOffer(offer);
  emit('updateOfferState', offer.bookingID, offer.id);
}

const handleQuitContent = () => {
  emit ('cancelRecipientContent');
}

const handleQuitOfferContentConfirmed = (pro) => {
  console.log("Quitting content! " + pro)
  isOfferContent.value = false;
  emit('canselRecipientContentConfirmed', pro);
}


const removePublicBooking = async () => {
  console.log("BOOKING ID " + props.booking.id)
  
  await clientStore.onRemovePublicBooking(props.booking.id);
  emit('out-here');
}

</script>

<style scoped>
.provider-selection {
  margin-top: 0;
}

:deep(.select-option) { color: #fff !important; }
:deep(.select-option:hover),
:deep(.select-option.active) {
  background-color: #102226 !important;
  color: #fff !important;
}
.booking-content {
  background-color: #102226;
  border: 1px solid #153036;
  padding: 13px;
}
.offer-list {
  background-color: blue;
  padding: 13px;
}

/* Popconfirm button color */
:deep(.pc-trigger-danger.btn-primary),
:deep(.pc-trigger-danger.btn-primary:hover),
:deep(.pc-trigger-danger.btn-primary:focus),
:deep(.pc-trigger-danger.btn-primary:active) {
background-color: #e05b69 !important;
border-color: #dc3545 !important;
box-shadow: 0 4px 9px -4px rgba(220, 53, 69, 0.55) !important;
}



</style>