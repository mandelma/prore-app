<template>
  <MDBContainer>
    <div v-if="isRecipientContent">
      <recipient-content
        :booking="selectedBooking"

        @canselRecipientContent="handleCanselRecipientContent"
      />
    </div>
    <div v-else>

<!--      <div v-if="isSpinner" class="spinner-border" role="status">-->
<!--        <span class="visually-hidden">Loading...</span>-->
<!--      </div>-->
      <div>

        <MDBRow>

          <MDBCol md="8">

<!--            <div v-if="confirmedBookingsByProvider.length > 0"  class="scalein animation-duration-3000 animation-iteration flex align-items-center justify-content-center-->
<!--                          font-bold   w-full ">-->
<!--              <p @click="$router.push('/calendar')">Katso vahvistetut tilaukset kalenterista!</p>-->

<!--            </div>-->
          </MDBCol>
          <MDBCol style="padding: 20px 5px 20px 5px; color: cadetblue" md="4">

            <h3 class="client-header">{{t('recipient_panel_you_have') + " " + bookings.length + " " + t('recipient_panel_open_orders')}} </h3>
          </MDBCol>
        </MDBRow>

        <!--          v-if="confirmedBookingsByClient.some(ccb => ccb.id === booking.id)"-->
        <MDBRow v-for="(booking, index) in bookings" :key="index" class="bookings">
          <div class="client-orders">
            <aside  id="info-block-confirmed" >
              <section class="file-marker">
                <div>
                  <div class="box-title-confirmed">
                    {{!booking.isIncludeOffers ? t('recipient_panel_order_is_pending') : (booking.offers.length > 0 ? booking.offers.length + " " + t('offerCountNotification') : t('recipient_panel_no_offers'))}}
                  </div>
                  <div class="box-contents-confirmed">

                    <MDBRow>
                      <MDBCol>
                        {{booking.date}}

                        <p class="booking_time">
                          klo
                          {{new Date(booking.created).getHours() >= 10 ? new Date(booking.created).getHours() : "0" + new Date(booking.created).getHours() }} :
                          {{new Date(booking.created).getMinutes() >= 10 ? new Date(booking.created).getMinutes() : "0" + new Date(booking.created).getMinutes() }}
                        </p>
                      </MDBCol>
                      <MDBCol>
                        {{booking.header}}
                      </MDBCol>

                      <MDBCol lg="4">
                        <div v-if="!booking.isIncludeOffers">
                          <MDBBtn
                              v-if="index === selectedIndex"
                              style="margin-bottom: 13px;"
                              outline="danger" block size="lg"
                              @click="canselQuitSelectedBooking"
                          >
                            Poistu
                          </MDBBtn>
                          <MDBBtn v-else color="danger" @click="handleQuitSelectedBooking(index)" >{{t('recipient_panel_quit_order')}}</MDBBtn>
                        </div>

                        <MDBBtn v-else  outline="success" size="lg" @click="handleRecipientResult(booking.id, booking)" style="width: 100%;">
                          <span :class="{date_expired: booking.created_ms - new Date().getTime() <= 0}" >{{t('recipient_panel_order')}}</span>
                          <MDBBadge v-if="booking.offers.filter(offer => offer.isNewOffer).length > 0" color="danger"  class="ms-2" >
                            {{booking.offers.filter(offer => offer.isNewOffer).length}}
                          </MDBBadge>
                        </MDBBtn>

                      </MDBCol>
                    </MDBRow>
                    <MDBRow v-if="selectedIndex === index && !booking.isIncludeOffers">

                      <MDBCol lg="8" style="text-align: center;">
                        <MDBTextarea
                            v-if="isQuitBooking"
                            white
                            style=""
                            v-model="clientQuitBookingReason"
                            :label="t('recipient_panel_give_reason')"
                            rows="3"
                        >

                        </MDBTextarea>

                      </MDBCol>
                      <MDBCol lg="4">
                        <MDBBtn v-if="isQuitBooking && clientQuitBookingReason.length > 3" block color="success" size="lg>" style="margin-top: 10px;" @click="clientRejectBookingNoOffers(booking)">{{t('recipient_panel_confirm_quit')}}</MDBBtn>
                      </MDBCol>

                    </MDBRow>

                  </div>
                </div>
              </section>
            </aside>

          </div>

        </MDBRow>
        <div style="margin-top: 23px;">
          <MDBBtn outline="info" block size="lg" @click="newBooking">{{t('recipient_panel_new_order')}}</MDBBtn>
        </div>

      </div>

    </div>
  </MDBContainer>

</template>

<script setup>
import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBTextarea, MDBBadge } from 'mdb-vue-ui-kit';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import RecipientContent from "../recipient/RecipientContent.vue"

defineOptions({
  name: "recipient-page"
})
defineProps({
  bookings: {type: Array}
})

const { t } = useI18n();
const selectedIndex = ref(null);
const isRecipientContent = ref(false);
const selectedBooking = ref(null);

const handleRecipientResult = (id, booking) => {
  console.log("Booking id - " + id); + booking.header
  console.log("Booking title: ")
  isRecipientContent.value = true;
  selectedBooking.value = booking;
}

const handleCanselRecipientContent = () => {
  isRecipientContent.value = false;
}


</script>

<style scoped>
.bookings {
  font-size: 16px;
  text-align: left;
  /*padding: 5px;*/
}
.booking_time {
  color: #817d7d;
}


#info-block section {
  border: 1px solid #939696;
  margin-bottom: 20px;
}

#info-block-confirmed section {
  border: 1px solid #d5b13c;
  margin-bottom: 20px;
}

.file-marker > div {
  padding: 0 3px;
  /*height: 130px;*/
  /*margin-top: -0.8em;*/
  margin-top: -1em;
}

.box-title {
  background: #808687 none repeat scroll 0 0;
  border-radius: 50px;
  color: black;
  display: inline-block;
  /*padding: 0 2px;*/
  font-size: 16px;
  padding: 0 10px;

  margin-left: 8em;
}
.box-title-confirmed {
  /*background: #141414 none repeat scroll 0 0;*/
  background: #0E1218FF none repeat scroll 0 0;
  display: inline-block;
  color: #66aab1;
  /*padding: 0 2px;*/
  font-size: 16px;
  padding: 0 10px;

  /*margin-left: 8em;*/
  margin-left: 10%;
}
.box-contents {
  /*border: solid red;*/

  padding: 20px;
  overflow-y: auto;
}
.box-contents-confirmed {

  padding: 10px;
}
.date_expired {
  color: #c76868;
}
.order_expired {
  border: 1px solid #eb5454;
}
</style>