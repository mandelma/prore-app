import { computed } from 'vue';
export const getFormatted = (locale) => {
    // Implementation for formatting date based on area
    switch (locale) {
        case "en":
            return {
                firstDay: 0,
                title: "Select date",
                monthsFull: [
                    "January", "February", "March", "April",
                    "May", "June", "July", "August",
                    "September", "October", "November", "December"
                ],
                monthsShort: [
                    "Jan", "Feb", "Mar", "Apr",
                    "May", "Jun", "Jul", "Aug",
                    "Sep", "Oct", "Nov", "Dec"
                ],
                weekdaysFull: [
                    "Sunday", "Monday", "Tuesday", "Wednesday",
                    "Thursday", "Friday", "Saturday"
                ],
                weekdaysShort: [
                    "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"
                ],
                weekdaysNarrow: [
                    "S", "M", "T", "W", "T", "F", "S"
                ],
                cancelBtnText: "Cancel",
                cancelLabel: "Cancel",
                okLabel: "OK",
                twelveHour: true
            };

        case "sv":
            return {
                firstDay: 1,
                title: "Välj datum",
                monthsFull: [
                    "januari", "februari", "mars", "april",
                    "maj", "juni", "juli", "augusti",
                    "september", "oktober", "november", "december"
                ],
                monthsShort: [
                    "jan", "feb", "mar", "apr",
                    "maj", "jun", "jul", "aug",
                    "sep", "okt", "nov", "dec"
                ],
                weekdaysFull: [
                    "söndag", "måndag", "tisdag", "onsdag",
                    "torsdag", "fredag", "lördag"
                ],
                weekdaysShort: [
                    "sö", "må", "ti", "on", "to", "fr", "lö"
                ],
                weekdaysNarrow: [
                    "S", "M", "T", "O", "T", "F", "L"
                ],
                cancelBtnText: "Avbryt",
                cancelLabel: "Avbryt",
                okLabel: "OK",
                twelveHour: false
            };

        case "et":
            return {
                firstDay: 1,
                title: "Vali kuupäev",
                monthsFull: [
                    "jaanuar", "veebruar", "märts", "aprill",
                    "mai", "juuni", "juuli", "august",
                    "september", "oktoober", "november", "detsember"
                ],
                monthsShort: [
                    "jaan", "veebr", "märts", "apr",
                    "mai", "juuni", "juuli", "aug",
                    "sept", "okt", "nov", "dets"
                ],
                weekdaysFull: [
                    "pühapäev", "esmaspäev", "teisipäev",
                    "kolmapäev", "neljapäev", "reede", "laupäev"
                ],
                weekdaysShort: ["P", "E", "T", "K", "N", "R", "L"],
                weekdaysNarrow: ["P", "E", "T", "K", "N", "R", "L"],
                cancelBtnText: "Tühista",
                cancelLabel: "Tühista",
                okLabel: "OK",
                twelveHour: false
            };

        case "ru":
            return {
                firstDay: 1,
                title: "Выберите дату",
                monthsFull: [
                    "январь", "февраль", "март", "апрель",
                    "май", "июнь", "июль", "август",
                    "сентябрь", "октябрь", "ноябрь", "декабрь"
                ],
                monthsShort: [
                    "янв", "фев", "мар", "апр",
                    "май", "июн", "июл", "авг",
                    "сен", "окт", "ноя", "дек"
                ],
                weekdaysFull: [
                    "воскресенье", "понедельник", "вторник",
                    "среда", "четверг", "пятница", "суббота"
                ],
                weekdaysShort: [
                    "вс", "пн", "вт", "ср", "чт", "пт", "сб"
                ],
                weekdaysNarrow: [
                    "В", "П", "В", "С", "Ч", "П", "С"
                ],
                cancelBtnText: "Отмена",
                cancelLabel: "Отмена",
                okLabel: "ОК",
                twelveHour: false
            };

        default:
            return {
                firstDay: 1,
                title: "Valitse päivämäärä",
                monthsFull: [
                    "tammikuu", "helmikuu", "maaliskuu", "huhtikuu",
                    "toukokuu", "kesäkuu", "heinäkuu", "elokuu",
                    "syyskuu", "lokakuu", "marraskuu", "joulukuu"
                ],
                monthsShort: [
                    "tammi", "helmi", "maalis", "huhti",
                    "touko", "kesä", "heinä", "elo",
                    "syys", "loka", "marras", "joulu"
                ],
                weekdaysFull: [
                    "sunnuntai", "maanantai", "tiistai",
                    "keskiviikko", "torstai", "perjantai", "lauantai"
                ],
                weekdaysShort: [
                    "su", "ma", "ti", "ke", "to", "pe", "la"
                ],
                weekdaysNarrow: [
                    "S", "M", "T", "K", "T", "P", "L"
                ],
                cancelBtnText: "Peruuta",
                cancelLabel: "Peruuta",
                okLabel: "OK",
                twelveHour: false
            };
    }
}