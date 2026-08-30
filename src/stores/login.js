import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
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
    
    let tokenExpiryTimer = null;
    const hydrated = ref(false);

    // --getters--
    const isAuthenticated = computed(() => !!user.value )

    // --actions--
    const onLogin = async (payload) => {
        console.log("Login payload - ", payload);

        if (!payload?.token) {
            throw new Error("Login token missing");
        }

        user.value = payload;
        token.value = payload.token;

        console.log("---------------LOGIN user:", user.value);
        console.log("-----------LOGIN authenticated:", isAuthenticated.value);

        scheduleTokenExpiry(token.value);
        
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

        let target;

        if (route.query.redirect) {
            target = route.query.redirect;
        } else if (payload.role === 'admin') {
            target = "/admin";
        } else {
            target = '/';
        }

        //const target = route.query.redirect || "/";
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

    const MAX_TIMEOUT = 2_147_483_647;

    const scheduleTokenExpiry = (jwt) => {
        if (tokenExpiryTimer) {
            clearTimeout(tokenExpiryTimer);
            tokenExpiryTimer = null;
        }

        try {
            const decoded = jwtDecode(jwt);

            if (!decoded.exp) {
                console.warn("Token expiration time missing");
                return;
            }

            const expiresAt = decoded.exp * 1000;
            const delay = expiresAt - Date.now();

            if (delay <= 0) {
                onLogOut();
                return;
            }

            console.log(
                "Token expires in:",
                Math.round(delay / 1000 / 60),
                "minutes"
            );

            /*
             * setTimeout cannot safely handle delays
             * greater than approximately 24.8 days.
             */
            const timeoutDelay = Math.min(delay, MAX_TIMEOUT);

            tokenExpiryTimer = setTimeout(() => {
                /*
                 * If the real expiration time has not yet
                 * arrived, schedule the remaining time again.
                 */
                if (Date.now() < expiresAt) {
                    scheduleTokenExpiry(jwt);
                    return;
                }

                console.log("Token expired — automatic logout");
                onLogOut();
            }, timeoutDelay);

        } catch (error) {
            console.error(
                "Could not schedule token expiry:",
                error
            );
        }
    };

    const onLogOut = async () => {
        const jwt = token.value;

        const conversationStore = useConversationStore();
        const proStore = useProStore();

        if (tokenExpiryTimer) {
            clearTimeout(tokenExpiryTimer);
            tokenExpiryTimer = null;
        }

        localStorage.removeItem("loggedAppUser");
        sessionStorage.removeItem("loggedAppUser");

        user.value = null;
        token.value = null;

        proStore.provider = null;
        proStore.isUserPro = false;

        conversationStore.disconnect();
        conversationStore.reset();

        /*
         * Jätame selle siia enne push unsubscribe'i,
         * sest sinu äpis väldib see provider lehele
         * tagasi suunamist logouti ajal.
         */
        await router.replace("/home");

        try {
            if (jwt) {
                await disablePushForThisDevice(jwt);
            }
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
                console.log("Stored user has no token — logging out");

                await onLogOut();
                return;
            }

            const decoded = jwtDecode(savedToken);
            const now = Date.now() / 1000;

            if (!decoded.exp || decoded.exp <= now) {
                console.log("Token expired — logging out");

                await onLogOut();
                return;
            }

            /*
             * Token on kehtiv.
             * Taastame kasutaja Pinia store'i.
             */
            user.value = appUser;
            token.value = savedToken;

            /*
             * Käivitame timeri, mis logib kasutaja
             * tokeni aegumisel automaatselt välja.
             */
            scheduleTokenExpiry(savedToken);

            console.log(
                "Hydrating from storage:",
                appUser
            );

        } catch (error) {
            console.log(
                "Invalid stored user/token — logging out",
                error
            );

            await onLogOut();

        } finally {
            hydrated.value = true;
        }
    };

    return { user, hydrated, token, isAuthenticated, onLogin, onLogOut, hydrate }
})