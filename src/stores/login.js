import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import loginService from '@/service/login'

export const useLoginStore = defineStore('login', () => {
    // --state--
    const user = ref(null);
    const token = ref(null);

    // --getters--
    const isAuthenticated = computed(() => !!user.value )

    // --actions--
    const onLogin = (payload) => {
        user.value = payload;
        //token.value = payload.token ?? null;
        localStorage.setItem('loggedAppUser', JSON.stringify(payload));
    }
    const onLogOut = () => {
        user.value = null
        //token.value = null
        localStorage.removeItem('loggedAppUser')
    }
    const hydrate = async () => {

        const raw = localStorage.getItem('loggedAppUser');
        if (raw) {
            const appUser = JSON.parse(raw);
            const tokenValid = await loginService.verifyToken(appUser.token);
            if (tokenValid.result === "token expired") {
                localStorage.removeItem('loggedAppUser');
                user.value = null;
            } else {
                user.value = appUser;
            }
        } else {
            console.log("User is not logged in!");
            user.value = null;
        }
        // try {
        //     user.value = JSON.parse(raw)
        // } catch (_) {
        //     console.log("Error: not found user.")
        //     // ignore bad JSON
        // }
    }
    return { user, token, isAuthenticated, onLogin, onLogOut, hydrate }
})