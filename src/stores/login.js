import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import loginService from '@/service/login'
import { useRoute, useRouter } from 'vue-router'
import { jwtDecode } from "jwt-decode"; // npm install jwt-decode

export const useLoginStore = defineStore('login', () => {
    // --state--
    const user = ref(null);
    const token = ref(null);
    const route = useRoute();
    const router = useRouter();

    // --getters--
    const isAuthenticated = computed(() => !!user.value )

    // --actions--
    const onLogin = (payload) => {
        user.value = payload;
        token.value = payload.token ?? null;
        localStorage.setItem('loggedAppUser', JSON.stringify(payload));
        if(route.query.redirect) {
            router.push(route.query.redirect)
        }else{
            window.location.replace("/");
        }
    }
    const onLogOut = () => {
        user.value = null
        token.value = null
        localStorage.removeItem('loggedAppUser');
        router.push('/');
    }
    
    const hydrate = async () => {
        const raw = localStorage.getItem("loggedAppUser");

        if (!raw) {
            user.value = null;
            return;
        }

        const appUser = JSON.parse(raw);         // { token, username, ... }
        const token = appUser?.token;

        if (!token) {
            onLogOut();
            return;
        }

        // decode JWT
        try {
            const decoded = jwtDecode(token);      // { exp, iat, ... }
            
            const now = Date.now() / 1000;
            if (decoded.exp < now) {               // token expired
            console.log("Token expired — logging out");
            onLogOut();
            return;
            }

            // Token valid → restore user
            user.value = appUser;

            console.log("Hydrating from storage:", appUser);

        } catch (err) {
            console.log("Invalid token — logging out");
            onLogOut();
        }
    };

    return { user, token, isAuthenticated, onLogin, onLogOut, hydrate }
})