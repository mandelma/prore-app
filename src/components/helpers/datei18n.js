const localeMap = {
    fi: "fi-FI",
    en: "en-GB",
    sv: "sv-SE",
    et: "et-EE",
    ru: "ru-RU"
};

export const  formatDateTime = (iso, locale) => {
    if (!iso) return "—";

    const date = new Date(iso);

    return date.toLocaleString(
        localeMap[locale] || "fi-FI",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }
    );
}