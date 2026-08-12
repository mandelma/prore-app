export const setAppBadge = async count => {
    if (!("setAppBadge" in navigator)) {
        return false;
    }

    try {
        const safeCount = Number(count);

        if (!Number.isFinite(safeCount) || safeCount <= 0) {
            await navigator.clearAppBadge();
            return true;
        }

        await navigator.setAppBadge(
            Math.min(Math.floor(safeCount), 99)
        );

        return true;
    } catch (error) {
        console.error("App badge'i määramine ebaõnnestus:", error);
        return false;
    }
};

export const clearAppBadge = async () => {
    if (!("clearAppBadge" in navigator)) {
        return false;
    }

    try {
        await navigator.clearAppBadge();
        return true;
    } catch (error) {
        console.error("App badge'i eemaldamine ebaõnnestus:", error);
        return false;
    }
};