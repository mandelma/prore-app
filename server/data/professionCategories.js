module.exports = [
    {
        code: "vehicle_services",

        name: {
            fi: "Ajoneuvopalvelut",
            en: "Vehicle services",
            sv: "Fordonstjänster",
            et: "Sõidukiteenused",
            ru: "Автомобильные услуги"
        },

        description: {
            fi: "Ajoneuvojen huolto-, korjaus- ja maalauspalvelut",
            en: "Vehicle maintenance, repair and painting services",
            sv: "Service, reparation och lackering av fordon",
            et: "Sõidukite hooldus-, remondi- ja värvimisteenused",
            ru: "Обслуживание, ремонт и покраска транспортных средств"
        },

        icon: "fa-solid fa-car",
        enabled: true,
        sortOrder: 10,
        countries: ["FI", "EE", "SE"]
    },

    {
        code: "construction",

        name: {
            fi: "Rakentaminen ja remontointi",
            en: "Construction and renovation",
            sv: "Bygg och renovering",
            et: "Ehitus ja remont",
            ru: "Строительство и ремонт"
        },

        icon: "fa-solid fa-helmet-safety",
        enabled: true,
        sortOrder: 20,
        countries: ["FI", "EE", "SE"]
    },

    {
        code: "cleaning",

        name: {
            fi: "Siivouspalvelut",
            en: "Cleaning services",
            sv: "Städtjänster",
            et: "Koristusteenused",
            ru: "Услуги уборки"
        },

        icon: "fa-solid fa-broom",
        enabled: true,
        sortOrder: 30,
        countries: ["FI", "EE", "SE"]
    }
];