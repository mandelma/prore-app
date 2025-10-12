<template>
  <MDBContainer>
    <div style="display: flex; justify-content: right; padding: 20px;">
      <MDBBtnClose
          white
          style="cursor: pointer;"
          @click="canselResult"
      />
    </div>


    <!--    <MDBIcon-->
    <!--        style="float:right; cursor: pointer;"-->
    <!--        @click="canselResult"-->
    <!--        size="3x"-->
    <!--    >-->
    <!--      <i class="fas fa-undo"></i>-->
    <!--    </MDBIcon>-->

    <h2 class="client-result-header">{{t('recipient_result_need_a_pro')}} - {{line}}</h2>

    <h5 v-if="booking.created_ms - new Date().getTime() <= 0 && booking.offers.length < 1" class="expired_date">
      {{t('recipient_result_order_is_expired')}}
    </h5>


    <MDBRow style="margin-top: 50px;">
      <MDBCol class="client-result">

        <MDBTable borderless style="font-size: 17px; color: #dddddd; text-align: left;">
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
                {{bookingDateToDisplay}} &emsp;
                klo &nbsp;
                {{new Date(booking.created).getHours() < 10 ? "0" + new Date(booking.created).getHours() : new Date(booking.created).getHours()}}
                :
                {{new Date(booking.created).getMinutes() < 10 ? "0" + new Date(booking.created).getMinutes() : new Date(booking.created).getMinutes()}}

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
        <div v-if="booking.offers.length < 1">
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
        </div>

        <!--New image-->
        <MDBBtn v-if="!isPressedAddlmage & booking.offers.length < 1" block color="primary" @click="pressedAddImage">{{ t('recipient_result_add_image') }}</MDBBtn>
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

        </div>

      </MDBCol>

      <MDBCol lg="6">
        <div v-if="booking_offers.length > 0">
          <div class="ui large form">
            <div class="field">
              <h3 style="margin-bottom: 20px;">{{ t('recipient_result_offers') }}</h3>
              <select style="padding: 20px; background-color: #3c3535; color: lightgrey; font-size: 18px;" id="listOfProviders" v-model="filterResult" @click="addFilter">
                <option value="">{{ t('recipient_result_filter') }}</option>
                <option value="distance">{{ t('recipient_result_filter_by_distance') }}</option>
                <option value="rating">{{ t('recipient_result_filter_by_rating') }}</option>
                <option value="price">{{ t('recipient_result_filter_by_price') }}</option>
              </select>

            </div>

          </div>
          <br>

          <MDBTable  style="font-size: 18px; text-align: center; position: relative;">
            <tbody>
            <tr v-for="offer in booking_offers" :key="offer.id">

              <td>

                <MDBBtn
                    class="provider-selection"
                    outline="info"
                    size="lg"
                    @click="getProviderInfo(offer.provider, offer, 'orange')"
                >

                  {{offer.provider.yritys}} <br>
                  <span style="font-size: 14px;">{{ t('recipient_result_distance') }} {{offer.distance}} km</span><br>

                </MDBBtn>



                <MDBBadge
                    v-if="offer.isNewOffer"
                    color="danger"
                    class="translate-middle p-3"
                    pill
                    notification
                >
                  <span style=" font-size: 14px; ">
                    {{t('recipient_result_new')}} <br>{{offer.price}} eur
                  </span>
                </MDBBadge>
                <MDBBadge
                    v-else
                    color="info"
                    class="translate-middle p-3"
                    pill
                    notification
                >
                  <span style=" font-size: 14px; ">
                    {{offer.price}} eur
                  </span>
                </MDBBadge>

              </td>

            </tr>
            </tbody>
          </MDBTable>

        </div>
        <div v-else>
          <h2 style="width: 100%; margin-top: 17px;">{{ t('recipient_result_waiting_offers') }}</h2>
        </div>

      </MDBCol>

      <MDBBtn style="margin-top: 27px;" block color="danger" size="sm" @click="removeOfferedBookings">{{ t('recipient_result_remove_order') }}</MDBBtn>
    </MDBRow>

    <!--    Booking offers {{booking_offers}}-->
    <!--  images {{images}}-->

  </MDBContainer>
</template>

<script setup>
import {MDBContainer, MDBRow, MDBCol, MDBBtnClose, MDBBtn, MDBTable, MDBBadge} from 'mdb-vue-ui-kit';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
defineOptions({
  name: "recipient-content"
});
defineProps({
  booking: {type: Object}
})

const emit = defineEmits(['canselRecipientContent'])

const {t} = useI18n();
const booking_offers = ref([])

const canselResult = () => {
  emit('canselRecipientContent');
}

</script>

<style scoped>

</style>