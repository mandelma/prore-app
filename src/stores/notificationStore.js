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
    const addNotification = async (booking, reason, receiver) => {
        const newNote = await noteService.createMessage(receiver, {
            bookingId: booking.id,
            isNewMsg: true,
            isLink: false,
            content: `${booking.user.username} peruutti tilauksen "${booking.header}". Syyksi ilmoitettu: ${reason}!`,
            reason: reason,
            sender: booking.user.username,
        });
        if (newNote) {
            socket.emit("del client map booking", booking.id, receiver, newNote);
            
        }
    }

    const localStateAddNotification = async (newNote) => {
        notifications.value = [
            ...notifications.value,
            newNote
        ];
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
        localStateAddNotification,
        upsertNotificationStatus,
        removeNotification,
        userId,
        notifications,
        notesCount,
        newNotesCount
    }
})