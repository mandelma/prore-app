<template>

  <div v-if="route.name === 'calendar'" style="display: flex; justify-content: flex-end; padding: 7px 12px;">
    <MDBBtnClose white @click="router.go(-1)"/>
  </div>
  
  <div >
    <!-- height="auto" contentHeight="auto" -->
    <FullCalendar ref="calendarRef"  :options="options" />

  </div>
  
  <!-- Creating event modal in day view-->
  <MDBModal
    v-model="showCreate"
    centered
    tabindex="-1"
    removeBackdrop
    :keyboard="false"
    :focus="false"
    scrollable
  >
    <MDBModalHeader
      class="modal-header-custom"
      :class="[
        'create-entry-modal__header',
        {
          'create-entry-modal__header--availability':
            selectedEntryType === 'time',

          'create-entry-modal__header--note':
            selectedEntryType === 'vacation'
        }
      ]"
    >
      <MDBModalTitle class="create-entry-modal__title">
        <span
          :class="[
            'create-entry-modal__title-icon',
            {
              'create-entry-modal__title-icon--availability':
                selectedEntryType === 'time',

              'create-entry-modal__title-icon--note':
                selectedEntryType === 'vacation'
            }
          ]"
        >
          <i
            :class="
              selectedEntryType === 'vacation'
                ? 'far fa-note-sticky'
                : 'far fa-calendar-check'
            "
          ></i>
        </span>

        <span>
          {{
            selectedEntryType === 'vacation'
              ? t('calendar.createNote')
              : t('calendar.createAvailability')
          }}
        </span>
      </MDBModalTitle>
    </MDBModalHeader>

    <MDBModalBody class="create-entry-modal__body">
      <p class="create-entry-modal__description">
        {{ t('calendar.createEntryDescription') }}
      </p>

      <div class="create-entry-modal__type">
        <MDBSelect
          v-model:options="stateOptions"
          :label="t('calendar.selectEntryType')"
        />
      </div>

      <!-- Saadaolev aeg -->
      <div
        v-if="selectedEntryType === 'time'"
        class="create-availability"
      >
        <div class="create-entry-info create-entry-info--availability">
          <span class="create-entry-info__icon">
            <i class="fas fa-eye"></i>
          </span>

          <div>
            <strong>
              {{ t('calendar.visibleToClients') }}
            </strong>

            <span>
              {{ t('calendar.createAvailabilityVisibilityInfo') }}
            </span>
          </div>
        </div>

        <div class="create-entry-time-card">
          <div class="create-entry-time-card__item">
            <span class="create-entry-time-card__icon">
              <i class="fas fa-play"></i>
            </span>

            <div>
              <span>{{ t('calendar.availabilityStarts') }}</span>

              <strong>
                {{
                  form.start
                    ? formatLocalDate(form.start)
                    : '—'
                }}
              </strong>
            </div>
          </div>

          <div class="create-entry-time-card__line">
            <span></span>
          </div>

          <div class="create-entry-time-card__item">
            <span
              class="
                create-entry-time-card__icon
                create-entry-time-card__icon--end
              "
            >
              <i class="fas fa-stop"></i>
            </span>

            <div>
              <span>{{ t('calendar.availabilityEnds') }}</span>

              <strong>
                {{
                  form.end
                    ? formatLocalDate(form.end)
                    : '—'
                }}
              </strong>
            </div>
          </div>
        </div>

        <div class="create-entry-duration">
          <div>
            <span>{{ t('calendar.availabilityDuration') }}</span>
            <strong>{{ createEntryDuration }}</strong>
          </div>

          <i class="far fa-clock"></i>
        </div>
      </div>

      <!-- Märge -->
      <div
        v-else-if="selectedEntryType === 'vacation'"
        class="create-note"
      >
        <div class="create-entry-info create-entry-info--note">
          <span class="create-entry-info__icon">
            <i class="fas fa-lock"></i>
          </span>

          <div>
            <strong>
              {{ t('calendar.privateNote') }}
            </strong>

            <span>
              {{ t('calendar.createPrivateNoteInfo') }}
            </span>
          </div>
        </div>

        <div class="create-note__date">
          <span class="create-note__date-icon">
            <i class="far fa-calendar"></i>
          </span>

          <div>
            <span>{{ t('calendar.noteDate') }}</span>

            <strong>
              {{
                form.start
                  ? formatLocalDate(form.start)
                  : '—'
              }}
            </strong>
          </div>
        </div>

        <MDBInput
          v-model="form.title"
          :label="t('calendar.noteTitle')"
          wrapperClass="mb-4"
        />

        <MDBTextarea
          v-model="form.note"
          :label="t('calendar.noteContent')"
          rows="5"
        />
      </div>

      <small
        v-if="createEventError"
        class="create-entry-modal__error"
        role="alert"
      >
        <i class="fas fa-circle-exclamation"></i>
        {{ createEventError }}
      </small>
    </MDBModalBody>

    <MDBModalFooter class="create-entry-modal__footer">
      <MDBBtn
        color="secondary"
        outline
        @click="closeCreateEventModal"
      >
        {{ t('calendar.cancel') }}
      </MDBBtn>

      <MDBBtn
        :color="
          selectedEntryType === 'time'
            ? 'success'
            : 'primary'
        "
        @click="saveEvent"
      >
        <i class="fas fa-plus me-2"></i>

        {{
          selectedEntryType === 'vacation'
            ? t('calendar.createNote')
            : t('calendar.createAvailability')
        }}
      </MDBBtn>
    </MDBModalFooter>
  </MDBModal>
  <!-- Create edit confirmer offer on pro side ----- -->


  <!-- Edit event ----------------------  :modelValue="true"-->
  <MDBModal
    v-model="showEdit"
    centered
    tabindex="-1"
    removeBackdrop
    :keyboard="false"
    :focus="false"
    scrollable
  >
    <MDBModalHeader
    class="modal-header-custom"
      :class="[
        'calendar-edit-modal__header', 
        {
          'calendar-edit-modal__header--note': event_state === 'vacation',
          'calendar-edit-modal__header--availability': event_state === 'time'
        }
      ]"
    >
      <MDBModalTitle class="calendar-edit-modal__title">
        <span
          :class="[
            'calendar-edit-modal__title-icon',
            {
              'calendar-edit-modal__title-icon--note':
                event_state === 'vacation',
              'calendar-edit-modal__title-icon--availability':
                event_state === 'time'
            }
          ]"
        >
          <i
            :class="
              event_state === 'vacation'
                ? 'far fa-note-sticky'
                : 'far fa-calendar-check'
            "
          ></i>
        </span>

        <span>
          {{
            event_state === 'vacation'
              ? t('calendar.editNote')
              : t('calendar.editAvailability')
          }}
        </span>
      </MDBModalTitle>
    </MDBModalHeader>

    <MDBModalBody class="calendar-edit-modal__body">
      <!-- Märkme muutmine -->
      <div
        v-if="event_state === 'vacation'"
        class="note-edit-form"
      >
        <p class="calendar-edit-modal__description">
          {{ t('calendar.editNoteDescription') }}
        </p>

        <div class="note-edit-form__private-info">
          <i class="fas fa-lock"></i>

          <span>
            {{ t('calendar.privateNoteInfo') }}
          </span>
        </div>

        <div class="note-edit-form__date">
          <span class="note-edit-form__date-icon">
            <i class="far fa-calendar"></i>
          </span>

          <div>
            <span>{{ t('calendar.noteDate') }}</span>

            <strong>
              {{
                editForm.start
                  ? formatLocalDate(editForm.start)
                  : '—'
              }}
            </strong>
          </div>
        </div>

        <MDBInput
          v-model="editForm.title"
          :label="t('calendar.noteTitle')"
          wrapperClass="mb-4"
        />

        <MDBTextarea
          v-model="editForm.note"
          :label="t('calendar.noteContent')"
          rows="5"
        />
      </div>

      <!-- Saadaoleva aja muutmine -->
      <div
        v-else-if="event_state === 'time'"
        class="availability-edit-form"
      >
        <p class="calendar-edit-modal__description">
          {{ t('calendar.editAvailabilityDescription') }}
        </p>

        <div class="availability-edit-form__visibility">
          <span class="availability-edit-form__visibility-icon">
            <i class="fas fa-eye"></i>
          </span>

          <div>
            <strong>{{ t('calendar.visibleToClients') }}</strong>

            <span>
              {{ t('calendar.editAvailabilityVisibilityInfo') }}
            </span>
          </div>
        </div>

        <div class="availability-edit-form__summary">
          <div class="availability-edit-form__summary-item">
            <span>{{ t('calendar.availabilityStarts') }}</span>

            <strong>
              {{
                editForm.start
                  ? formatLocalDate(editForm.start)
                  : '—'
              }}
            </strong>
          </div>

          <i class="fas fa-arrow-right"></i>

          <div class="availability-edit-form__summary-item">
            <span>{{ t('calendar.availabilityEnds') }}</span>

            <strong>
              {{
                editForm.end
                  ? formatLocalDate(editForm.end)
                  : '—'
              }}
            </strong>
          </div>
        </div>

        <div class="availability-edit-form__duration">
          <div>
            <span>{{ t('calendar.availabilityDuration') }}</span>
            <strong>{{ editAvailabilityDuration }}</strong>
          </div>

          <i class="far fa-clock"></i>
        </div>

        <div class="availability-edit-form__fields">
          <div class="availability-edit-form__field">
            <label class="availability-edit-form__label">
              {{ t('calendar.selectAvailabilityStart') }}
            </label>

            <MDBDateTimepicker
              :key="`start-${reInitKey}`"
              v-model="editForm.start"
              valueType="date"
              size="lg"
              :label="t('calendar.start')"
              input-toggle
              :toggle-button="false"
              disablePast
              :datepicker="{
                ...L,
                format: 'YYYY-MM-DD'
              }"
              :timepicker="{
                ...L,
                hoursFormat: 24
              }"
              @update:modelValue="editAvailabilityError = null"
            />
          </div>

          <div class="availability-edit-form__field">
            <label class="availability-edit-form__label">
              {{ t('calendar.selectAvailabilityEnd') }}
            </label>

            <MDBDateTimepicker
              :key="`end-${reInitKey}`"
              v-model="editForm.end"
              valueType="date"
              size="lg"
              :label="t('calendar.end')"
              input-toggle
              :toggle-button="false"
              disablePast
              :datepicker="{
                ...L,
                format: 'YYYY-MM-DD'
              }"
              :timepicker="{
                ...L,
                hoursFormat: 24
              }"
              @update:modelValue="editAvailabilityError = null"
            />
          </div>
        </div>

        <small
          v-if="editAvailabilityError"
          class="calendar-edit-modal__error"
          role="alert"
        >
          <i class="fas fa-circle-exclamation"></i>
          {{ editAvailabilityError }}
        </small>
      </div>
    </MDBModalBody>

    <MDBModalFooter class="calendar-edit-modal__footer">
      <MDBBtn
        color="secondary"
        outline
        @click="closeCalendarEditModal"
      >
        {{ t('calendar.cancel') }}
      </MDBBtn>

      <MDBBtn
        :color="event_state === 'time' ? 'success' : 'primary'"
        @click="saveEventEdits"
      >
        <i class="fas fa-check me-2"></i>

        {{
          event_state === 'vacation'
            ? t('calendar.saveNote')
            : t('calendar.saveAvailability')
        }}
      </MDBBtn>
    </MDBModalFooter>
  </MDBModal>

  <!-- Opening -- ? client and --  provider event edit ????????????????????????? -->
  <MDBModal
    v-model="showEventEdit"
    centered
    tabindex="-1"
    removeBackdrop
    :keyboard="false"
    :focus="false"
  >
    <MDBModalHeader class="modal-header-custom">
      <MDBModalTitle>{{ t('calendar.editOffer') }}</MDBModalTitle>
    </MDBModalHeader>

    <MDBModalBody>
      <MDBInput
        v-model="editOfferForm.title"
        :label="t('calendar.service')"
        wrapperClass="mb-4"
      />
      xxxx-xxx
      <MDBTextarea
        v-model="editOfferForm.note"
        :label="t('calendar.description')"
        rows="3"
        wrapperClass="mb-4"
      />

      <MDBInput
        v-model="editOfferForm.address"
        :label="t('calendar.location')"
        wrapperClass="mb-4"
      />

      <MDBInput
        v-model="editOfferForm.priceOffer"
        :label="t('calendar.estimatedPrice')"
        type="number"
        wrapperClass="mb-4"
      />
    </MDBModalBody>

    <MDBModalFooter class="footer-buttons">
      <MDBBtn color="secondary" outline @click="showEventEdit = false">
        {{ t('calendar.cancel') }}
      </MDBBtn>

      <MDBBtn color="primary" @click="saveOfferEdit">
        {{ t('calendar.save') }}
      </MDBBtn>
    </MDBModalFooter>
  </MDBModal>

  <!-- Open time event edit ??????????????-->
  <MDBModal
    v-model="showTimeEventEdit"
    centered
    tabindex="-1"
    removeBackdrop
    :keyboard="false"
    :focus="false"
  >
    <MDBModalHeader class="modal-header-custom">
      <MDBModalTitle>{{ t('calendar.editAvailability') }}</MDBModalTitle>
    </MDBModalHeader>

    <MDBModalBody>
      <p>Time event edit form...</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">


        
        <div><strong>{{ t('calendar.start') }}:</strong> {{ formatLocalDate(editForm.start) }}</div>

        <div class="field-wrapper">
            <MDBDateTimepicker
                size="lg"
                :label="t('calendar.start')"
                v-model="editForm.start"
                :valueType="'date'"
                input-toggle
                :toggle-button="false"
                :datepicker="{
                ...L,
                format: 'YYYY-MM-DD'
              }"
              
                :timepicker="{
                ...L,
                hoursFormat: 24
              }"

                :key="reInitKey"
                disablePast
            />

            xxx
            
        </div>

        <div><strong>{{ t('calendar.end') }}:</strong>   {{ formatLocalDate(editForm.end) }}</div>

        <div class="field-wrapper">
            <MDBDateTimepicker
                size="lg"
                :label="t('calendar.end')"
                v-model="editForm.end"
                :valueType="'date'" 
                input-toggle
                :toggle-button="false"
                :datepicker="{
                ...L,
                format: 'YYYY-MM-DD'
              }"
                
                :timepicker="{
                ...L,
                hoursFormat: 24
              }"

                :key="reInitKey"
                disablePast
            />
            
        </div>

      </div>
    </MDBModalBody>

    <MDBModalFooter class="footer-buttons">
      <MDBBtn color="secondary" outline @click="showTimeEventEdit = false">
        {{ t('calendar.cancel') }}
      </MDBBtn>

      <MDBBtn color="primary" @click="saveEventEdits">
        {{ t('calendar.save') }}
      </MDBBtn>
    </MDBModalFooter>

  </MDBModal>
  
  <!-- Opening provider time event -->
  <MDBModal
    v-model="showTimeEventModal"
    tabindex="-1"
    centered
    removeBackdrop
    :keyboard="false"
    :focus="false"
    scrollable
  >
    <MDBModalHeader class="modal-header-custom availability-modal__header">
      <MDBModalTitle class="availability-modal__title">
        <span class="availability-modal__title-icon">
          <i class="far fa-calendar-check"></i>
        </span>

        <span>
          {{ t('calendar.availabilityDetails') }}
        </span>
      </MDBModalTitle>
    </MDBModalHeader>

    <MDBModalBody class="availability-modal__body">
      <div class="availability-modal__date-heading">
        {{ formatDateTitle(selectedEvent?.start) }}
      </div>

      <div class="availability-status">
        <span class="availability-status__icon">
          <i class="fas fa-check"></i>
        </span>

        <div class="availability-status__content">
          <span class="availability-status__label">
            {{ t('calendar.availabilityStatus') }}
          </span>

          <strong>
            {{
              selectedEvent?.allDay
                ? t('calendar.availableAllDay')
                : t('calendar.available')
            }}
          </strong>
        </div>

        <span class="availability-status__badge">
          {{ t('calendar.visibleToClients') }}
        </span>
      </div>

      <p class="availability-modal__description">
        {{
          selectedEvent?.allDay
            ? t('calendar.allDayAvailabilityDescription')
            : t('calendar.availabilityDescription')
        }}
      </p>

      <div
        v-if="selectedEvent?.allDay"
        class="availability-all-day"
      >
        <span class="availability-all-day__icon">
          <i class="far fa-sun"></i>
        </span>

        <div>
          <span>{{ t('calendar.availabilityPeriod') }}</span>

          <strong>
            {{ t('calendar.fullDay') }}
          </strong>
        </div>
      </div>

      <div
        v-else
        class="availability-schedule"
      >
        <div class="availability-schedule__item">
          <span class="availability-schedule__icon">
            <i class="fas fa-play"></i>
          </span>

          <div class="availability-schedule__content">
            <span>{{ t('calendar.availabilityStarts') }}</span>

            <strong>
              {{
                selectedEvent?.start
                  ? formatLocalDate(selectedEvent.start)
                  : '—'
              }}
            </strong>
          </div>
        </div>

        <div class="availability-schedule__line">
          <span></span>
        </div>

        <div class="availability-schedule__item">
          <span class="availability-schedule__icon availability-schedule__icon--end">
            <i class="fas fa-stop"></i>
          </span>

          <div class="availability-schedule__content">
            <span>{{ t('calendar.availabilityEnds') }}</span>

            <strong>
              {{
                selectedEvent?.end
                  ? formatLocalDate(selectedEvent.end)
                  : '—'
              }}
            </strong>
          </div>
        </div>
      </div>

      <div
        v-if="!selectedEvent?.allDay"
        class="availability-duration"
      >
        <div>
          <span>{{ t('calendar.availabilityDuration') }}</span>
          <strong>{{ selectedAvailabilityDuration }}</strong>
        </div>

        <i class="far fa-clock"></i>
      </div>

      <div class="availability-visibility-note">
        <i class="fas fa-eye"></i>

        <span>
          {{ t('calendar.availabilityVisibilityInfo') }}
        </span>
      </div>
    </MDBModalBody>

    <MDBModalFooter class="availability-modal__footer">
      <MDBBtn
        color="danger"
        outline
        @click="deleteFromPreview"
      >
        <i class="far fa-trash-can me-2"></i>
        {{ t('calendar.delete') }}
      </MDBBtn>

      <MDBBtn
        color="primary"
        @click="openEditModalFromPreview"
      >
        <i class="far fa-pen-to-square me-2"></i>
        {{ t('calendar.editAvailability') }}
      </MDBBtn>

      <MDBBtn
        color="secondary"
        outline
        @click="showTimeEventModal = false"
      >
        {{ t('calendar.close') }}
      </MDBBtn>
    </MDBModalFooter>
  </MDBModal>















  <!-- Opening provider notes event -->
 <MDBModal
    v-model="showNotesEventModal"
    tabindex="-1"
    centered
    removeBackdrop
    :keyboard="false"
    :focus="false"
    scrollable
  >
    <MDBModalHeader class="note-modal__header modal-header-custom">
      <MDBModalTitle class="note-modal__title">
        <span class="note-modal__title-icon">
          <i class="far fa-note-sticky"></i>
        </span>

        <span>
          {{ t('calendar.noteDetails') }}
        </span>
      </MDBModalTitle>
    </MDBModalHeader>

    <MDBModalBody class="note-modal__body">
      <div class="note-modal__heading">
        <span class="note-modal__heading-label">
          {{ t('calendar.noteTitle') }}
        </span>

        <h2>
          {{ selectedEvent?.title || t('calendar.untitledNote') }}
        </h2>
      </div>

      <div class="note-date-card">
        <span class="note-date-card__icon">
          <i class="far fa-calendar"></i>
        </span>

        <div class="note-date-card__content">
          <span>{{ t('calendar.noteDate') }}</span>

          <strong>
            {{
              selectedEvent?.start
                ? formatLocalDate(selectedEvent.start)
                : '—'
            }}
          </strong>
        </div>
      </div>

      <div class="note-content-card">
        <div class="note-content-card__header">
          <span>
            <i class="far fa-file-lines"></i>
            {{ t('calendar.noteContent') }}
          </span>
        </div>

        <p class="note-content-card__text">
          {{ selectedEvent?.note || t('calendar.emptyNote') }}
        </p>
      </div>

      <div class="note-private-info">
        <i class="fas fa-lock"></i>

        <span>
          {{ t('calendar.privateNoteInfo') }}
        </span>
      </div>
    </MDBModalBody>

    <MDBModalFooter class="note-modal__footer">
      <MDBBtn
        color="danger"
        outline
        @click="deleteFromPreview"
      >
        <i class="far fa-trash-can me-2"></i>
        {{ t('calendar.delete') }}
      </MDBBtn>

      <MDBBtn
        color="primary"
        @click="openEditModalFromPreview"
      >
        <i class="far fa-pen-to-square me-2"></i>
        {{ t('calendar.editNote') }}
      </MDBBtn>

      <MDBBtn
        color="secondary"
        outline
        @click="showNotesEventModal = false"
      >
        {{ t('calendar.close') }}
      </MDBBtn>
    </MDBModalFooter>
  </MDBModal>

  <!-- Opening client event modal -->
  <MDBModal
    v-model="showClientEventModal"
    tabindex="-1"
    centered
    :modelValue="true"
    removeBackdrop
    :keyboard="false"
    :focus="false"
    scrollable
  >
    <MDBModalHeader class="modal-header-custom">
      <MDBModalTitle><h5 style="color: #48769c;">{{ t('calendar.agreementAsRecipient') }}</h5></MDBModalTitle>
    </MDBModalHeader>

    <MDBModalBody class="event-modal-body">

      <h2 class="event-title">
         {{ t('calendar.providerOffersService') }}
      </h2>

      <div class="event-date">
        {{ selectedEvent?.start ? formatLocalDate(selectedEvent.start) : '—' }}
      </div>

      <p class="event-subtitle">
        {{ t('calendar.offerReservedForTime') }}
      </p>

      <div class="event-card">
        <h4>{{ t('calendar.offerDetails') }}</h4>

        <div class="info-row">
          <span>{{ t('calendar.service') }}</span>
          <strong>{{ selectedEvent?.title || '—' }}</strong>
        </div>

        <div class="info-row">
          <span>{{ t('calendar.description') }}</span>
          <strong v-html="selectedEvent?.note || '—'"></strong>
        </div>
        <!-- v-if="selectedEvent?.location" -->
        <div class="info-row" >
          <span>{{ t('calendar.location') }}</span>
          <strong>{{ selectedEvent?.address }}</strong>
        </div>
        <!-- selectedEvent?.priceOffer + " €" || 'Sovitaan erikseen' -->
        <div class="info-row">
          <span>{{ t('calendar.estimatedPrice') }}</span>
          <strong >{{ selectedEvent?.budget }} €</strong>
        </div>

        <div class="info-row">
          <span>{{ t('calendar.status') }}</span>
          <strong class="status-waiting">{{ t('calendar.agreed') }}</strong>
        </div>
      </div>

      <div class="event-note">
        {{ selectedEvent?.location }}
        <i class="far fa-comments fa-lg event-chat" @click="onEventChat(selectedEvent?.otherId, selectedEvent?.id)"></i>
      </div>
    </MDBModalBody>

    <MDBModalFooter class="footer-buttons">
      <!-- <MDBBtn color="secondary" @click="openClientEventEdit">{{ t('calendar.edit') }}</MDBBtn> -->
      <MDBBtn color="secondary" @click="showClientEventModal = false">{{ t('calendar.cancel') }}</MDBBtn>
    </MDBModalFooter>
  </MDBModal>


  <!-- Opening provider event modal -->
  <MDBModal
      v-model="showProEventModal"
      tabindex="-1"
      centered
      :modelValue="true"
      removeBackdrop
      :keyboard="false"
      :focus="false"
      scrollable
  >
    <MDBModalHeader class="modal-header-custom">
      <MDBModalTitle><h5 style="color: #ef8627;">{{ t('calendar.agreementAsProvider') }}</h5></MDBModalTitle>
    </MDBModalHeader>
    <MDBModalBody class="event-modal-body">
      <h2 class="event-title">
        {{
          t('calendar.clientWaitingForOffer', {
            client: selectedEvent?.client
          })
        }}
      </h2>

      <div class="event-schedule">
        <div class="schedule-item">
          <span>{{ t('calendar.start') }}</span>

          <strong>
            {{
              selectedEvent?.start
                ? formatLocalDate(selectedEvent.start)
                : '—'
            }}
          </strong>
        </div>

        <div class="schedule-divider">
          <i class="fas fa-arrow-down"></i>
        </div>

        <div class="schedule-item">
          <span>{{ t('calendar.end') }}</span>

          <strong>
            {{
              selectedEvent?.end
                ? formatLocalDate(selectedEvent.end)
                : '—'
            }}
          </strong>
        </div>
      </div>

      <p class="event-subtitle">
        {{ t('calendar.orderReservedForTime') }}
      </p>

      <div class="event-card">
        <h4>{{ t('calendar.orderDetails') }}</h4>

        <div class="info-row">
          <span>{{ t('calendar.service') }}</span>
          <strong>{{ selectedEvent?.title || '—' }}</strong>
        </div>

        <div class="info-row">
          <span>{{ t('calendar.description') }}</span>
          <strong v-html="selectedEvent?.note || '—'"></strong>
        </div>

        <div
          v-if="selectedEvent?.location"
          class="info-row"
        >
          <span>{{ t('calendar.location') }}</span>
          <strong>{{ selectedEvent?.address || '—' }}</strong>
        </div>

        <div class="info-row">
          <span>{{ t('calendar.estimatedPrice') }}</span>

          <strong>
            {{
              selectedEvent?.budget !== null &&
              selectedEvent?.budget !== undefined &&
              selectedEvent?.budget !== ''
                ? `${selectedEvent.budget} €`
                : t('calendar.toBeAgreedSeparately')
            }}
          </strong>
        </div>

        <div class="info-row">
        <span class="desktop-label">
          {{ t('calendar.workDuration') }}
        </span>

        <span class="mobile-label">
          {{ t('calendar.workDurationShort') }}
        </span>

        <div class="work-time-value">
          <strong>{{ selectedEventDuration }}</strong>

          <button
            type="button"
            class="duration-edit-button"
            @click="openOfferEventEdit"
          >
            <i class="fas fa-pen"></i>

            <span class="desktop-label">
              {{ t('calendar.changeDuration') }}
            </span>

            <span class="mobile-label">
              {{ t('calendar.changeDurationShort') }}
            </span>
          </button>
        </div>
      </div>

        <div class="info-row">
          <span>{{ t('calendar.status') }}</span>
          <strong class="status-waiting">
            {{ t('calendar.agreed') }}
          </strong>
        </div>
      </div>

      <div class="event-note">
        {{ selectedEvent?.location }}

        <i
          class="far fa-comments fa-lg event-chat"
          @click="
            onEventChat(
              selectedEvent?.otherId,
              selectedEvent?.id
            )
          "
        ></i>
      </div>
      <!-- {{ t('calendar.cancel') }} -->
    </MDBModalBody>
    <MDBModalFooter class="footer-buttons">
      <MDBBtn v-if="event_state === 'vacation' || event_state === 'time'" color="danger" outline @click="deleteFromPreview">{{ t('calendar.delete') }}</MDBBtn>
      <MDBBtn v-if="(event_state === 'vacation' || event_state === 'time') && !selectedEvent?.allDay"  color="primary" @click="openEditModalFromPreview">{{ t('calendar.edit') }}</MDBBtn>
      <!-- <MDBBtn outline="warning" @click="openOfferEventEdit">{{ t('calendar.editWorkDuration') }}</MDBBtn> -->
      <MDBBtn color="secondary" outline @click="showProEventModal=false"><i class="fas fa-undo-alt fa-2x"></i></MDBBtn>
      <!-- <MDBBtn color="danger" @click="deleteEvent">Delete</MDBBtn> -->
    </MDBModalFooter>
  </MDBModal>

  <!-- Open provider event edit -->
  <MDBModal
    v-model="showProviderEventEdit"
    centered
    tabindex="-1"
    removeBackdrop
    :keyboard="false"
    :focus="false"
  >
    <MDBModalHeader class="modal-header-custom duration-modal__header">
      <MDBModalTitle class="duration-modal__title">
        <i class="far fa-clock duration-modal__title-icon"></i>
        {{ t('calendar.durationEditorTitle') }}
      </MDBModalTitle>
    </MDBModalHeader>

    <MDBModalBody class="duration-modal__body">
      <p class="duration-modal__description">
        {{ t('calendar.durationEditorDescription') }}
      </p>

      <div class="duration-summary">
        <div class="duration-summary__item">
          <div class="duration-summary__icon">
            <i class="fas fa-play"></i>
          </div>

          <div class="duration-summary__content">
            <span>{{ t('calendar.serviceStart') }}</span>

            <strong>
              {{
                editOfferForm.start
                  ? formatLocalDate(editOfferForm.start)
                  : '—'
              }}
            </strong>
          </div>
        </div>

        <div class="duration-summary__arrow">
          <i class="fas fa-arrow-right"></i>
        </div>

        <div class="duration-summary__item">
          <div class="duration-summary__icon duration-summary__icon--end">
            <i class="fas fa-flag-checkered"></i>
          </div>

          <div class="duration-summary__content">
            <span>{{ t('calendar.serviceEnd') }}</span>

            <strong>
              {{
                editOfferForm.end
                  ? formatLocalDate(editOfferForm.end)
                  : '—'
              }}
            </strong>
          </div>
        </div>
      </div>

      <div class="duration-current">
        <div>
          <span class="duration-current__label">
            {{ t('calendar.estimatedDuration') }}
          </span>

          <strong class="duration-current__value">
            {{ selectedEventDuration }}
          </strong>
        </div>

        <i class="far fa-hourglass duration-current__icon"></i>
      </div>

      <div class="duration-picker-section">
        <label class="duration-picker-section__label">
          {{ t('calendar.selectServiceEnd') }}
        </label>

        <p class="duration-picker-section__hint">
          {{ t('calendar.minimumDurationHint') }}
        </p>

        <div class="field-wrapper">
          <MDBDateTimepicker
            v-if="providerPickerReady"
            :key="reInitKey"
            v-model="editOfferForm.end"
            valueType="date"
            size="lg"
            :label="t('calendar.serviceEnd')"
            :defaultDate="pickerOfferDefaultDate"
            :defaultTime="pickerOfferDefaultTime"
            :toggle-button="false"
            input-toggle
            disablePast
            :datepicker="{
              ...L,
              format: 'YYYY-MM-DD'
            }"
            :timepicker="{
              ...L,
              hoursFormat: 24
            }"
            @update:modelValue="offerDurationError = null"
          />

          <small
            v-if="offerDurationError"
            class="field__error"
            role="alert"
          >
            <i class="fas fa-circle-exclamation"></i>
            {{ offerDurationError }}
          </small>
        </div>
      </div>
    </MDBModalBody>

    <MDBModalFooter class="footer-buttons duration-modal__footer">
      <MDBBtn
        color="secondary"
        outline
        @click="closeProviderDurationEdit"
      >
        {{ t('calendar.cancel') }}
      </MDBBtn>

      <MDBBtn
        color="primary"
        @click="saveOfferEventEdits"
      >
        <i class="fas fa-check me-2"></i>
        {{ t('calendar.saveDuration') }}
      </MDBBtn>
    </MDBModalFooter>
  </MDBModal>
  
</template>

<script setup>
import { MDBModal, MDBModalHeader, MDBModalTitle, MDBBtn, MDBBtnClose, MDBModalBody, MDBModalFooter, MDBInput, MDBTextarea, MDBDateTimepicker, MDBSelect } from 'mdb-vue-ui-kit';

import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'   // drag/drop & select
import { formatDate } from '@fullcalendar/core'
import Legend from '../components/Legend.vue'
import { EVENT_TYPES } from '../components/controllers/eventTypes.js'

import { getFormatted } from './helpers/formatDatepicker.js';

import fiLocale from '@fullcalendar/core/locales/fi'
import svLocale from '@fullcalendar/core/locales/sv'
import etLocale from '@fullcalendar/core/locales/et'
import enLocale from '@fullcalendar/core/locales/en-gb'
import ruLocale from '@fullcalendar/core/locales/ru'
import { getBottomRightAnchor } from './helpers/chatGeometry.js';

import { useRouter, useRoute } from "vue-router"

import { storeToRefs } from 'pinia';
import { useLoginStore } from '@/stores/login';
import { useClientStore } from '@/stores/recipientStore';
import { useProStore } from '@/stores/providerStore';

import '@/styles/form.css'

defineProps({
  count: {type: Number},
  days: Array
})

const { t, locale } = useI18n()
const emit = defineEmits(['over', 'open-chat'])

const router = useRouter();
const route = useRoute();
const auth = useLoginStore();
const clientStore = useClientStore();
const proStore = useProStore();

const { user } = storeToRefs(auth);
const { clientConfirmed } = storeToRefs(clientStore);
const { isUserPro, proCalendarEvents, proTimetable } = storeToRefs(proStore);


// const events = ref([
//   { id: '1', title: 'Team sync', start: '2025-09-16T10:00:00', end: '2025-09-16T11:00:00', extendedProps: { type: 'meeting', meetingId: 'ABC123', location: 'Room 1' } },
//   { id: '2', title: 'Team sync',     start: '2025-09-16T10:00:00', end: '2025-09-16T11:00:00', extendedProps: { type: 'meeting', location: 'Room 2' } },
//   { id: '3', title: 'Client call',   start: '2025-09-18T13:30:00', end: '2025-09-18T14:00:00', extendedProps: { type: 'client', location: 'Room 3' } },
//   { id: '4', title: 'Vacation',      start: '2025-09-20', allDay: true, extendedProps: { type: 'vacation', location: 'Room 4' } },
//   { id: '5', title: 'Write report',  start: '2025-09-19T09:00:00', end: '2025-09-19T10:00:00', extendedProps: { type: 'task', location: 'Room 5' } },
//
// ])
//
// // state for modal
const showTimeEventModal = ref(false);
const showNotesEventModal = ref(false);
const showProEventModal = ref(false)
const showClientEventModal = ref(false);
const selectedEvent = ref(null)

const showEdit = ref(false)
const showTimeEventEdit = ref(false);
const showProviderEventEdit = ref(false);
const showEventEdit = ref(false);

const reInitKey = ref(0);
const providerPickerReady = ref(false);

const  L = computed(() => {
  return getFormatted(locale.value);
})

const event_state = ref("");

const createdEvents = ref([]);

const toDate = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'string') {
    const d = new Date(v);           // handles "...+00:00", "...Z", etc.
    return isNaN(+d) ? null : d;
  }
  if (typeof v === 'number') return new Date(v);      // epoch ms
  if (v && typeof v === 'object' && 'seconds' in v)   // Firestore Timestamp
    return new Date(v.seconds * 1000);
  return null;
};
/* cc?.confirmedOffer?.placeOrGo !== '' ? (cc?.confirmedOffer?.placeOrGo === 'go' ? cc.confirmedOffer.name + " tulossa" : cc.confirmedOffer.name + " odottaa!") : 'Sovitaan erikseen', */
const events = computed(() => [
  ...clientConfirmed.value.map(cc => ({
    id: cc.id,
    title: cc?.header,
    start: toDate(cc.created),
    end: toDate(cc.created),

    startEditable: false,
    durationEditable: false,
    /* address: cc?.isIncludeOffers ? (cc?.confirmedOffer?.placeOrGo === 'go' ? cc?.address : cc?.confirmedOffer?.provider?.address) : 'Sovitaan erikseen', */
    extendedProps: {
      /* type: "offer", */
      otherId: cc?.confirmed_provider_user_id,
      type: "client",
      canEdit: false,
      canResize: false,
      address: cc?.isIncludeOffers && cc?.confirmedOffer?.placeOrGo !== '' ? (cc?.confirmedOffer?.placeOrGo === 'go' ? cc?.confirmedOffer.cAddress : cc?.confirmedOffer?.pAddress) : 'Sovitaan erikseen',
      priceOffer: cc?.confirmedOffer?.price,
      /* budget: cc.isIncludeOffers ? cc?.offer?.price : cc?.budget.min + " - " + cc?.budget.max, */
      budget: cc.isIncludeOffers ? cc?.confirmedOffer?.price : 'Sovitaan erikseen',
      location: 
        cc?.isIncludeOffers && cc?.confirmedOffer.placeOrGo !== '' 
        ? 
        (
          cc?.confirmedOffer?.place === 'go' 
          ?  
          t('calendar.providerComing', {provider: cc.confirmedOffer.name})
          : 
          
          t('calendar.providerWaiting', {provider: cc.confirmedOffer.name})
        ) 
        : 'Palvelun sijainti sopimuksen mukaan',
      note: cc.description || ' - '
    } 
  })),
  // Confirmed offer in calendar
  ...proCalendarEvents.value.map(pce => {
    const offer = pce?.offers?.find(
      o => String(o.sender) === String(user.value.id)
    );

    const place = offer?.placeOrGo || "";
    const price = offer?.price || "";

    const start = toDate(pce.created);
    const estimatedEnd = toDate(pce.estimatedFinish);

    const end =
      estimatedEnd &&
      start &&
      estimatedEnd > start
        ? estimatedEnd
        : start
          ? new Date(start.getTime() + 60 * 60 * 1000)
          : null;

    return {
      id: String(pce.id),
      title: pce.header,

      start,
      end,
      allDay: false,

      startEditable: false,
      durationEditable: true,

      extendedProps: {
        type: "pro",
        canEdit: false,
        canResize: false,
        otherId: pce?.author_id,
        client: pce?.user?.firstName,
        note: pce.description,

        address:
          pce?.isIncludeOffers && place !== ""
            ? place === "go"
              ? offer?.cAddress
              : offer?.pAddress
            : t("calendar.toBeAgreedSeparately"),

        budget:
          pce.isIncludeOffers
            ? price
            : t("calendar.toBeAgreedSeparately"),

        location:
          pce?.isIncludeOffers && place !== ""
            ? place === "go"
              ? t("calendar.travelToClient")
              : t("calendar.clientComing")
            : t("calendar.serviceLocationByAgreement"),
      },
    };
  }),
  ...proTimetable.value.map(ppt => ({
    id: ppt.id,
    title: ppt.title,
    start: toDate(ppt.start),
    end: toDate(ppt.end),
    startEditable: true,
    durationEditable: true,
    allDay: ppt.isAllDay,
    extendedProps: {
      type: ppt.state,
      canEdit: true,
      canResize: true,
      note: ppt.content?.trim() || '',
    }
  })),
  //...createdEvents.value
])

const today = new Date();

// Only future (or today) events
const filteredEvents = computed(() =>
  events.value.filter(e => {
    const t = new Date(e.start).getTime()
    return t >= new Date().getTime() //startOfToday.value
  })
)

/* const stateOptions = ref([
  {text: "🕒 Vapaa aika", value: "time"},
  {text: "📝 Muistiinpano", value: "vacation"}
]) */

/* const stateOptions = computed(() => [
  {
    text: `🕒 ${t("calendar.freeTime")}`,
    value: "time"
  },
  {
    text: `📝 ${t("calendar.note")}`,
    value: "vacation"
  }
]); */

const stateOptions = ref([
  {
    text: `🕒 ${t("calendar.availableTime")}`,
    value: "time",
    selected: true
  },
  {
    text: `📝 ${t("calendar.privateNote")}`,
    value: "vacation",
    selected: false
  }
]);

// Changing locale language
watch(locale, () => {
  stateOptions.value = stateOptions.value.map(option => ({
    ...option,
    text:
      option.value === "time"
        ? `🕒 ${t("calendar.availableTime")}`
        : `📝 ${t("calendar.privateNote")}`
  }));
});

const selectedEntryType = computed(() => {
  return (
    stateOptions.value.find(option => option.selected)?.value ||
    "time"
  );
});


const selectedState = computed(() => {
  const sel = stateOptions.value.find(o => o.selected);
  return sel ? sel.value : null;
  
});

// Eventi loomise kestuse arvutamine
const createEntryDuration = computed(() => {
  const start = fromLocalInput(form.value.start);
  const end = fromLocalInput(form.value.end);

  if (
    !isValidDate(start) ||
    !isValidDate(end) ||
    end <= start
  ) {
    return t("calendar.durationNotSet");
  }

  const totalMinutes = Math.round(
    (end.getTime() - start.getTime()) / 60000
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return t("calendar.durationHoursMinutes", {
      hours,
      minutes
    });
  }

  if (hours > 0) {
    return t("calendar.durationHours", {
      hours
    });
  }

  return t("calendar.durationMinutes", {
    minutes
  });
});

// Modali sulgemine
const createEventError = ref(null);

const closeCreateEventModal = () => {
  showCreate.value = false;
  createEventError.value = null;
};

/* ----- Create-event modal state ----- */
const calendarRef = ref(null)
const showCreate = ref(false)



const form = ref({
  title: '',
  location: '',
  type: selectedState,
  note: '',
  allDay: true,
  start: null, // JS Date
  end: null,   // JS Date
})

const editForm = ref({
  id: '',
  title: '',
  start: '',
  end: '',
  location: '',
  note: ''
})



// Provider offer edit
const editOfferForm = ref({
  id: '',
  start: '',
  end: '',
})


const addOneHour = date => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getTime() + 60 * 60 * 1000);
};

const pickerOfferDefaultDate = computed(() => {
  const end = editOfferForm.value.end;

  if (!end) return "";

  const date = new Date(end);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = value => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-");
});

const pickerOfferDefaultTime = computed(() => {
  const end = editOfferForm.value.end;

  if (!end) return "";

  const date = new Date(end);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = value => String(value).padStart(2, "0");

  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
});



async function openOfferEventEdit() {
  providerPickerReady.value = false;

  const ev = selectedEvent.value;

  if (!ev?.id || !ev?.start) return;

  const start = new Date(ev.start);

  if (Number.isNaN(start.getTime())) return;

  const minimumEnd = new Date(
    start.getTime() + 60 * 60 * 1000
  );

  const existingEnd = ev.end
    ? new Date(ev.end)
    : null;

  const end =
    existingEnd &&
    !Number.isNaN(existingEnd.getTime()) &&
    existingEnd >= minimumEnd
      ? existingEnd
      : minimumEnd;

  editOfferForm.value = {
    id: String(ev.id),
    start,
    end,
  };

  editingEventId.value = String(ev.id);

  showProEventModal.value = false;
  showProviderEventEdit.value = true;

  await nextTick();

  reInitKey.value++;
  providerPickerReady.value = true;
}

const offerDurationError__ = ref(null)


const saveOfferEventEdits__ = async () => {
  offerDurationError.value = null;

  const id =
    editOfferForm.value.id ||
    editingEventId.value;

  if (!id) {
    offerDurationError.value =
      t("calendar.durationErrorMissingEvent");

    return;
  }

  const calendarApi =
    calendarRef.value?.getApi();

  const eventApi =
    calendarApi?.getEventById(String(id));

  if (!eventApi) {
    offerDurationError.value =
      t("calendar.durationErrorEventNotFound");

    console.error(
      t("calendar.durationErrorEventNotFound"),
      id
    );

    return;
  }

  const start = new Date(
    editOfferForm.value.start
  );

  const end = new Date(
    editOfferForm.value.end
  );

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    offerDurationError.value =
      t("calendar.durationErrorInvalidTime");

    return;
  }






  const minimumEnd = new Date(
    start.getTime() + 30 * 60 * 1000
  );

  if (end < minimumEnd) {
    offerDurationError.value =
      t("calendar.durationErrorMinimum");

    editOfferForm.value.end =
      new Date(minimumEnd);

    await nextTick();
    reInitKey.value++;

    return;
  }

  const previousState =
    eventApi.extendedProps?.type;

  try {
    eventApi.setDates(start, end, {
      allDay: false
    });

    const eventOnEdit = {
      id: String(id),
      state: previousState,
      isAllDay: false,
      start,
      end
    };

    await proStore.onEditOrderDuration(
      String(id),
      eventOnEdit
    );

    selectedEvent.value = {
      ...selectedEvent.value,
      start: start.toISOString(),
      end: end.toISOString(),
      allDay: false
    };

    showProviderEventEdit.value = false;
    offerDurationError.value = null;
  } catch (error) {
    offerDurationError.value =
      t("calendar.durationErrorSaveFailed");

    console.error(
      "Teenuse kestuse salvestamine ebaõnnestus:",
      error
    );
  }
};

// Handle delete selection error message
watch(() => showProviderEventEdit.value,
(value) => {
  console.log('NEW VALUE ', value)
  if (!value) offerDurationError.value = null
})

// Display work estimated duration
const selectedEventDuration = computed(() => {
  const startValue = selectedEvent.value?.start;
  const endValue = selectedEvent.value?.end;

  if (!startValue || !endValue) {
    return t("calendar.durationNotSet");
  }

  const start = new Date(startValue);
  const end = new Date(endValue);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return t("calendar.durationNotSet");
  }

  const totalMinutes = Math.round(
    (end.getTime() - start.getTime()) / 60000
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return t("calendar.durationHoursMinutes", {
      hours,
      minutes
    });
  }

  if (hours > 0) {
    return t("calendar.durationHours", {
      hours
    });
  }

  return t("calendar.durationMinutes", {
    minutes
  });
});


const closeProviderDurationEdit = () => {
  showProviderEventEdit.value = false;
  offerDurationError.value = null;
};







 
// Time event

const pickerDefaultDate = computed(() => {
  const end = editForm.value.end;

  if (!end) return "";

  const date = new Date(end);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = value => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-");
});

const pickerDefaultTime = computed(() => {
  const end = editForm.value.end;

  if (!end) return "";

  const date = new Date(end);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = value => String(value).padStart(2, "0");

  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
});

const timePickerReady = ref(false);

async function openTimeEventEdit() {
  timePickerReady.value = false;

  const ev = selectedEvent.value;

  if (!ev?.id || !ev?.start) return;

  const start = new Date(ev.start);

  if (Number.isNaN(start.getTime())) return;

  const minimumEnd = new Date(
    start.getTime() + 60 * 60 * 1000
  );

  const existingEnd = ev.end
    ? new Date(ev.end)
    : null;

  const end =
    existingEnd &&
    !Number.isNaN(existingEnd.getTime()) &&
    existingEnd >= minimumEnd
      ? existingEnd
      : minimumEnd;

  editOfferForm.value = {
    id: String(ev.id),
    start,
    end,
  };

  editingEventId.value = String(ev.id);

  showProEventModal.value = false;
  showProviderEventEdit.value = true;

  await nextTick();

  reInitKey.value++;
  providerPickerReady.value = true;
}

const offerDurationError = ref(null)


const saveOfferEventEdits = async () => {
  offerDurationError.value = null;

  const id =
    editOfferForm.value.id ||
    editingEventId.value;

  if (!id) {
    offerDurationError.value =
      t("calendar.durationErrorMissingEvent");

    return;
  }

  const calendarApi =
    calendarRef.value?.getApi();

  const eventApi =
    calendarApi?.getEventById(String(id));

  if (!eventApi) {
    offerDurationError.value =
      t("calendar.durationErrorEventNotFound");

    console.error(
      t("calendar.durationErrorEventNotFound"),
      id
    );

    return;
  }

  const start = new Date(
    editOfferForm.value.start
  );

  const end = new Date(
    editOfferForm.value.end
  );

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    offerDurationError.value =
      t("calendar.durationErrorInvalidTime");

    return;
  }

  const minimumEnd = new Date(
    start.getTime() + 30 * 60 * 1000
  );

  if (end < minimumEnd) {
    offerDurationError.value =
      t("calendar.durationErrorMinimum");

    editOfferForm.value.end =
      new Date(minimumEnd);

    await nextTick();
    reInitKey.value++;

    return;
  }

  const previousState =
    eventApi.extendedProps?.type;

  try {
    eventApi.setDates(start, end, {
      allDay: false
    });

    const eventOnEdit = {
      id: String(id),
      state: previousState,
      isAllDay: false,
      start,
      end
    };

    await proStore.onEditOrderDuration(
      String(id),
      eventOnEdit
    );

    selectedEvent.value = {
      ...selectedEvent.value,
      start: start.toISOString(),
      end: end.toISOString(),
      allDay: false
    };

    showProviderEventEdit.value = false;
    offerDurationError.value = null;
  } catch (error) {
    offerDurationError.value =
      t("calendar.durationErrorSaveFailed");

    console.error(
      "Teenuse kestuse salvestamine ebaõnnestus:",
      error
    );
  }
};













// If your type bar should show ONLY on the start day:
const startKeyOf = (start) => {
  const s = new Date(start);
  return ymdLocal(s);
};


// Notes and time event modal time counter
const editAvailabilityError = ref(null);

const editAvailabilityDuration = computed(() => {
  const startValue = editForm.value.start;
  const endValue = editForm.value.end;

  if (!startValue || !endValue) {
    return t("calendar.durationNotSet");
  }

  const start = new Date(startValue);
  const end = new Date(endValue);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return t("calendar.durationNotSet");
  }

  const totalMinutes = Math.round(
    (end.getTime() - start.getTime()) / 60000
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return t("calendar.durationHoursMinutes", {
      hours,
      minutes
    });
  }

  if (hours > 0) {
    return t("calendar.durationHours", {
      hours
    });
  }

  return t("calendar.durationMinutes", {
    minutes
  });
});

// Closing modal
const closeCalendarEditModal = () => {
  showEdit.value = false;
  editAvailabilityError.value = null;
};

// Provider time event duration counter
const selectedAvailabilityDuration = computed(() => {
  const startValue = selectedEvent.value?.start;
  const endValue = selectedEvent.value?.end;

  if (!startValue || !endValue) {
    return t("calendar.durationNotSet");
  }

  const start = new Date(startValue);
  const end = new Date(endValue);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return t("calendar.durationNotSet");
  }

  const totalMinutes = Math.round(
    (end.getTime() - start.getTime()) / 60000
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return t("calendar.durationHoursMinutes", {
      hours,
      minutes
    });
  }

  if (hours > 0) {
    return t("calendar.durationHours", {
      hours
    });
  }

  return t("calendar.durationMinutes", {
    minutes
  });
});

onMounted(() => {
  console.log("Mounted is on...");
  //const eventDate = new Date("2025-10-31T15:00:00.000Z")
  //const now = new Date()
})

function openClientEventEdit() {
  editOfferForm.value = {
    id: selectedEvent.value?.id || '',
    title: selectedEvent.value?.title || '',
    note: selectedEvent.value?.note || '',
    address: selectedEvent.value?.address || '',
    priceOffer: selectedEvent.value?.priceOffer || '',
    location: selectedEvent.value?.location || ''
  }

  showClientEventModal.value = false
  showEventEdit.value = true
}

async function saveOfferEdit() {
  const payload = {
    id: editOfferForm.value.id,
    title: editOfferForm.value.title,
    note: editOfferForm.value.note,
    address: editOfferForm.value.address,
    priceOffer: editOfferForm.value.priceOffer,
    location: editOfferForm.value.location
  }

  const payloadForDatabase = {

  }

  //await proStore.onEditOffer(payload.id, payload)
  //await clientStore.updateClientMain(payload.id, payload);
  await clientStore.updatingBookingOffer(payload.id, {
    price: Number(editOfferForm.value.priceOffer),
    placeOrGo: editOfferForm.value.placeOrGo || ''
  })
  selectedEvent.value = {
    ...selectedEvent.value,
    ...payload
  }

  showEventEdit.value = false;
  showClientEventModal.value = true;
}

const onEventChat = (otherId, eventId) => {
  console.log("Clicked on chat - " + otherId + "event id - " + eventId);
  emit("open-chat", {
    otherId,
    bookingId: eventId,
    mode: "pro",
    anchor: getBottomRightAnchor()
  });
}

const intlLocale = computed(() => ({
  fi: "fi-FI",
  sv: "sv-SE",
  et: "et-EE",
  en: "en-GB",
  ru: "ru-RU"
}[locale.value] ?? "fi-FI"));

const formatLocalDate = value => {
  const date = fromLocalInput(value);

  if (!isValidDate(date)) {
    return "";
  }

  return new Intl.DateTimeFormat(
    intlLocale.value,
    {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Helsinki",
      hour12: false,
      hourCycle: "h23"
    }
  ).format(date);
};

const formatLocalTime = value => {
  const date = new Date(value);

  if (!isValidDate(date)) {
    return "";
  }

  return date.toLocaleTimeString(
    intlLocale.value,
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }
  );
};

/* For time title formatting */
const formatDateTitle = value => {
  const date = new Date(value);

  if (!isValidDate(date)) {
    return "";
  }

  return new Intl.DateTimeFormat(
    intlLocale.value,
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Helsinki"
    }
  ).format(date);
};

/* ensure end exists (30 min for timed, 1 day for allDay) */
function ensureEnd(start, allDay) {
  if (!start) return null
  return allDay
      ? new Date(start.getTime() + 24 * 60 * 60 * 1000)
      : new Date(start.getTime() + 30 * 60 * 1000)
}

/* open create modal from dateClick/select */
function openCreate({ start, end, allDay }) {
  console.log("DRAGGED START: " + start);
  
  const safeEnd = end ?? ensureEnd(start, allDay)
  form.value = {
    title: '',
    location: '',
    type: selectedState || 'time',
    note: '',
    allDay: !!allDay,
    start,
    end: safeEnd,
  }
  showCreate.value = true
}

/* save new event with extendedProps */
const saveEvent = async () => {
  createEventError.value = null;

  const eventType = selectedEntryType.value;

  const start = fromLocalInput(form.value.start);
  const end = fromLocalInput(form.value.end);

  if (!isValidDate(start) || !isValidDate(end)) {
    createEventError.value = t(
      "calendar.createEventErrorInvalidTime"
    );

    return;
  }

  if (start < new Date()) {
    createEventError.value = t(
      "calendar.createEventErrorPastStart"
    );

    return;
  }

  if (end <= start) {
    createEventError.value = t(
      "calendar.createEventErrorEndBeforeStart"
    );

    return;
  }

  if (eventType === "time") {
    const minimumEnd = new Date(
      start.getTime() + 30 * 60 * 1000
    );

    if (end < minimumEnd) {
      createEventError.value = t(
        "calendar.createEventErrorMinimumDuration"
      );

      return;
    }
  }

  const title =
    eventType === "vacation"
      ? String(form.value.title || "").trim()
      : t("calendar.available");

  const note =
    eventType === "vacation"
      ? String(form.value.note || "").trim()
      : "";

  if (eventType === "vacation" && !title) {
    createEventError.value = t(
      "calendar.createEventErrorMissingTitle"
    );

    return;
  }

  const eventPayload = {
    state: eventType,
    allDay: Boolean(form.value.allDay),
    title,
    content: note,
    start,
    end
  };

  try {
    await proStore.addAvailableTimeEvent(
      eventPayload
    );

    showCreate.value = false;
    createEventError.value = null;
  } catch (error) {
    createEventError.value = t(
      "calendar.createEventErrorSaveFailed"
    );

    console.error(
      "Kalendrikirje loomine ebaõnnestus:",
      error
    );
  }
};



const saveEvent__prev = async() => {
  const f = form.value
  
  console.log("CREATED time start - " + f.start);
  console.log("CREATED time end - " + f.end)

  const dEvent = {
    state: f.type,
    allDay: f.allDay,
    title: f.title.trim() || 'Muistiinpano',
    content: f.note?.trim(),
    start: f.start,
    end: f.end
  }

  // New timerangeEvent to db
  await proStore.addAvailableTimeEvent(dEvent);

  console.log("Added new time event ", dEvent);
  console.log("Is there allDay? " + dEvent.allDay);

  createdEvents.value = [
    ...createdEvents.value,
    {
      id: String(Date.now()),
      title: f.title.trim(),
      start: f.start,
      end: f.end,
      startEditable: true,
      durationEditable: true,
      allDay: f.allDay,
      extendedProps: {
        type: f.type,
        canEdit: true,
        canResize: true,
        location: f.location?.trim() || '',
        note: f.note?.trim() || t('calendar.note'),
      },
    },
  ]
  showCreate.value = false
}


/* ------------ helpers ------------ */
const toLocalInput = (d) => {
  if (!d) return ''
  const pad = (n) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

// Accept Date | ISO | "YYYY-MM-DD, HH:mm" | "YYYY-MM-DD HH:mm" | "DD.MM.YYYY HH:mm"
const fromLocalInput = (v) => {
  if (!v) return null;
  if (v instanceof Date) return isValidDate(v) ? v : null;

  if (typeof v === 'string') {
    // 1) ISO or ISO-like
    const dIso = new Date(v.includes('T') ? v : v.replace(',', '').replace(' ', 'T'));
    if (isValidDate(dIso)) return dIso;

    // 2) "YYYY-MM-DD, HH:mm" or "YYYY-MM-DD HH:mm"
    let m = v.match(/^(\d{4})-(\d{2})-(\d{2})[,\s]+(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (m) {
      const [, y, mo, d, h, mi, s] = m.map(Number);
      return new Date(y, mo - 1, d, h, mi, s || 0); // local time
    }

    // 3) "DD.MM.YYYY HH:mm"
    m = v.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (m) {
      const [, d, mo, y, h, mi, s] = m.map(Number);
      return new Date(y, mo - 1, d, h, mi, s || 0);
    }
  }
  return null;
};



/* ------------ Time and note edit modal state ------------ */

let editingEventApi = null // FullCalendar EventApi currently being edited


// Really for time
const openEditModalFromPreview = () => {
  const id = selectedEvent.value?.id;
  if (!id) return;

  const api = calendarRef.value.getApi();
  const evApi = api.getEventById(String(id));
  if (!evApi) {
    console.warn('No EventApi found for id', id);
    return;
  }

  // reuse your existing editor opener
  openEditModal(evApi);

  // optionally close the preview modal
  showProEventModal.value = false;
}

const editingEventId = ref(null);

/* Open modal from an event click to edit */
function openEditModal(eventLike) {
  const ev = eventLike?.event ?? eventLike;
  if (!ev) return;

  showTimeEventModal.value = false;
  showNotesEventModal.value = false;

  // Always store the id as a string (getEventById uses string matching)
  editingEventId.value = String(ev.id);

  editForm.value = {
    id: String(ev.id),
    title: ev.title || 'Muistinpano',
    start: toLocalInput(ev.start),
    end:   toLocalInput(ev.end),
    location: ev.extendedProps?.location || '',
    note: ev.extendedProps?.note || ''
  };

   /* editForm.value = {
    title: ev.title || "",
    note: ev.extendedProps?.note || "",
    location: ev.extendedProps?.location || "",
    start: ev.start ? new Date(ev.start) : null,
    end: ev.end
      ? new Date(ev.end)
      : ev.start
        ? new Date(ev.start.getTime() + 60 * 60 * 1000)
        : null,
  }; */


  //reInitKey.value++;
  showEdit.value = true;

  // clear selection
  const api = calendarRef.value.getApi();
  api.unselect();
  
}

const ymdLocal = (d) => {
  const dt = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;
};






const saveTimeEdit = () => {

}




/* if (prevState === "time") {
  if (
    !isValidDate(startForApi) ||
    !isValidDate(endForApi)
  ) {
    editAvailabilityError.value =
      t("calendar.availabilityErrorInvalidTime");

    return;
  }

  if (startForApi < new Date()) {
    editAvailabilityError.value =
      t("calendar.availabilityErrorPastStart");

    return;
  }

  if (endForApi <= startForApi) {
    editAvailabilityError.value =
      t("calendar.availabilityErrorEndBeforeStart");

    return;
  }

  const minimumEnd = new Date(
    startForApi.getTime() + 30 * 60 * 1000
  );

  if (endForApi < minimumEnd) {
    editAvailabilityError.value =
      t("calendar.availabilityErrorMinimumDuration");

    return;
  }
} */

// Eduka salvestamise lõpus 
// editAvailabilityError.value = null;
// showEdit.value = false;

const MS_DAY = 24 * 60 * 60 * 1000;

const dayKeysOfRange = (
  start,
  end,
  allDay = false
) => {
  if (!start) return [];

  const rangeStart = new Date(start);
  const rangeEnd = end
    ? new Date(end)
    : new Date(start);

  if (
    !isValidDate(rangeStart) ||
    !isValidDate(rangeEnd)
  ) {
    return [];
  }

  /*
   * FullCalendari all-day event'i end on exclusive.
   * Näiteks 10.–11. kuupäev tähendab ainult 10. kuupäeva.
   */
  if (allDay) {
    rangeEnd.setTime(
      rangeEnd.getTime() - MS_DAY
    );
  }

  rangeStart.setHours(0, 0, 0, 0);
  rangeEnd.setHours(0, 0, 0, 0);

  const keys = [];

  for (
    let current = new Date(rangeStart);
    current <= rangeEnd;
    current.setDate(current.getDate() + 1)
  ) {
    keys.push(ymdLocal(current));
  }

  return keys;
};



const saveEventEdits = async () => {
  editAvailabilityError.value = null;

  const id = String(editingEventId.value || "");

  if (!id) {
    console.error("Muudetava sündmuse ID puudub");
    return;
  }

  const calendarApi = calendarRef.value?.getApi?.();
  const eventApi = calendarApi?.getEventById(id);

  if (!eventApi) {
    console.error("Kalendrisündmust ei leitud:", id);
    return;
  }

  const eventType = eventApi.extendedProps?.type;
  const form = editForm.value;

  const title = String(form.title || "").trim();
  const note = String(form.note || "").trim();

  /*
   * Märkme muutmine
   *
   * Märkme modalis ei muudeta kuupäeva ega kellaaega,
   * seega säilitame olemasolevad väärtused.
   */
  if (eventType === "vacation") {
    const payload = {
      id,
      state: eventType,
      allDay: eventApi.allDay,
      isAllDay: eventApi.allDay,
      title: title || t("calendar.untitledNote"),
      content: note,
      start: eventApi.start,
      end: eventApi.end,
    };

    try {
      await proStore.onEdit(id, payload);

      eventApi.setProp("title", payload.title);
      eventApi.setExtendedProp("note", note);
      eventApi.setExtendedProp("content", note);

      selectedEvent.value = {
        ...selectedEvent.value,
        title: payload.title,
        note,
        content: note,
        start: eventApi.start?.toISOString() || null,
        end: eventApi.end?.toISOString() || null,
        allDay: eventApi.allDay,
      };

      showEdit.value = false;
      showNotesEventModal.value = true;
    } catch (error) {
      console.error("Märkme salvestamine ebaõnnestus:", error);
    }

    return;
  }

  /*
   * Saadaoleva aja muutmine
   */
  if (eventType === "time") {
    const newStart = fromLocalInput(form.start);
    const newEnd = fromLocalInput(form.end);

    if (!isValidDate(newStart) || !isValidDate(newEnd)) {
      editAvailabilityError.value = t(
        "calendar.availabilityErrorInvalidTime"
      );
      return;
    }

    const now = new Date();

    if (newStart < now) {
      editAvailabilityError.value = t(
        "calendar.availabilityErrorPastStart"
      );
      return;
    }

    if (newEnd <= newStart) {
      editAvailabilityError.value = t(
        "calendar.availabilityErrorEndBeforeStart"
      );
      return;
    }

    const minimumEnd = new Date(
      newStart.getTime() + 30 * 60 * 1000
    );

    if (newEnd < minimumEnd) {
      editAvailabilityError.value = t(
        "calendar.availabilityErrorMinimumDuration"
      );
      return;
    }

    const oldDayKeys = new Set(
      dayKeysOfRange(
        eventApi.start,
        eventApi.end,
        eventApi.allDay
      )
    );

    const newDayKeys = new Set(
      dayKeysOfRange(
        newStart,
        newEnd,
        false
      )
    );

    const affectedDayKeys = new Set([
      ...oldDayKeys,
      ...newDayKeys,
    ]);

    const payload = {
      id,
      state: eventType,
      allDay: false,
      isAllDay: false,
      title: eventApi.title,
      content:
        eventApi.extendedProps?.note ||
        eventApi.extendedProps?.content ||
        "",
      start: newStart,
      end: newEnd,
    };

    try {
      /*
       * Salvesta kõigepealt backendis.
       * Nii ei jää FullCalendar valele ajale,
       * kui server annab vea.
       */
      await proStore.onEdit(id, payload);

      /* eventApi.setDates(newStart, newEnd, {
        allDay: false,
      }); */

      selectedEvent.value = {
        ...selectedEvent.value,
        start: newStart.toISOString(),
        end: newEnd.toISOString(),
        allDay: false,
      };

      await nextTick();

      affectedDayKeys.forEach(
        rebuildTypeBarForDay
      );

      editAvailabilityError.value = null;
      showEdit.value = false;
      showTimeEventModal.value = true;
    } catch (error) {
      editAvailabilityError.value = t(
        "calendar.availabilityErrorSaveFailed"
      );

      console.error(
        "Saadaoleva aja salvestamine ebaõnnestus:",
        error
      );
    }

    return;
  }

  console.warn(
    "Selle sündmuse tüüpi ei saa selle funktsiooniga muuta:",
    eventType
  );
};



const saveEventEdits__prev = async () => {
  const id = editingEventId.value;
  console.log("ID " + id)
  if (!id) return;

  const cal = calendarRef.value.getApi(); 
  const evApi = cal.getEventById(id);

  console.log("Eventapi ", evApi)
  
  if (!evApi) return;

  console.log("Old event - ", evApi.extendedProps.type);
  const prevState = evApi.extendedProps.type;

  const f = editForm.value;

  console.log("EFV ", f)

  // ---------- 1) capture OLD cells BEFORE editing ----------
  // If bar is only on the start day:
  const oldKeys = new Set([ startKeyOf(evApi.start) ]);

  // If bar spans ranges, replace the line above with:
  // const oldKeys = new Set(dayKeysOfRange(evApi.start, evApi.end, evApi.allDay));

  // ---------- 2) compute new dates ----------
  const newStart = fromLocalInput(f.start); // Date or null
  const newEnd   = fromLocalInput(f.end);   // Date or null

  console.log("New start - " + newStart + " New end - " + newEnd)


  const startForApi = isValidDate(newStart)
    ? newStart
    : evApi.start;

  const endForApi = isValidDate(newEnd)
    ? newEnd
    : evApi.end;

  if (!isValidDate(startForApi) || !isValidDate(endForApi)) {
    console.error("Algus või lõpp ei ole korrektne");
    return;
  }

  if (endForApi <= startForApi) {
    console.error("Teenuse lõpp peab olema algusest hilisem");
    return;
  }

  const becomesAllDay__ =
    !(isValidDate(newStart) && isValidDate(newEnd) &&
      (newStart.getHours() + newStart.getMinutes() + newEnd.getHours() + newEnd.getMinutes() !== 0));

  // ---------- 3) update FullCalendar event ----------
  evApi.setProp('title', (f.title || '').trim());
  evApi.setExtendedProp('location', f.location || '');
  evApi.setExtendedProp('note',     f.note || '');
  evApi.setAllDay(becomesAllDay); // keep allDay in sync
  evApi.setDates(startForApi, endForApi, { allDay: becomesAllDay });

  // ---------- 4) mirror your own array (keeps computed() in sync) ----------
  const startIso = isValidDate(startForApi) ? startForApi.toISOString() : null;
  const endIso   = isValidDate(endForApi)   ? endForApi.toISOString()   : null;

  const idx = createdEvents.value.findIndex(e => e.id === id);
  if (idx !== -1) {
    const old = createdEvents.value[idx];
    createdEvents.value = [
      ...createdEvents.value.slice(0, idx),
      {
        ...old,
        title: (f.title || '').trim(),
        start: startIso,
        end:   endIso,
        allDay: becomesAllDay,
        extendedProps: {
          ...(old.extendedProps || {}),
          location: f.location || '',
          note: f.note || '',
        },
      },
      ...createdEvents.value.slice(idx + 1),
    ];
  }

  // helpers
  const MS_DAY = 86400000;
  const ymdLocal_xx = d => {
    const z = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return z.toISOString().slice(0,10); // YYYY-MM-DD (local date turned UTC midnight)
  };

  

  // If your type bar should span all-days across the range (use this instead):
  const dayKeysOfRange = (start, end, allDay) => {
    const s = new Date(start);
    const e = end ? new Date(end) : new Date(start);
    if (allDay) e.setTime(e.getTime() - MS_DAY); // exclusive → inclusive
    s.setHours(0,0,0,0);
    e.setHours(0,0,0,0);

    const out = [];
    for (let cur = new Date(s); cur <= e; cur.setDate(cur.getDate() + 1)) {
      out.push(ymdLocal(cur));
    }
    return out;
  };

  // ---------- 5) capture NEW cells AFTER editing ----------
  const newKeys = new Set([ startKeyOf(startForApi) ]);
  // If spanning bars: const newKeys = new Set(dayKeysOfRange(startForApi, endForApi, becomesAllDay));

  // union of old+new → only rebuild what changed
  const affected = new Set([...oldKeys, ...newKeys]);

  // ---------- 6) wait for reactivity, then rebuild just those cells ----------
  await nextTick();
  affected.forEach(rebuildTypeBarForDay);

  const eventOnEdit = {
    id: id,
    state: prevState,
    isAllDay: newStart && newEnd ? false : true,
    title: f.title,
    content: f.note,
    start: newStart,
    end: newEnd
  } 

  // New timerangeEvent to db
  await proStore.onEdit(id, eventOnEdit);

  //console.log("PREV STATE - ", prevState);

  showEdit.value = false;
  if (prevState === 'vacation') {
    const updatedNoteEvent = {
      id,
      title: (f.title || '').trim(),
      content: f.note || '',
      note: f.note || '',
      start: startForApi,
      end: endForApi,
      location: f.location || '',
      state: prevState,
    };
    selectedEvent.value = {
      ...selectedEvent.value,
      ...updatedNoteEvent
    };
    showNotesEventModal.value = true;
  }
    
};











const handleEventDrop = async (info) => {
  const { event, oldEvent, revert } = info;

  const oldKeys = new Set(dayKeysOfRange(oldEvent.start, oldEvent.end, oldEvent.allDay));
  const newKeys = new Set(dayKeysOfRange(event.start, event.end, event.allDay));
  const affected = new Set([...oldKeys, ...newKeys]);

  // 1) Which cells were affected?
  //const oldKeys = new Set([ startKeyOf(oldEvent.start) ]);
  //const newKeys = new Set([ startKeyOf(event.start) ]);
  //const affected = new Set([...oldKeys, ...newKeys]);

  // 2) Send to backend (use ISO so backend is stable)
  const payload = {
    id: event.id,
    state: event.extendedProps?.type,
    allDay: event.allDay,
    title: event.title,
    content: event.extendedProps?.content ?? event.content, // depending on how you store it
    start: event.start?.toISOString(),
    end: event.end?.toISOString() ?? null,
  };

  try {
    await proStore.onEdit(event.id, payload);

    // Optional: mirror your local reactive array
    const idx = createdEvents.value.findIndex(e => e.id === event.id);
    if (idx !== -1) {
      const prev = createdEvents.value[idx];
      createdEvents.value = [
        ...createdEvents.value.slice(0, idx),
        {
          ...prev,
          title: event.title,
          start: payload.start,
          end:   payload.end,
          allDay: event.allDay,
          extendedProps: {
            ...(prev.extendedProps || {}),
            type: payload.state,
            content: payload.content,
          },
        },
        ...createdEvents.value.slice(idx + 1),
      ];
    }

    // 3) Rebuild only the cells that changed
    await nextTick();
    affected.forEach(rebuildTypeBarForDay);

  } catch (e) {
    console.error('Save failed, reverting drop', e);
    revert(); // put event back
  }
};

function isEventApi(x) {
  return x && typeof x === 'object' && typeof x.remove === 'function';
}


// 1) tiny guards
const isValidDate = (d) => d instanceof Date && !isNaN(+d);
const toIso = (d) => (isValidDate(d) ? d.toISOString() : null);

// 2) sanitize string→Date parsing (return null if bad)
function parseMaybeDate(v) {
  if (v instanceof Date) return isValidDate(v) ? v : null;
  if (typeof v === 'string') {
    const d = new Date(v);
    return isValidDate(d) ? d : null;
  }
  if (typeof v === 'number') {
    const d = new Date(v);
    return isValidDate(d) ? d : null;
  }
  return null;
}


function getType(ev) {
  return ev?.extendedProps?.type
      ?? ev?._def?.extendedProps?.type
      ?? null;
}

function getStart(ev) {
  return parseMaybeDate(ev?.start)
      ?? parseMaybeDate(ev?.startStr)
      ?? null;
}

function getEnd(ev) {
  return parseMaybeDate(ev?.end)
      ?? parseMaybeDate(ev?.endStr)
      ?? null;
}

function getAllDay(ev) {
  return typeof ev?.allDay === 'boolean'
    ? ev.allDay
    : !!ev?._def?.allDay;
}


function eventCoversDay(ev, key /* 'YYYY-MM-DD' */) {
  const start = getStart(ev);
  if (!start) return false;

  const end = getEnd(ev) ?? new Date(start);
  const allDay = getAllDay(ev);
  const last  = allDay ? new Date(end.getTime() - 86400000) : end;

  const cur = new Date(start);
  cur.setHours(0,0,0,0);
  last.setHours(0,0,0,0);

  while (cur <= last) {
    if (ymdLocal(cur) === key) return true;
    cur.setDate(cur.getDate() + 1);
  }
  return false;
}

function remainingTypesForDay(key) {
  const cal = calendarRef.value?.getApi?.();
  if (!cal) return { counts: {}, total: 0 };

  const list = cal.getEvents(); // should be EventApi[], but we stay defensive
  const counts = {};
  let total = 0;

  for (const ev of list) {
    if (!eventCoversDay(ev, key)) continue;
    const t = getType(ev);
    if (!t) continue;
    counts[t] = (counts[t] || 0) + 1;
    total++;
  }
  return { counts, total };
}

async function deleteFromPreview() {
  const id = selectedEvent.value?.id && String(selectedEvent.value.id);
  if (!id) return;

  const cal = calendarRef.value.getApi();
  const evApi = cal.getEventById(id);
  if (!evApi) return;

  const days = getEventDays(evApi);     // capture days BEFORE remove
  evApi.remove();

  // keep local store in sync if it came from createdEvents
  const idx = createdEvents.value.findIndex(e => String(e.id) === id);
  if (idx !== -1) {
    createdEvents.value = [
      ...createdEvents.value.slice(0, idx),
      ...createdEvents.value.slice(idx + 1)
    ];
  }

  // Deleting event from db
  await proStore.onDelete(id);

  await nextTick();
  days.forEach(rebuildTypeBarForDay);   // rebuild only affected cells

  showProEventModal.value = false;
  showTimeEventModal.value = false;
  showNotesEventModal.value = false;
}

async function deleteEvent() {
  const id = editingEventId.value && String(editingEventId.value);
  if (!id) return;

  const cal = calendarRef.value?.getApi?.();
  if (!cal) return;

  const evApi = cal.getEventById(id);
  if (!evApi) return;

  // days affected BEFORE removal
  const days = getEventDays(evApi);

  evApi.remove();
  createdEvents.value = createdEvents.value.filter(e => String(e.id) !== id);

  await nextTick();
  days.forEach(rebuildTypeBarForDay);

  showEdit.value = false;
  showProEventModal.value = false;
}



function rebuildTypeBarForDay(key) {
  const root = calendarRef.value?.$el;
  if (!root) return;
  const cell = root.querySelector(`.fc-daygrid-day[data-date="${key}"]`);
  if (!cell) return;

  const frame = cell.querySelector('.fc-daygrid-day-frame') || cell;
  frame.querySelector('.cell-type-bar')?.remove();

  const { counts, total } = remainingTypesForDay(key);
  if (!total) return; // nothing left that day

  const bar = document.createElement('div');
  bar.className = 'cell-type-bar';

  Object.entries(counts).forEach(([t, n]) => {
    const seg = document.createElement('span');
    seg.className = 'cell-type-segment';
    seg.style.backgroundColor = (EVENT_TYPES[t]?.color) || '#999';
    seg.style.flex = String(n);
    bar.appendChild(seg);
  });

  if (getComputedStyle(frame).position === 'static') frame.style.position = 'relative';
  frame.appendChild(bar);
}

function getEventDays(ev) {
  const days = []
  if (!ev?.start) return days
  const start = new Date(ev.start)
  const end = ev.end ? new Date(ev.end) : new Date(ev.start)
  const last = ev.allDay ? new Date(end.getTime() - 86400000) : end
  const cur = new Date(start)
  cur.setHours(0,0,0,0); last.setHours(0,0,0,0)

  while (cur <= last) {
    const key = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`
    days.push(key)
    cur.setDate(cur.getDate()+1)
  }
  return days
}



// Avatakse event modal
function openEventModalPreview(raw) {
  const ev = raw?.event ?? raw;

  const type = getType(ev);
  const start = getStart(ev);
  const allDay = getAllDay(ev);
  const givenEnd = getEnd(ev);

  console.log("TYPE -- ", type);

  // derive end only when start is valid
  const end = givenEnd
    ?? (isValidDate(start)
          ? new Date(start.getTime() + (allDay ? 86400000 : 1800000))
          : null);

  const location = ev?.extendedProps?.location
                ?? ev?._def?.extendedProps?.location
                ?? ev?.location
                ?? null;

  const note = ev?.extendedProps?.note
        ?? ev?._def?.extendedProps?.note
        ?? ev?.note
        ?? null;

  event_state.value = type || '';

  selectedEvent.value = {
    id: String(ev?.id ?? ev?._def?.publicId ?? ev?._instance?.instanceId ?? ''),
    title: ev?.title ?? ev?._def?.title ?? '',
    start: toIso(start),      // <-- SAFE
    end:   toIso(end),        // <-- SAFE
    otherId: ev?.extendedProps?.otherId,
    client: ev?.extendedProps?.client,
    address: ev?.extendedProps?.address,
    priceOffer: ev?.extendedProps?.priceOffer,
    budget: ev?.extendedProps?.budget || '',
    allDay,
    
    location,
    note,
  };

  switch (type) {
    case "pro":
      showProEventModal.value = true;
      break;
    case "time":
      showTimeEventModal.value = true;
      break;
    case "client":
      showClientEventModal.value = true;
      break;
    case "vacation":
      showNotesEventModal.value = true;
      break;
    default:
      showProEventModal.value = true; // fallback
  }

  /* if (type === "pro") {
    showEventModal.value = true;
  } else if (type === "time") {
    showTimeEventModal.value = true;
  } else {
    showClientEventModal.value = true;
  } */
    
}

const fcLocaleCode = computed(() => ({ fi:'fi', sv:'sv', et:'et', ru: 'ru', en:'en-gb' }[locale.value] ?? 'fi'))
const clickedDate = ref(null);

/* function onEventClick(info) {
  info.jsEvent.preventDefault()
  openEventModalPreview(info.event)
  
} */

const showDayEvents = ref(false)
const selectedDayEvents = ref([])


function handleEventClick(arg) {
  // arg is { event: EventApi, jsEvent, ... }
  arg.jsEvent?.preventDefault();

  console.log("ARG -- ", arg.event);
  
  openEventModalPreview(arg.event)
}

function refreshTypeBars() {
  const api = calendarRef.value?.getApi?.();
  if (!api) return;

  const cells = calendarRef.value.$el.querySelectorAll('.fc-daygrid-day');

  cells.forEach(cell => {
    const key = cell.getAttribute('data-date'); // local 'YYYY-MM-DD'
    const frame = cell.querySelector('.fc-daygrid-day-frame') || cell;

    // cleanup previous
    frame.querySelector('.cell-type-bar')?.remove();

    // Which types exist that day? (from your precomputed Set)
    const typeSet = typeBarByDate.value.get(key);
    if (!typeSet || typeSet.size === 0) return;

    const bar = document.createElement('div');
    bar.className = 'cell-type-bar';

    const counts = {};
    Array.from(typeSet).forEach(t => { counts[t] = 0; });

    const list = Array.isArray(filteredEvents.value) ? filteredEvents.value : [];
    for (const ev of list) {
      const t = ev?.extendedProps?.type;
      if (!t || !(t in counts)) continue;

      const start = new Date(ev.start);
      if (isNaN(+start)) continue;
      const end = ev.end ? new Date(ev.end) : new Date(start);
      if (isNaN(+end)) continue;

      // For allDay: exclusive end → count up to end-1 day
      const last = ev.allDay ? new Date(end.getTime() - 86400000) : end;

      // Walk days covered by this event and bump count if the day == key
      const cur = new Date(start);
      cur.setHours(0,0,0,0);
      last.setHours(0,0,0,0);

      while (cur <= last) {
        if (ymdLocal(cur) === key) counts[t] += 1;
        cur.setDate(cur.getDate() + 1);
      }
    }

    // Build segments with flex = count (wider if more events of that type)
    Object.entries(counts).forEach(([t, n]) => {
      if (!n) return;
      const seg = document.createElement('span');
      seg.className = 'cell-type-segment';
      seg.style.backgroundColor = (EVENT_TYPES[t]?.color) || '#999';
      seg.style.flex = String(n);   // 👈 weight by count
      bar.appendChild(seg);
    });
    // ---------- END REPLACEMENT ----------

    if (getComputedStyle(frame).position === 'static') frame.style.position = 'relative';
    frame.appendChild(bar);
  });
}

// If events arrive/change async, nudge a render so dayCellDidMount reruns:
watch(filteredEvents, async () => {
  await nextTick();
  const api = calendarRef.value?.getApi?.();
  refreshTypeBars();
  api && api.render();
});

const typeBarByDate = computed(() => {
  const map = new Map();
  const list = Array.isArray(filteredEvents.value) ? filteredEvents.value : [];
  if (isUserPro.value) {
    for (const ev of list) {
    const start = new Date(ev.start);
    if (isNaN(+start)) continue;

    // Determine end
    // if no end, treat as single-day (or single moment) event
    let end = ev.end ? new Date(ev.end) : new Date(start);
    if (isNaN(+end)) end = new Date(start);

    // For allDay events, FullCalendar uses exclusive end → make it inclusive by subtracting 1 day
    const last = ev.allDay ? new Date(end.getTime() - 86400000) : end;

    // Walk day by day (local) from start to last inclusive
    const cur = new Date(start);
    cur.setHours(0, 0, 0, 0);
    last.setHours(0, 0, 0, 0);

    const type = ev?.extendedProps?.type;
    if (!type) continue;

    while (cur <= last) {
      const key = ymdLocal(cur);
      if (!map.has(key)) map.set(key, new Set());
      map.get(key).add(type);
      
      cur.setDate(cur.getDate() + 1);
    }
  }
  }
  

  return map;
});


const handleEventResize = async (info) => {
  const event = info.event;

  
  console.log('📏 Event resized!');
  console.log('New start:', event.start);
  console.log('New end:', event.end);

  const evType = event.extendedProps.type;

  console.log("Resize type ", evType)

  const formatLocal = (d) =>
    d?.toLocaleString('fi-FI', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

  console.log(
    `Resized to: ${formatLocal(event.start)} → ${formatLocal(event.end)}`
  );

  console.log("Event id on drop - " + event.id);

  

  const allDayValue = event.start && event.end ? false : true


  // To backend
  const eventOnResize = {
    id: event.id,
    state: event.extendedProps.type,
    allDay: allDayValue,
    title: event.title,
    content: event.content,
    start: event.start,
    end: event.end
  }
  
  if (evType === 'time') {
    await proStore.onEdit(event.id, eventOnResize);
  }
  
  if (evType === 'pro') {
    console.log("Event type resize on pro ")
    await proStore.onEditOrderDuration(event.id, eventOnResize);
  }
  
}


const ymd = d => d.toISOString().slice(0, 10);


/* const handleEventDrop_previous = async (info) => {
  const event = info.event;

  console.log('📅 Event moved!');
  console.log('Title:', event.title);
  console.log('New start:', event.start);
  console.log('New end:', event.end);
  console.log('AllDay:', event.allDay);

  
  const formatLocal = (d) =>
    d?.toLocaleString('fi-FI', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

  console.log(
    `Moved to: ${formatLocal(event.start)} → ${formatLocal(event.end)}`
  );


  console.log("Event id on drop - " + event.id)

  
  const eventOnMove = {
    id: event.id,
    state: event.extendedProps.type,
    allDay: event.allDay,
    title: event.title,
    content: event.content,
    start: event.start,
    end: event.end
  }

  await proStore.onEdit(event.id, eventOnMove);

}
 */

// does an all-day event cover this date?
const allDayCovers = (ev, dateStr) => {
  if (!ev.allDay) return false;
  const s = new Date(ev.start);
  const e = ev.end ? new Date(ev.end) : new Date(s.getTime() + MS_DAY);
  // FullCalendar all-day end is exclusive → compare inclusive range
  const day = new Date(dateStr + 'T00:00:00');
  return s <= day && day < e;
};

// All all-day events
const countAllDayOn = (cal, dateStr) =>
  cal.getEvents().filter((ev) => allDayCovers(ev, dateStr)).length;

const ymdx = d => d.toISOString().slice(0, 10);

const MAX_ALLDAY_PER_DAY = 1;


const pad = n => String(n).padStart(2, '0');

/* const addDaysLocalStr = (yyyyMmDd, days) => {
  const [y,m,da] = yyyyMmDd.split('-').map(Number);
  const dt = new Date(y, m-1, da);
  dt.setDate(dt.getDate() + days);
  return ymdLocal(dt);
}; */

/* function createAllDayEvent(date) {
  const cal = calendarRef.value.getApi();
  const startStr = ymdLocal(date);

  if (countAllDayOn(cal, startStr) >= 1) {
      console.log("Is already all day event")
      alert('⚠️ Only one all-day event allowed on this day.');
      toast.warn('Only one all-day event per day');
    return;
  }

  cal.addEvent({
    title: 'New all-day',
    start: startStr,
    end: addDaysLocalStr(startStr, 1),
    allDay: true,
  });
} */

const options = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  height: window.innerWidth < 640 ? 600 : 800,
  
  //aspectRatio: 0.75,
  initialView: 'dayGridMonth',
  nowIndicator: true,
  datesSet() { refreshTypeBars() },
 

  dayMaxEvents: true,       // 👈 enables the "+n more" link
  dayMaxEventRows: 3,       // (optional) maximum rows to show per day
  moreLinkClick:  'popover', 
  aspectRatio: window.innerWidth < 640 ? 0.9 : 1,


  dayCellDidMount(info) {
    const d = new Date(info.date);
    d.setHours(0,0,0,0);

    const key = ymdLocal(info.date);

    const set = typeBarByDate.value.get(key);
    if (!set || set.size === 0) return;

   
    const frame =
      info.el.querySelector('.fc-daygrid-day-frame') ||
      info.el;

    if (!frame) {
      console.warn('[typebar] no frame for', key, info.el);
      return;
    }

    const style = frame.style;
    if (!style.position || style.position === 'static') {
      style.position = 'relative';
    }

    const old = frame.querySelector('.cell-type-bar');
    if (old) old.remove();

    const bar = document.createElement('div');
    bar.className = 'cell-type-bar';

    Array.from(set).forEach(t => {
      const seg = document.createElement('span');
      seg.className = 'cell-type-segment';
      seg.style.backgroundColor =
        (EVENT_TYPES[t] && EVENT_TYPES[t].color) || '#999';
      bar.appendChild(seg);
    });

    frame.appendChild(bar);
  },
  

  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },

  eventTimeFormat: { 
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  },


  events: filteredEvents.value,


  eventContent(arg) {
    const ev = arg.event;
    const start = ev.start;
    const end = ev.end;

    const formatTime = (d) =>
      d ? d.toLocaleTimeString(intlLocale.value, { hour: '2-digit', minute: '2-digit', hour12: false }) : '';

    const timeStr = ev.allDay
    ? t("calendar.allDay")
    : `${formatTime(start)}${
        end ? ` - ${formatTime(end)}` : ""
      }`;

    const timeStrOnlyStart = ev.allDay
    ? t("calendar.allDay")
    : `${formatTime(start)} ${t("calendar.agreement")}`;

    const isMobile = window.innerWidth < 640;
    let title = arg.event.title || '';

    if (isMobile && title.length > 10) {
      title = title.slice(0, 7) + '...';
    }

    const eventType = arg.event.extendedProps?.type;

    if (['client', 'pro'].includes(eventType)) {
      return { html: `<div class="event-time-only">${timeStrOnlyStart}</div>`};
    }
    if (['time'].includes(eventType)) {
      return { html: `<div class="event-time-only">${timeStr}</div>`}
    }

    return {
      html: `<div>${title}</div>`
    };
  },

  eventDurationEditable: (event) => {
    return event.extendedProps.canResize === true;
  },



  eventStartEditable: (event) => {
   
    return event.extendedProps.canEdit === true;
  },


  select(info) {
    console.log("Info - ", info)
    const viewType = info.view.type;

    if (!['timeGridWeek', 'timeGridDay'].includes(viewType)) {
      return;
    }
    if (info.start < new Date()) {
      return false;
    }
    console.log('Start (Date):', info.start);
    console.log('End (Date):', info.end);
    console.log('AllDay:', info.allDay);
    openCreate({ start: info.start, end: info.end, allDay: info.allDay }) //From here event creating in month view
  },


  locales: [fiLocale, svLocale, etLocale, enLocale, ruLocale],
  locale: fcLocaleCode.value,

  

  eventClassNames(arg) {
    const t = arg.event.extendedProps?.type
    return t && EVENT_TYPES[t]?.class ? [EVENT_TYPES[t].class] : []
  },
  
  displayEventTime: true,

  
  editable: false,
  //eventStartEditable: false,
  //eventDurationEditable: false,
  droppable: false,
  selectable: isUserPro.value,
  selectMirror: true,

  views: {
    dayGridMonth: {
      selectable: false,
      dateClick(info) {
        const cal = calendarRef.value?.getApi?.();
        if (!cal) return;

        const clickedDate = new Date(info.date);
        const today = new Date();

        // normalize both to midnight (IMPORTANT)
        clickedDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (clickedDate < today) {
           return false; // ❌ do nothing for past days
        }
        
        console.log("Date click")
        cal.changeView('timeGridDay', info.dateStr);
      }
    },

    timeGridWeek: {
      selectable: isUserPro.value
    },

    timeGridDay: {
      selectable: isUserPro.value
    }
  },


  selectAllow(selectInfo) {
    const cal = calendarRef.value?.getApi?.();
    if (!cal) return false;

    const viewType = cal.view.type;

    if (!['timeGridWeek', 'timeGridDay'].includes(viewType)) {
      return false;
    }

    if (selectInfo.start < new Date()) {
      return false;
    }

    const dateStr = selectInfo.startStr.slice(0, 10);
    return countAllDayOn(cal, dateStr) < 1;
  },

  eventAllow: (dropInfo, draggedEvent) => {
    
    if (draggedEvent.allDay !== dropInfo.allDay) return false;

    

   
    if (!dropInfo.allDay) return true;

    const cal = calendarRef.value?.getApi?.();
    if (!cal) return true;

    const targetDate = ymdLocal(dropInfo.start);
  
    const count = countAllDayOn(cal, targetDate, draggedEvent.id);

    return count < 1;
  },

  /* dateClick: (info) => {
    console.log("Date click...");
    
  }, */

  eventClick: handleEventClick,
  eventResize: handleEventResize,
  

  eventDrop: (info) => {
    if (info.event.allDay !== info.oldEvent.allDay) {
      info.revert();
      return;
    }

  handleEventDrop(info);

  }

}))
</script>

<style>

/* cell color bar */
/* ensure we can absolutely position inside the cell */
.fc .fc-daygrid-day-frame { position: relative !important; }

.cell-type-bar {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 4px;
  display: flex;
  overflow: hidden;
  border-radius: 2px 2px 0 0;
  z-index: 10;
  pointer-events: none;
}

.cell-type-segment {
  flex: 1;
  height: 100%;
}
.fc-header-toolbar.fc-toolbar.fc-toolbar-ltr {
  padding: 7px;
}
.fc-header-toolbar {
  color: red;
}
.fc-popover {
  max-width: 200px !important;   /* 👈 controls popover width */
  width: auto !important;
  border-radius: 8px !important;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  background-color: #1f2630;     /* dark theme example */
  color: #e6e6e6;
}

/* optional: header tweaks */
.fc-popover .fc-popover-header {
  font-size: 0.85rem;
  padding: 4px 8px;
  background: #151a20;
  border-bottom: 1px solid #2a2f3a;
}

/* make the event list smaller inside */
.fc-popover .fc-popover-body {
  padding: 6px;
  font-size: 0.8rem;
}

.fc-popover .fc-daygrid-event {
  margin: 2px 0;
  width: 175px;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.75rem;
  line-height: 1.2;
}

/* ensure it doesn’t stretch wider than viewport */
@media (max-width: 340px) {
  .fc-popover {
    max-width: 90vw !important;
  }
}


/* note */
.fc-event-note { font-size: .8rem; margin-top: 4px; }
.fc-event-note ul { margin: 0; padding-left: 1rem; }

.fc-day-past {
  background-color: #101320 !important;
  color: #999 !important;
  pointer-events: none; /* disable clicking */
}

/* highlight day cell when tapped */
.fc .fc-daygrid-day:active,
.fc .fc-timegrid-slot:active {
  background: #2a2f3a;       /* darker background while pressed */
  transform: scale(0.98);    /* little shrink for tactile feel */
  transition: background 0.2s, transform 0.1s;
}

/* .fc-col-header {
  background-color: #242931;
}
.fc .fc-col-header, .fc .fc-daygrid-day { border-color:#2a2f3a; }
.fc { background:#161a22; color:#e6e6e6; border-radius:8px; }
.fc .fc-day-today { background:#1e2530; } */



/* --- Minimal dark theme to match MDB dark --- */
.fc { background:#161a22; color:#e6e6e6; border-radius:8px; }
.fc .fc-daygrid-day { border: 1px solid #c76d6d;}
.fc .fc-toolbar-title { color:#e6e6e6; }
.fc .fc-button { background:#2a2f3a; border:none; }
.fc .fc-button:hover, .fc .fc-button:focus { filter: brightness(1.1); }
.fc .fc-col-header, .fc .fc-daygrid-day { border-color:#2a2f3a; }
.fc .fc-day-today { background:#1e2530; }
.fc a, .fc .fc-daygrid-day-number { color:#cbd5e1; }

/* allow wrapping */
.fc .fc-toolbar.fc-header-toolbar { display: flex; flex-wrap: wrap; row-gap: 8px; }

.fc-popover .fc-popover-body {
  background-color: #262c39;
}
.fc-popover .fc-popover-header {
  background-color: #161a22;
}

/* Neon cyan borders */
.fc-theme-standard td,
.fc-theme-standard th,
.fc-theme-standard .fc-timegrid-slot,
.fc-theme-standard .fc-timegrid-col-frame {
  border-color: rgba(73, 210, 255, 0.7) !important;
  box-shadow: 0 0 4px rgba(73, 210, 255, 0.6);
  border-color: rgba(14, 31, 36, 0.7) !important;
  box-shadow: 0 0 4px rgba(34, 72, 84, 0.6);
}

/* 1️⃣ Remove outer frame borders completely */
.fc-theme-standard .fc-scrollgrid,
.fc-theme-standard .fc-scrollgrid-section > * {
  border: none !important;
}

/* 2️⃣ Remove leftover top and right edge lines */
.fc-theme-standard .fc-scrollgrid thead tr th:first-child,
.fc-theme-standard .fc-scrollgrid tbody tr td:first-child {
  border-left: none !important;
}

.fc-theme-standard .fc-scrollgrid thead tr:first-child th,
.fc-theme-standard .fc-scrollgrid tbody tr:first-child td {
  border-top: none !important;
}

/* 3️⃣ Optional: soften inner grid lines but keep glow */
.fc-theme-standard td,
.fc-theme-standard th {
  border-color: rgba(34, 72, 84, 0.6) !important;
  box-shadow: 0 0 4px rgba(34, 72, 84, 0.6);
}

/* (optional) Keep visual consistency in dark mode */
.fc-theme-standard .fc-scrollgrid {
  box-shadow: none !important;
  background-color: transparent;
}

/* push title to its own line if needed */
@media (max-width: 640px) {
  .fc .fc-toolbar-chunk { display: flex; gap: 6px; }
  .fc .fc-toolbar-title { flex: 1 1 100%; order: 2; text-align: center; font-size: 1rem; }
  .fc .fc-toolbar-chunk:first-child { order: 1; }   /* prev/next */
  .fc .fc-toolbar-chunk:last-child  { order: 3; }   /* view buttons */
  .fc .fc-button { padding: 2px 8px; font-size: .75rem; }


  /* buttons */

  /* highlight day cell when tapped */
  .fc .fc-daygrid-day:active,
  .fc .fc-timegrid-slot:active {
    background: #2a2f3a;       /* darker background while pressed */
    transform: scale(0.98);    /* little shrink for tactile feel */
    transition: background 0.2s, transform 0.1s;
  }

  .fc .fc-daygrid-day:active::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.1);
    border-radius: inherit;
  }



  .fc .fc-button:active {
    filter: brightness(1.2);
    transform: scale(0.97);
  }
}

/* Keep anything inside the event box from spilling */
.fc .fc-daygrid-event {
  overflow: hidden;
}

/* remove the dot before events in dayGrid */
.fc .fc-daygrid-event-dot {
  display: none !important;
}

/* optional: pull text left a bit after removing the dot */
.fc .fc-daygrid-event {
  padding-left: 0 !important;
}

/* Ellipsis for long titles/time */
.fc .fc-daygrid-event .fc-event-title,
.fc .fc-daygrid-event .fc-event-time {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Color classes (use your dark palette) */
.fc-event.event-client  { background:#48769c; border:none; color:#fff; }
.fc-event.event-time   { background:#e29657; border:none; color:#fff; }
.fc-event.event-vacation { background:#c04b4bff; border:none; color:#fff; }
.fc-event.event-pro     { background:#097a5e; border:none; color:#fff; }

/* Make events compact on mobile */
@media (max-width: 640px) {
  .fc .fc-daygrid-event { font-size:.72rem; padding:0 2px; line-height:1.2; }
  .fc .fc-daygrid-day-frame { padding:2px; }
}

/* Slightly tighter padding helps on small screens */
/* @media (max-width: 640px) {
  .fc .fc-daygrid-event { padding: 0 2px; }
  .fc .fc-daygrid-day {
    height: 58px !important;
  }
  .fc .fc-daygrid-day-frame {
    min-height: 43px !important;
    padding: 3px;
  }
  .fc .fc-daygrid-day-events {
    min-height: 18px;
  }

  .fc .fc-daygrid-event {
    font-size: 0.72rem;
    line-height: 1.2;
  }
} */


/* @media (max-width: 640px) {
  .fc .fc-daygrid-day {
    height: 58px !important;
  }

  .fc .fc-daygrid-day-frame {
    min-height: 58px !important;
  }
}
 */

 @media (max-width: 640px) {
  .fc .fc-daygrid-day-frame {
    min-height: 80px !important;
  }

  .fc .fc-daygrid-day-events {
    min-height: 40px !important;
  }

  .fc .fc-daygrid-event-harness .fc-daygrid-event {
    width: 100%;
  }

  /* .fc .fc-event-main {
    overflow: hidden;
  }

  .fc .fc-event-title {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } */
}

/* Modal for event details */
.event-modal-body {
  color: #e5e7eb;
}

.event-date {
  font-size: 14px;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 12px;
}

.event-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 6px;
}

.event-subtitle {
  color: #cbd5e1;
  margin-bottom: 18px;
}

.event-card {
  background: #111827;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 16px;
  
  /* margin-top: 14px; */
}

.event-card h4 {
  margin-bottom: 14px;
  font-size: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.info-row:last-child {
  border-bottom: 0;
}

.info-row span {
  color: #94a3b8;
}

.info-row strong {
  text-align: right;
  color: #f8fafc;
}

.status-waiting {
  color: #fbbf24;
}

.event-note {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(251,191,36,0.12);
  color: #fde68a;
}

.event-chat {
  margin-top: 10px;
  cursor: pointer;
}

.footer-buttons {
  display: flex;
  gap: 12px; /* horizontal space between buttons */
}
/* .event-chat :hoover{
  background-color: red;
} */




/* Creating event css */
.create-entry-modal__header {
  border-bottom: 1px solid rgba(72, 118, 156, 0.14);
}

.create-entry-modal__header--availability {
  background: linear-gradient(
    135deg,
    rgba(47, 143, 101, 0.1),
    rgba(72, 118, 156, 0.04)
  );
}

.create-entry-modal__header--note {
  background: linear-gradient(
    135deg,
    rgba(221, 164, 63, 0.1),
    rgba(72, 118, 156, 0.03)
  );
}

.create-entry-modal__title {
  display: flex;
  align-items: center;
  gap: 11px;
  color: #324957;
  font-size: 1.08rem;
  font-weight: 700;
}

.create-entry-modal__title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

.create-entry-modal__title-icon--availability {
  background: rgba(47, 143, 101, 0.14);
  color: #2b825e;
}

.create-entry-modal__title-icon--note {
  background: rgba(221, 164, 63, 0.15);
  color: #b87812;
}

.create-entry-modal__body {
  padding: 22px;
}

.create-entry-modal__description {
  margin: 0 0 17px;
  color: #687985;
  font-size: 0.88rem;
  line-height: 1.55;
}

.create-entry-modal__type {
  margin-bottom: 18px;
}

.create-entry-info {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 13px 14px;
  margin-bottom: 15px;
  border-radius: 10px;
}

.create-entry-info--availability {
  border: 1px solid rgba(47, 143, 101, 0.15);
  background: rgba(47, 143, 101, 0.06);
}

.create-entry-info--note {
  border: 1px solid rgba(221, 164, 63, 0.17);
  background: rgba(221, 164, 63, 0.07);
}

.create-entry-info__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: rgba(72, 118, 156, 0.1);
  color: #48769c;
}

.create-entry-info > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.create-entry-info strong {
  color: #304f45;
  font-size: 0.85rem;
}

.create-entry-info span {
  color: #687985;
  font-size: 0.77rem;
  line-height: 1.4;
}

.create-entry-time-card {
  padding: 16px;
  border: 1px solid rgba(72, 118, 156, 0.14);
  border-radius: 12px;
  background: #f8fafc;
}

.create-entry-time-card__item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.create-entry-time-card__item > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.create-entry-time-card__item span {
  color: #798994;
  font-size: 0.75rem;
  font-weight: 600;
}

.create-entry-time-card__item strong {
  color: #304653;
  font-size: 0.9rem;
}

.create-entry-time-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: rgba(47, 143, 101, 0.12);
  color: #2f8f65;
  font-size: 0.7rem;
}

.create-entry-time-card__icon--end {
  background: rgba(72, 118, 156, 0.12);
  color: #48769c;
}

.create-entry-time-card__line {
  display: flex;
  width: 34px;
  height: 24px;
  justify-content: center;
}

.create-entry-time-card__line span {
  width: 1px;
  height: 100%;
  background: rgba(72, 118, 156, 0.23);
}

.create-entry-duration {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px;
  margin-top: 12px;
  border-left: 4px solid #2f8f65;
  border-radius: 8px;
  background: rgba(47, 143, 101, 0.06);
}

.create-entry-duration > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.create-entry-duration span {
  color: #71827a;
  font-size: 0.74rem;
  font-weight: 600;
}

.create-entry-duration strong {
  color: #276849;
  font-size: 1rem;
}

.create-entry-duration > i {
  color: rgba(47, 143, 101, 0.7);
  font-size: 1.25rem;
}

.create-note__date {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  margin-bottom: 18px;
  border: 1px solid rgba(72, 118, 156, 0.14);
  border-radius: 10px;
  background: #f8fafc;
}

.create-note__date-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 35px;
  width: 35px;
  height: 35px;
  border-radius: 9px;
  background: rgba(72, 118, 156, 0.11);
  color: #48769c;
}

.create-note__date > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.create-note__date span {
  color: #7a8994;
  font-size: 0.74rem;
  font-weight: 600;
}

.create-note__date strong {
  color: #304552;
  font-size: 0.9rem;
}

.create-entry-modal__error {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-top: 12px;
  color: #b63846;
  font-size: 0.8rem;
  line-height: 1.4;
}

.create-entry-modal__footer {
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid rgba(72, 118, 156, 0.12);
}

@media (max-width: 576px) {
  .create-entry-modal__body {
    padding: 18px;
  }

  .create-entry-modal__footer {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .create-entry-modal__footer .btn {
    width: 100%;
    margin: 0;
  }
}


/* Notes event */
.note-modal__header {
  border-bottom: 1px solid rgba(94, 104, 116, 0.14);
  background: linear-gradient(
    135deg,
    rgba(94, 104, 116, 0.08),
    rgba(72, 118, 156, 0.04)
  );
}

.note-modal__title {
  display: flex;
  align-items: center;
  gap: 11px;
  color: #344653;
  font-size: 1.08rem;
  font-weight: 700;
}

.note-modal__title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(221, 164, 63, 0.14);
  color: #bb7b12;
}

.note-modal__body {
  padding: 22px;
}

.note-modal__heading {
  margin-bottom: 16px;
}

.note-modal__heading-label {
  display: block;
  margin-bottom: 4px;
  color: #7b8993;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.note-modal__heading h2 {
  margin: 0;
  color: #304552;
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.35;
}

.note-date-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 15px;
  margin-bottom: 14px;
  border: 1px solid rgba(72, 118, 156, 0.14);
  border-radius: 11px;
  background: #f8fafc;
}

.note-date-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: rgba(72, 118, 156, 0.11);
  color: #48769c;
}

.note-date-card__content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
}

.note-date-card__content span {
  color: #7a8994;
  font-size: 0.75rem;
  font-weight: 600;
}

.note-date-card__content strong {
  color: #304552;
  font-size: 0.92rem;
  line-height: 1.4;
}

.note-content-card {
  overflow: hidden;
  border: 1px solid rgba(221, 164, 63, 0.2);
  border-radius: 12px;
  background: rgba(255, 249, 235, 0.72);
}

.note-content-card__header {
  padding: 11px 14px;
  border-bottom: 1px solid rgba(221, 164, 63, 0.17);
  background: rgba(221, 164, 63, 0.08);
}

.note-content-card__header span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #8b671f;
  font-size: 0.8rem;
  font-weight: 700;
}

.note-content-card__text {
  margin: 0;
  padding: 16px;
  color: #46535c;
  font-size: 0.92rem;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.note-private-info {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 11px 13px;
  margin-top: 14px;
  border-radius: 8px;
  background: rgba(94, 104, 116, 0.06);
  color: #6d7b84;
  font-size: 0.78rem;
  line-height: 1.45;
}

.note-private-info i {
  margin-top: 2px;
  color: #74818a;
}

.note-modal__footer {
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid rgba(94, 104, 116, 0.12);
}

@media (max-width: 576px) {
  .note-modal__body {
    padding: 18px;
  }

  .note-modal__heading h2 {
    font-size: 1.08rem;
  }

  .note-content-card__text {
    padding: 14px;
  }

  .note-modal__footer {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .note-modal__footer .btn {
    width: 100%;
    margin: 0;
  }
}


/* Time event modal */
.availability-modal__header {
  border-bottom: 1px solid rgba(47, 143, 101, 0.14);
  background: linear-gradient(
    135deg,
    rgba(47, 143, 101, 0.08),
    rgba(72, 118, 156, 0.04)
  );
}

.availability-modal__title {
  display: flex;
  align-items: center;
  gap: 11px;
  color: #2f4d43;
  font-size: 1.08rem;
  font-weight: 700;
}

.availability-modal__title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(47, 143, 101, 0.13);
  color: #287d59;
}

.availability-modal__body {
  padding: 22px;
}

.availability-modal__date-heading {
  margin-bottom: 13px;
  color: #667984;
  font-size: 0.88rem;
  font-weight: 600;
}

.availability-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 16px;
  margin-bottom: 13px;
  border: 1px solid rgba(47, 143, 101, 0.18);
  border-radius: 12px;
  background: rgba(47, 143, 101, 0.07);
}

.availability-status__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #2f8f65;
  color: #fff;
  font-size: 0.85rem;
}

.availability-status__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
}

.availability-status__label {
  color: #71827a;
  font-size: 0.73rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.availability-status__content strong {
  color: #255f49;
  font-size: 1rem;
}

.availability-status__badge {
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(72, 118, 156, 0.1);
  color: #48769c;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
}

.availability-modal__description {
  margin: 0 0 18px;
  color: #697985;
  font-size: 0.86rem;
  line-height: 1.55;
}

.availability-schedule {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 16px;
  border: 1px solid rgba(72, 118, 156, 0.14);
  border-radius: 12px;
  background: #f8fafc;
}

.availability-schedule__item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.availability-schedule__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: rgba(47, 143, 101, 0.12);
  color: #2f8f65;
  font-size: 0.7rem;
}

.availability-schedule__icon--end {
  background: rgba(72, 118, 156, 0.12);
  color: #48769c;
}

.availability-schedule__content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
}

.availability-schedule__content span {
  color: #798994;
  font-size: 0.75rem;
  font-weight: 600;
}

.availability-schedule__content strong {
  color: #304653;
  font-size: 0.9rem;
  line-height: 1.35;
}

.availability-schedule__line {
  display: flex;
  width: 34px;
  height: 24px;
  justify-content: center;
}

.availability-schedule__line span {
  width: 1px;
  height: 100%;
  background: rgba(72, 118, 156, 0.24);
}

.availability-all-day {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid rgba(47, 143, 101, 0.16);
  border-radius: 12px;
  background: #f8faf9;
}

.availability-all-day__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(239, 174, 39, 0.14);
  color: #d28b12;
  font-size: 1rem;
}

.availability-all-day > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.availability-all-day span {
  color: #798994;
  font-size: 0.75rem;
  font-weight: 600;
}

.availability-all-day strong {
  color: #304653;
  font-size: 0.95rem;
}

.availability-duration {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 15px;
  margin-top: 12px;
  border-left: 4px solid #2f8f65;
  border-radius: 8px;
  background: rgba(47, 143, 101, 0.06);
}

.availability-duration > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.availability-duration span {
  color: #71827a;
  font-size: 0.75rem;
  font-weight: 600;
}

.availability-duration strong {
  color: #276849;
  font-size: 1rem;
}

.availability-duration > i {
  color: rgba(47, 143, 101, 0.7);
  font-size: 1.25rem;
}

.availability-visibility-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 11px 13px;
  margin-top: 15px;
  border-radius: 8px;
  background: rgba(72, 118, 156, 0.07);
  color: #647884;
  font-size: 0.78rem;
  line-height: 1.45;
}

.availability-visibility-note i {
  margin-top: 2px;
  color: #48769c;
}

.availability-modal__footer {
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid rgba(72, 118, 156, 0.12);
}

@media (max-width: 576px) {
  .availability-modal__body {
    padding: 18px;
  }

  .availability-status {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .availability-status__badge {
    margin-left: 48px;
  }

  .availability-modal__footer {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .availability-modal__footer .btn {
    width: 100%;
    margin: 0;
  }
}


/* Time event and notes event edit modal */
.calendar-edit-modal__header {
  border-bottom: 1px solid rgba(72, 118, 156, 0.14);
}

.calendar-edit-modal__header--note {
  background: linear-gradient(
    135deg,
    rgba(221, 164, 63, 0.09),
    rgba(72, 118, 156, 0.03)
  );
}

.calendar-edit-modal__header--availability {
  background: linear-gradient(
    135deg,
    rgba(47, 143, 101, 0.1),
    rgba(72, 118, 156, 0.04)
  );
}

.calendar-edit-modal__title {
  display: flex;
  align-items: center;
  gap: 11px;
  color: #324957;
  font-size: 1.08rem;
  font-weight: 700;
}

.calendar-edit-modal__title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

.calendar-edit-modal__title-icon--note {
  background: rgba(221, 164, 63, 0.15);
  color: #b87812;
}

.calendar-edit-modal__title-icon--availability {
  background: rgba(47, 143, 101, 0.14);
  color: #2b825e;
}

.calendar-edit-modal__body {
  padding: 22px;
}

.calendar-edit-modal__description {
  margin: 0 0 17px;
  color: #687985;
  font-size: 0.88rem;
  line-height: 1.55;
}

/* Märkme vorm */

.note-edit-form__private-info {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 11px 13px;
  margin-bottom: 15px;
  border-radius: 8px;
  background: rgba(94, 104, 116, 0.06);
  color: #6d7b84;
  font-size: 0.78rem;
  line-height: 1.45;
}

.note-edit-form__private-info i {
  margin-top: 2px;
  color: #74818a;
}

.note-edit-form__date {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  margin-bottom: 18px;
  border: 1px solid rgba(72, 118, 156, 0.14);
  border-radius: 10px;
  background: #f8fafc;
}

.note-edit-form__date-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 35px;
  width: 35px;
  height: 35px;
  border-radius: 9px;
  background: rgba(72, 118, 156, 0.11);
  color: #48769c;
}

.note-edit-form__date > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.note-edit-form__date span {
  color: #7a8994;
  font-size: 0.74rem;
  font-weight: 600;
}

.note-edit-form__date strong {
  color: #304552;
  font-size: 0.9rem;
}

/* Saadaoleva aja vorm */

.availability-edit-form__visibility {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 13px 14px;
  margin-bottom: 15px;
  border: 1px solid rgba(47, 143, 101, 0.15);
  border-radius: 10px;
  background: rgba(47, 143, 101, 0.06);
}

.availability-edit-form__visibility-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: rgba(47, 143, 101, 0.13);
  color: #2f8f65;
}

.availability-edit-form__visibility > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.availability-edit-form__visibility strong {
  color: #28684d;
  font-size: 0.85rem;
}

.availability-edit-form__visibility span {
  color: #687b72;
  font-size: 0.77rem;
  line-height: 1.4;
}

.availability-edit-form__summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 13px;
  padding: 15px;
  margin-bottom: 12px;
  border: 1px solid rgba(72, 118, 156, 0.14);
  border-radius: 11px;
  background: #f8fafc;
}

.availability-edit-form__summary > i {
  color: #95a3ac;
  font-size: 0.82rem;
}

.availability-edit-form__summary-item {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
}

.availability-edit-form__summary-item span {
  color: #798994;
  font-size: 0.74rem;
  font-weight: 600;
}

.availability-edit-form__summary-item strong {
  color: #304653;
  font-size: 0.87rem;
  line-height: 1.4;
}

.availability-edit-form__duration {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 15px;
  margin-bottom: 20px;
  border-left: 4px solid #2f8f65;
  border-radius: 8px;
  background: rgba(47, 143, 101, 0.06);
}

.availability-edit-form__duration > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.availability-edit-form__duration span {
  color: #71827a;
  font-size: 0.74rem;
  font-weight: 600;
}

.availability-edit-form__duration strong {
  color: #276849;
  font-size: 1rem;
}

.availability-edit-form__duration > i {
  color: rgba(47, 143, 101, 0.7);
  font-size: 1.25rem;
}

.availability-edit-form__fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.availability-edit-form__field {
  min-width: 0;
}

.availability-edit-form__label {
  display: block;
  margin-bottom: 7px;
  color: #344b5d;
  font-size: 0.82rem;
  font-weight: 700;
}

.calendar-edit-modal__error {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-top: 11px;
  color: #b63846;
  font-size: 0.8rem;
  line-height: 1.4;
}

.calendar-edit-modal__error i {
  margin-top: 2px;
}

.calendar-edit-modal__footer {
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid rgba(72, 118, 156, 0.12);
}

@media (max-width: 576px) {
  .calendar-edit-modal__body {
    padding: 18px;
  }

  .availability-edit-form__summary {
    grid-template-columns: 1fr;
  }

  .availability-edit-form__summary > i {
    display: none;
  }

  .availability-edit-form__fields {
    grid-template-columns: 1fr;
  }

  .calendar-edit-modal__footer {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .calendar-edit-modal__footer .btn {
    width: 100%;
    margin: 0;
  }
}

 /* Provider order event modal */
 .event-schedule {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(72, 118, 156, 0.18);
  border-radius: 12px;
  background: rgba(72, 118, 156, 0.06);
}

.schedule-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.schedule-item span {
  font-size: 0.78rem;
  color: #6c757d;
}

.schedule-item strong {
  font-size: 0.95rem;
  color: #4f667a;
}

.schedule-divider {
  color: #8495a5;
}

.work-time-value {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}

.duration-edit-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border: 1px solid #ef8627;
  border-radius: 7px;
  background: transparent;
  color: #cf6e17;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.duration-edit-button:hover {
  background: #ef8627;
  color: #fff !important;
}

@media (max-width: 576px) {
  .event-schedule {
    grid-template-columns: 1fr;
  }

  .schedule-divider {
    display: none;
  }

  .work-time-value {
    align-items: flex-end;
    flex-direction: column;
  }
}

/* Deskdop duration display detail and mobile */

.desktop-label {
  display: inline;
}

.mobile-label {
  display: none;
}

@media (max-width: 576px) {
  .desktop-label {
    display: none;
  }

  .mobile-label {
    display: inline;
  }
}

/* Order duration edit */
.duration-modal__header {
  border-bottom: 1px solid rgba(72, 118, 156, 0.14);
}

.duration-modal__title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #31485b;
  font-size: 1.1rem;
  font-weight: 700;
}

.duration-modal__title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(239, 134, 39, 0.12);
  color: #df781d;
}

.duration-modal__body {
  padding: 22px;
}

.duration-modal__description {
  margin-bottom: 18px;
  color: #667684;
  font-size: 0.92rem;
  line-height: 1.55;
}

.duration-summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  padding: 16px;
  margin-bottom: 14px;
  border: 1px solid rgba(72, 118, 156, 0.16);
  border-radius: 12px;
  background: #f8fafc;
}

.duration-summary__item {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.duration-summary__icon {
  display: flex;
  flex: 0 0 35px;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border-radius: 9px;
  background: rgba(72, 118, 156, 0.12);
  color: #48769c;
}

.duration-summary__icon--end {
  background: rgba(239, 134, 39, 0.12);
  color: #df781d;
}

.duration-summary__content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
}

.duration-summary__content span {
  color: #788792;
  font-size: 0.75rem;
  font-weight: 600;
}

.duration-summary__content strong {
  color: #2f4353;
  font-size: 0.88rem;
  line-height: 1.35;
}

.duration-summary__arrow {
  color: #9ba8b1;
  font-size: 0.85rem;
}

.duration-current {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 16px;
  margin-bottom: 22px;
  border-left: 4px solid #ef8627;
  border-radius: 8px;
  background: rgba(239, 134, 39, 0.07);
}

.duration-current > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.duration-current__label {
  color: #7b6a5b;
  font-size: 0.77rem;
  font-weight: 600;
}

.duration-current__value {
  color: #bd6010;
  font-size: 1.05rem;
}

.duration-current__icon {
  color: rgba(223, 120, 29, 0.65);
  font-size: 1.35rem;
}

.duration-picker-section {
  padding-top: 2px;
}

.duration-picker-section__label {
  display: block;
  margin-bottom: 4px;
  color: #344b5d;
  font-size: 0.9rem;
  font-weight: 700;
}

.duration-picker-section__hint {
  margin-bottom: 13px;
  color: #788792;
  font-size: 0.79rem;
  line-height: 1.4;
}

.field__error {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-top: 8px;
  color: #b63846;
  font-size: 0.8rem;
  line-height: 1.4;
}

.field__error i {
  margin-top: 2px;
}

.duration-modal__footer {
  padding-top: 14px;
  border-top: 1px solid rgba(72, 118, 156, 0.12);
}

@media (max-width: 576px) {
  .duration-modal__body {
    padding: 18px;
  }

  .duration-summary {
    grid-template-columns: 1fr;
  }

  .duration-summary__arrow {
    display: none;
  }

  .duration-summary__item {
    align-items: flex-start;
  }

  .duration-current {
    margin-bottom: 18px;
  }

  .duration-modal__footer {
    display: grid;
    grid-template-columns: 1fr;
    gap: 9px;
  }

  .duration-modal__footer .btn {
    width: 100%;
    margin: 0;
  }
}
</style>