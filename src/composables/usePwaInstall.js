import { ref, computed } from "vue";

const deferredPrompt = ref(null);
const canInstall = ref(false);

const isIOS = ref(false);
const isStandalone = ref(false);

let initialized = false;

const detectEnvironment = () => {
    isIOS.value =
        /iphone|ipad|ipod/i.test(
            window.navigator.userAgent
        );

    isStandalone.value =
        window.matchMedia(
            "(display-mode: standalone)"
        ).matches ||
        window.navigator.standalone === true;
};

const handleBeforeInstallPrompt = event => {
    console.log(
        "beforeinstallprompt fired"
    );

    event.preventDefault();

    deferredPrompt.value = event;
    canInstall.value = true;
};

const handleAppInstalled = () => {
    console.log(
        "PWA installed"
    );

    deferredPrompt.value = null;
    canInstall.value = false;
    isStandalone.value = true;
};

export const initPwaInstall = () => {
    if (initialized) {
        return;
    }

    initialized = true;

    detectEnvironment();

    window.addEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
    );

    window.addEventListener(
        "appinstalled",
        handleAppInstalled
    );
};

export const usePwaInstall = () => {
    const showInstallOption = computed(() => {
        if (isStandalone.value) {
            return false;
        }

        /*
         * Chromium:
         * beforeinstallprompt peab olemas olema.
         *
         * iOS:
         * näitame oma installijuhist.
         */
        return (
            canInstall.value ||
            isIOS.value
        );
    });

    const installApp = async () => {
        if (!deferredPrompt.value) {
            console.log(
                "No install prompt available"
            );

            return false;
        }

        const prompt =
            deferredPrompt.value;

        await prompt.prompt();

        const result =
            await prompt.userChoice;

        console.log(
            "Install result:",
            result.outcome
        );

        deferredPrompt.value = null;
        canInstall.value = false;

        return result;
    };

    return {
        canInstall,
        isIOS,
        isStandalone,
        showInstallOption,
        installApp
    };
};