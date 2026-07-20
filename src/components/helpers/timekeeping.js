
/* export const timeAgo = (iso, translate) => {
    let diffMs = Date.now() - new Date(iso).getTime()
    diffMs = Math.max(0, diffMs) // prevent negative time
    const mins = Math.floor(diffMs / 60000)
    const hrs = Math.floor(mins / 60)
    const days = Math.floor(hrs / 24)

    if (mins < 60) {
        return translate('timekeeping.minutes_ago', { count: mins })
    }

    if (hrs < 24) {
        return translate('timekeeping.hours_ago', { count: hrs })
    }

    return translate('timekeeping.days_ago', { count: days })
} */

export const timeAgo = (iso, translate) => {
    const timestamp = new Date(iso).getTime();

    if (!Number.isFinite(timestamp)) {
        return "";
    }

    let diffMs = Math.max(0, Date.now() - timestamp);

    const mins = Math.floor(diffMs / 60_000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (mins < 60) {
        return translate("timekeeping.minutes_ago", {
            count: mins
        });
    }

    if (hrs < 24) {
        return translate("timekeeping.hours_ago", {
            count: hrs
        });
    }

    return translate("timekeeping.days_ago", {
        count: days
    });
};
