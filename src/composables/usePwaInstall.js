/* import { ref } from "vue";

const deferredPrompt = ref(null);
const canInstall = ref(false);

let initialized = false;

export const usePwaInstall = () => {

    const initPwaInstall = () => {
        if (initialized) return;

        initialized = true;

        window.addEventListener(
            "beforeinstallprompt",
            (event) => {
                event.preventDefault();

                deferredPrompt.value = event;
                canInstall.value = true;
            }
        );

        window.addEventListener(
            "appinstalled",
            () => {
                deferredPrompt.value = null;
                canInstall.value = false;
            }
        );
    };

    const installApp = async () => {
        if (!deferredPrompt.value) return;

        await deferredPrompt.value.prompt();

        const result =
            await deferredPrompt.value.userChoice;

        console.log(
            "PWA install:",
            result.outcome
        );

        deferredPrompt.value = null;
        canInstall.value = false;

        return result;
    };

    return {
        canInstall,
        installApp,
        initPwaInstall
    };
}; */

import { ref } from "vue";

const deferredPrompt = ref(null);
const canInstall = ref(false);

let initialized = false;

export const usePwaInstall = () => {
    const initPwaInstall = () => {
        if (initialized) return;

        initialized = true;

        console.log("PWA install listener initialized");

        window.addEventListener(
            "beforeinstallprompt",
            (event) => {
                console.log("beforeinstallprompt fired");

                event.preventDefault();

                deferredPrompt.value = event;
                canInstall.value = true;

                console.log(
                    "canInstall:",
                    canInstall.value
                );
            }
        );

        window.addEventListener(
            "appinstalled",
            () => {
                console.log("PWA installed");

                deferredPrompt.value = null;
                canInstall.value = false;
            }
        );
    };

    const installApp = async () => {
        console.log(
            "installApp",
            deferredPrompt.value
        );

        if (!deferredPrompt.value) {
            console.warn(
                "Install prompt is not available"
            );

            return;
        }

        await deferredPrompt.value.prompt();

        const result =
            await deferredPrompt.value.userChoice;

        console.log(
            "PWA install result:",
            result.outcome
        );

        deferredPrompt.value = null;
        canInstall.value = false;
    };

    return {
        canInstall,
        installApp,
        initPwaInstall
    };
};