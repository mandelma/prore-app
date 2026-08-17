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
        //localStorage.setItem('loggedAppUser', JSON.stringify(payload));
        if (payload.remember) {
            localStorage.setItem(
                "loggedAppUser",
                JSON.stringify(payload)
            );

            sessionStorage.removeItem(
                "loggedAppUser"
            );
        } else {
            sessionStorage.setItem(
                "loggedAppUser",
                JSON.stringify(payload)
            );

            localStorage.removeItem(
                "loggedAppUser"
            );
        }

        const target = route.query.redirect || "/";
        await router.replace(target);
    }

    const disablePushForThisDevice = async (jwt) => {
        if (!jwt) {
            return;
        }

        const registration =
            await navigator.serviceWorker
                .getRegistration();

        if (!registration) {
            return;
        }

        const subscription =
            await registration.pushManager
                .getSubscription();

        if (!subscription) {
            return;
        }

        const response =
            await fetch(
                "/api/push/unsubscribe",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${jwt}`
                    },

                    body: JSON.stringify({
                        endpoint:
                            subscription.endpoint
                    })
                }
            );

        if (!response.ok) {
            throw new Error(
                `Unsubscribe failed: ${response.status}`
            );
        }

        await subscription.unsubscribe();
    };

    const onLogOut = async () => {
        const jwt = token.value;

        const conversationStore = useConversationStore();
        const proStore = useProStore();

        localStorage.removeItem("loggedAppUser");
        sessionStorage.removeItem("loggedAppUser");

        user.value = null;
        token.value = null;

        proStore.provider = null;
        proStore.isUserPro = false;

        conversationStore.disconnect();
        conversationStore.reset();

        await router.replace("/home");

        try {
            await disablePushForThisDevice(jwt);
        } catch (error) {
            console.warn(
                "Push unsubscribe failed:",
                error
            );
        }
    };
    
    const hydrate = async () => {
        try {
            const raw =
                localStorage.getItem("loggedAppUser") ||
                sessionStorage.getItem("loggedAppUser");

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

            const decoded = jwtDecode(savedToken);

            const now = Date.now() / 1000;

            if (!decoded.exp || decoded.exp < now) {
                console.log("Token expired — logging out");
                onLogOut();
                return;
            }

            user.value = appUser;
            token.value = savedToken;

            console.log("Hydrating from storage:", appUser);

        } catch (err) {
            console.log("Invalid stored user/token — logging out", err);

            onLogOut();
        } finally {
            hydrated.value = true;
        }
    };

    return { user, hydrated, token, isAuthenticated, onLogin, onLogOut, hydrate }
})