<template>
  <div class="textSize">

    <MDBRow style="margin-top: 17px;">
      <MDBCol class="proPanelHeader" md="4">

        <div class="pro-panel-header">
          <div class="header-content">
            <h2>provider yritys</h2>
            <h2>provider.address</h2>
          </div>

        </div>

      </MDBCol>

    </MDBRow>
    <MDBContainer style="margin-bottom: 50px;">
      <!-- <calendar

          :userIsProvider = userIsProvider
          :bookings = bookings
          :filled_days = filled_days
          :filled = filled
          :bookingsConfirmed = bookingsConfirmed

          :client_filled_days = client_filled_days
          :client_filled = client_filled
          :confirmedBookingsByProvider = confirmedBookingsByProvider
      /> -->



      <MDBRow>


        <MDBCol>
          <!-- <div v-if="!provider.profession" class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div> -->

          <!-- v-else -->
          <div class="pro-panel">
            <!-- <error-notification
                :message = rangeErrorMessage
            />
            <errorNotification
                :message = errorMessage
            />
            <successNotification
                :message = successMessage
            /> -->

            <MDBTable responsive borderless class="proPanelTable" style="">
              <tbody>
              <tr >
                <td>
                  Palvelun alue
                  <!-- {{provider.range === 0 ? "Tarjoan palvelua paikalla" : "Palvelun säde: " + provider.range + " km"}} -->
                </td>
                <td v-if="!isEditRange">
                  <MDBBtn outline="info" block size="sm" @click="isEditRange = true">Muokkaa toimintaalueetta</MDBBtn>
                </td>
                <td v-else>
                  <div style="border: solid #ddd; margin-bottom: 10px; padding: 7px; ">
                    <div style="display: flex; justify-content: right; padding: 10px;">
                      <MDBBtnClose
                          white
                          @click="isEditRange = false"
                      />
                    </div>
                    <div>
                      <MDBInput white label="Säde - km" v-model="range" size="sm" type="number" /><br>
                    </div>

                    <!-- <MDBBtn v-if="range.length > 0" outline="info" block size="sm" @click="saveNewRange">Tallenna uusi säde</MDBBtn> -->
                  </div>

                </td>
              </tr>
              <tr>
                <td :class="{hide: isFeedback}">
                  Palaute
                </td>

                <!-- v-if="isFeedback" -->
                <td   colspan="2">


                  <feedback-list
                      :feedback = provider.feedback
                      @closeFeedbackList = handleCloseFeedbackList
                  />
                </td>
                <!-- v-else -->
                <td >
                  <MDBRow class="rating">
                    <div >

                      Rating
                      <!-- <p class="ratingData">{{provider.rating.positive > 0 ? provider.rating.positive / provider.rating.count : "0"}} tähteä &nbsp; ( yhteensä   {{provider.rating.count}} antajaa )</p> -->

                    </div>

                    <MDBCol >

                      <div style="text-align: center;">
                        Rating stars
                        <!-- <rating-stars :rating = "(provider.rating.positive / provider.rating.count)"  /> -->
                      </div>


                    </MDBCol>
                    <MDBCol sm="12" v-if="provider.feedback.length > 0">
                      <MDBBtn block outline="warning" @click="getFeedbackListData">Saatu arvostelut &nbsp; <span>( provider.feedback.length )</span></MDBBtn>
                    </MDBCol>

                  </MDBRow>

                </td>
              </tr>

              <tr>
                <td>
                  Portfolio
                </td>
                <!-- v-if="!isEditPortfolio" -->
                <td >
                   proDescription 
                  <div style="display: flex; justify-content: right; color: green; cursor: pointer;">
                    <p @click="isEditPortfolio = true">Muokkaa</p>
                  </div>

                </td>
                <!-- v-else -->
                <td >
                  <p style="display: flex; justify-content: right; padding: 7px;" @click="isEditPortfolio = false">Poistu</p>
                  <MDBTextarea
                      maxlength="100"
                      label="Muokkaa kuvausta..."
                      white
                      rows="3"
                      v-model="des"

                      wrapperClass="mb-4"
                  />
                  -Varmista button-
                  <!-- <MDBBtn v-if="des.length > 0" outline="success" @click="getDescriptionContent">Varmista</MDBBtn> -->
                  <span style="float: right;"> des.length  / 100</span>

                </td>
              </tr>

              <tr>

                <td :class="{hide: isEditProfession}">
                  <div v-for="(pro, i) in provider.profession" :key="i">
                    pro
                  </div>

                </td>
                <!-- <td v-if="isEditProfession" colspan="2">
                  <edit-profession
                      :provider = provider
                      @additionalProfession = handleAddProfession
                      @editProfession = handleEditProfession
                      @removeProfession = handleRemoveProfession
                      @cancel:editProfession = handleCancelEditProfession
                  />
                </td>
                <td v-else>
                  <MDBBtn outline="info" block size="sm" @click="editProfessionPro">Muokkaa osaamista</MDBBtn>
                </td> -->
              </tr>

              <tr>
                <td :class="{hide: isEditPrice}">
                  provider.priceByHour&nbsp;Euroa
                </td>
                <!-- <td v-if="isEditPrice" colspan="2">
                  <editPrice
                      :currentPrice = provider.priceByHour
                      @cancel:editPrice = cancelEditPrice
                      @save:editedPrice = saveEditedPrice
                  />
                </td>
                <td v-else>
                  <MDBBtn outline="info" block size="sm" @click="editPrice">Muokkaa tuntihinta</MDBBtn>
                </td> -->
              </tr>
              <tr>
                <td>
                  Katso kartalta
                </td>
                <td>
                  <MDBBtn outline="info" block size="sm" @click="this.$router.push('/pro-public-search')">Kartalta</MDBBtn>
                </td>
              </tr>

              </tbody>
            </MDBTable>

          </div>

        </MDBCol>

      </MDBRow>


    </MDBContainer>
  </div>


</template>

<script setup>
  import {
    MDBContainer,
    MDBIcon,
    MDBRow,
    MDBCol,
    MDBTable,
    MDBBtn,
    MDBBtnClose,
    MDBBadge,
    MDBInput,
    MDBTextarea
  } from 'mdb-vue-ui-kit';
defineOptions({
  name: 'pro-panel'
})
defineProps ({
  provider: {type: Object}
})
</script>

<style scoped>

</style>