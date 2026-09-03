import { defineStore } from "pinia";
import { ref, computed } from 'vue';
import userService from '../service/users';
import noteService from '../service/notifications';
import socket from '@/socket';
import { useRouter } from 'vue-router';

export const useNotificationStore = defineStore('notifications', () => {
    const userId = ref(null);
    const notifications = ref([]);
    const router = useRouter();
    const isNotesLoading = ref(false);
    const notesCount = computed(() => notifications.value?.length);
    //const newNotes = computed(() => notifications.value.filter(note => note.isNewMsg) || []);
    const newNotesCount = computed(() => notifications.value.filter(note => note.isNewMsg).length)

    const isNotificationsLoaded = ref(false);

    const handleNotifications = async (id) => {
        isNotesLoading.value = true;
        userId.value = id;
        console.log("USER ID " + id);
        try {
            const notes = await noteService.getUserNotifications(id);
            const notesList = notes ? notes : [];
            notifications.value = notesList;

            isNotificationsLoaded.value = true;

        } catch (err) {
            console.log("Error: " + err.message);
        } finally {
            isNotesLoading.value = false;
        }
    }
    
    // Need to redone, adding notification only
    const addNotification = async (booking_id, author, reasonText,  text, receiver) => {
        const newNote = await noteService.createMessage(receiver, {
            bookingId: booking_id,
            isNewMsg: true,
            isLink: false,
            title: "Tiedot",
            content: text,
            reason: reasonText,
            sender: author,
        });

        console.log("CREATED MESSAGE --- ", newNote);

        //await notificationStore.addNotification(booking.id, sender, noteText, addressaat);
        if (newNote) {
            console.log("SEND NEW MESSAGE");
            console.log("DELETE BOOKING EMIT", {
                booking_id,
                receiver,
                newNote
            });
            
            socket.emit("pro-del-map-booking", booking_id, receiver, newNote);
        }

        
    }

    const onProRejectClientMapOrderNote = async (booking_id, author, header, text, receiver) => {
        const proNote = await noteService.createMessage(receiver, {
            bookingId: booking_id,
            isNewMsg: true,
            isLink: false,
            title: header,
            content: text,
            reason: '',
            sender: author,
        });
        if (proNote) {
            socket.emit('pro del client map order notification', booking_id, receiver, proNote);
        }
    }
    // Pro orders, pro confirms client deal
    /* const localConfirmDealNotification = async (booking_id, proId, clientId, notes) => {
        const clientSide = await noteService.createMessage(clientId, notes.cNote);
        
        if (!clientSide) return;
        //notes.pNote = proSide;
        notes.cNote = clientSide;

        socket.emit('on-confirmed-deal-notification', booking_id, proId, clientId, notes);

    }  */

    const clientConfirmDealNotification = async (bookingId, receiver, note) => {
        // --Tegemisel--
        const dealNotification = await noteService.createMessage(receiver, note);
        if (!dealNotification) return;
        note.id = dealNotification.id;
        socket.emit('on-client-confirmed-deal-motification', receiver, bookingId, note);
    }

    const clientPublicBookingDelNotification = async (receiver, bookingId, note) => {
        // Notificatio to providers who had done offer
        socket.emit('on-client-del-public-booking-notification', receiver, bookingId, note);
    }

    const localStateAddNotification = async (newNote) => {
        notifications.value = [
            ...notifications.value,
            newNote
        ];
    }

    const notificationUp = async(userId, note) => {
        
        console.log("NOTE IN STORE-- ", note);

        const addNote = await noteService.createMessage(userId, note);

        if (!addNote) return false;

        return true;
    }


    const upsertNotificationStatus = async () => {
        for (const note of notifications.value) {
            if (note.isNewMsg) {
                await noteService.editMessage(note.id, {isNewMsg: false});
                note.isNewMsg = false;
            }
        }

    }

    const setLocalNote = (note) => {
        notifications.value.push(note);
    }


    const removeNotification = async(noteId) => {
        await noteService.removeSelectedMessage(noteId);
        const upsertedList = notifications.value.filter(note => note.id !== noteId);
        notifications.value = upsertedList;
        if (!notifications.value.length) router.push('/');
    }
    
    return {
        handleNotifications,
        addNotification,
        onProRejectClientMapOrderNote,
        //localConfirmDealNotification,
        localStateAddNotification,
        upsertNotificationStatus,
        setLocalNote,
        removeNotification,
        clientPublicBookingDelNotification,
        clientConfirmDealNotification,
        notificationUp,
        userId,
        notifications,
        isNotificationsLoaded,
        notesCount,
        newNotesCount
    }
})