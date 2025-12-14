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

    const handleNotifications = async (id) => {
        isNotesLoading.value = true;
        userId.value = id;
        console.log("USER ID " + id);
        try {
            const notes = await noteService.getUserNotifications(id);
            const notesList = notes ? notes : [];
            notifications.value = notesList;
        } catch (err) {
            console.log("Error: " + err.message);
        } finally {
            isNotesLoading.value = false;
        }
    }
    //bookingId, provider.value.pName, header, noteContent, addressaat
    // Client rejects own booking - notification to pro
    const addNotification = async (booking_id, author, header, text, receiver) => {
        const newNote = await noteService.createMessage(receiver, {
            bookingId: booking_id,
            isNewMsg: true,
            isLink: false,
            title: header,
            content: text,
            reason: '',
            sender: author,
        });
        if (newNote) {
            socket.emit("del client map booking", booking_id, receiver, newNote);
            
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
    const localConfirmDealNotification = async (booking_id, proId, clientId, notes) => {
        const clientSide = await noteService.createMessage(clientId, notes.cNote);
        //const proSide = await noteService.createMessage(proId, notes.pNote);
        if (!clientSide) return;
        //notes.pNote = proSide;
        notes.cNote = clientSide;

        socket.emit('on-confirmed-deal-notification', booking_id, proId, clientId, notes);

        //localStateAddNotification(notes.pNote);
    } 

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
        //const confirmNote = await noteService.createMessage()
    }
    const upsertNotificationStatus = async () => {
        for (const note of notifications.value) {
            if (note.isNewMsg) {
                await noteService.editMessage(note.id, {isNewMsg: false});
                note.isNewMsg = false;
            }
        }

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
        localConfirmDealNotification,
        localStateAddNotification,
        upsertNotificationStatus,
        removeNotification,
        clientPublicBookingDelNotification,
        clientConfirmDealNotification,
        userId,
        notifications,
        notesCount,
        newNotesCount
    }
})