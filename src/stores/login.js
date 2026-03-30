import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import loginService from '@/service/login'
import { useRoute, useRouter } from 'vue-router'
import { jwtDecode } from "jwt-decode"; // npm install jwt-decode
import { useConversationStore } from './conversationStore';
import { useProStore } from './providerStore';

export const useLoginStore = defineStore('login', () => {
    // --state--
    const user = ref(null);
    const token = ref(null);
    const route = useRoute();
    const router = useRouter();
    
    const hydrated = ref(false);

    // --getters--
    const isAuthenticated = computed(() => !!user.value )

    // --actions--
    const onLogin = async (payload) => {
        console.log("Login payload - ", payload);

        user.value = payload;
        token.value = payload.token ?? null;
        localStorage.setItem('loggedAppUser', JSON.stringify(payload));

        const proStore = useProStore();

        try {
            await proStore.getProState(payload.id);
        } catch (e) {
            // no provider found, stay normal user
            console.log("No provider for this user");
        }


        const target = route.query.redirect || "/";
        await router.replace(target);
    }
    const onLogOut = () => {
        user.value = null
        token.value = null
        const conversationStore = useConversationStore();
        const proStore = useProStore();
        localStorage.removeItem('loggedAppUser');
        conversationStore.disconnect();
        conversationStore.reset();

        proStore.provider = null;
        router.push('/');
    }
    
    const hydrate = async () => {
        const raw = localStorage.getItem("loggedAppUser");

        if (!raw) {
            user.value = null;
            token.value = null;
            return;
        }

        const appUser = JSON.parse(raw); 
        const savedToken = appUser?.token;

        if (!savedToken) {
            onLogOut();
            return;
        }

        // decode JWT
        try {
            const decoded = jwtDecode(savedToken); 
            
            const now = Date.now() / 1000;
            if (decoded.exp < now) { 
            console.log("Token expired — logging out");
            onLogOut();
            return;
            }

            hydrated.value = true;

            user.value = appUser;
            token.value = savedToken;
            console.log("Hydrating from storage:", appUser);

        } catch (err) {
            console.log("Invalid token — logging out");
            onLogOut();
        }
    };

    return { user, hydrated, token, isAuthenticated, onLogin, onLogOut, hydrate }
})