import { test, expect } from '@playwright/test';

import { loginAsClient, registerAndLoginAsClient } from './helpers/auth.helper.js';
import { closeNotificationModal } from './helpers/modal.helper.js';

import { deleteTestUser }
    from './helpers/user.helper.js';

import {
    selectMockAddress
} from './helpers/google-maps.helper.js';

const selectCustomField = async (page, fieldKey, optionName) => {

    const field = page.getByTestId(`custom-field-${fieldKey}`);

    await field.locator(`#profession-field-${fieldKey}`).click();

    const listbox = page.getByRole('listbox');

    await expect(listbox).toBeVisible();

    await listbox.getByRole('option', {
        name: optionName,
        exact: true
    }).click();

    await expect(listbox).toBeHidden();

    await expect(
        field.locator('.p-select-label')
    ).toHaveText(optionName);
};

const selectMultiCustomField = async (page, fieldKey, optionName) => {

    const field = page.getByTestId(`custom-field-${fieldKey}`);

    const multiSelect = field.locator(
        `#profession-field-${fieldKey}`
    );

    const listbox = page.getByRole('listbox');

    // Avame valikute nimekirja ainult siis,
    // kui see ei ole juba nähtav.
    if (!(await listbox.isVisible())) {
        await multiSelect.click();
    }

    await expect(listbox).toBeVisible();

    // Valime soovitud teenuse
    await listbox.getByRole('option', {
        name: optionName,
        exact: true
    }).click();

    // Kontrollime, et valik lisati
    await expect(
        field.locator('.p-multiselect-chip')
            .filter({ hasText: optionName })
    ).toHaveCount(1);
};


test('PW-000: Klient saab registreerida ja automaatselt sisse logida', async ({page}) => {
    console.log("Klient alustab registreerimist");
    let userIds = [];
    try {
        const { userId } = await registerAndLoginAsClient(page);

        userIds.push(userId);

        console.log("User id displayed in booking test :: " + userId);

        await expect(page).toHaveURL(
            url => url.pathname === '/home'
        )

        // Sulgeme teavituste modaali kui see on avatud
        await closeNotificationModal(page);

        console.log("Klient on sisse logitud ja pealehel");

    } finally {
        if (userIds.length) {
            for (const userId of userIds) {
                await deleteTestUser(userId);

                console.log('Ajutine kasutaja kustutatud ', userId);
            }
            
        }
    }
})

test('PW-006: Klient saab avada tellimuse loomise vormi', async ({ page }) => {
    // 1. Registreerime Google Mapsi mocki
    //await mockGoogleMaps(page);

    page.on('framenavigated', frame => {

        if (frame === page.mainFrame()) {

            console.log(
                'PLAYWRIGHT FRAME NAVIGATION:',
                frame.url()
            );
        }
    });

    page.on('pageerror', error => {
        console.error(
            'BROWSER JAVASCRIPT ERROR:',
            error.message
        );
    });

    page.on('console', message => {
        const text = message.text();

        if (
            text.startsWith('LOGIN STEP') ||
            text.startsWith('LOGIN NAVIGATION') ||
            text.startsWith('ROUTER')
        ) {
            console.log('BROWSER:', text);
        }
    });

    page.on('pageerror', error => {
        console.error(
            'BROWSER JAVASCRIPT ERROR:',
            error.message
        );
    });

    page.on('response', response => {
        if (response.status() >= 400) {
            console.error(
                'HTTP ERROR:',
                response.status(),
                response.request().method(),
                response.url()
            );
        }
    });

    // 1. Logime kliendina sisse
    await loginAsClient(page);


    // 2. Kontrollime, et oleme avalehel
    await expect(page).toHaveURL(
        url => url.pathname === '/home'
    );

    // Sulgeme teavituste modaali kui see on avatud
    await closeNotificationModal(page);

    // 3. Leiame tellimuse alustamise nupu
    const startBookingButton = page.getByTestId('start-booking');

    // 4. Kontrollime nupu nähtavust
    await expect(startBookingButton).toBeVisible();

    // 5. Vajutame tellimuse alustamise nuppu
    await startBookingButton.click();

    // 6. Kontrollime, et tellimuse loomise vorm avanes
    const bookingForm = page.locator('form.booking-form');

    await expect(bookingForm).toBeVisible({
        timeout: 10000
    });

    console.log('PW-006: Tellimuse loomise vorm avanes edukalt');

    // 8. Leiame ameti valimise komponendi
    const professionSelect = page.getByTestId('booking-profession');

    // 9. Kontrollime, et ametivalik on nähtav
    await expect(professionSelect).toBeVisible();

    // 10. Avame ametite nimekirja
    await professionSelect.click();

    // 11. Kontrollime, et ametite nimekiri avanes
    const professionList = page.getByRole('listbox');



    await expect(professionList).toBeVisible();

    // Uurime, millised ametid on nimekirjas
    const options = professionList.getByRole('option');

    console.log('Ametite arv:', await options.count());

    console.log(
        'Ametite nimed:',
        await options.allTextContents()
    );

    console.log(
        'Kodukoristaja testielementide arv:',
        await page.getByTestId(
            'profession-option-home_cleaner'
        ).count()
    );





    await expect(professionList).toBeVisible();

    // 12. Valime soovitud ameti
    const professionOption = page.getByTestId(
        'profession-option-home_cleaner'
    );

    await expect(professionOption).toBeVisible();

    await professionOption.click();

    // 13. Kontrollime, et ametite nimekiri sulgus
    await expect(professionList).toBeHidden();






    // PW-006: Kontrollime kodukoristaja dünaamilisi välju

    const expectedFields = [
        // cleaning.json
        'propertyType',
        'propertyArea',
        'roomCount',
        'bathroomCount',
        'cleaningFrequency',
        'cleaningSupplies',

        // home_cleaner.json
        'cleaningType',
        'additionalServices',
        'petsInHome',
        'accessArrangement',
        'specialRequirements',
        'additionalDetails'
    ];

    for (const fieldKey of expectedFields) {

        const field = page.getByTestId(
            `custom-field-${fieldKey}`
        );

        await expect(field).toBeVisible();
    }

    console.log(
        'PW-006: Kõik 12 kodukoristaja vormivälja on nähtavad'
    );

    const propertyArea = page.locator(
        '#profession-field-propertyArea'
    );

    await propertyArea.fill('75');

    await expect(propertyArea).toHaveValue('75');

    const propertyType = page.getByTestId(
        'custom-field-propertyType'
    );

    await propertyType.locator(
        '#profession-field-propertyType'
    ).click();

    const propertyOptions = page.getByRole('listbox');

    await expect(propertyOptions).toBeVisible();

    await propertyOptions.getByRole('option', {
        name: 'Kerrostaloasunto'
    }).click();

    await expect(propertyOptions).toBeHidden();

    await expect(
        propertyType.locator('.p-select-label')
    ).toHaveText('Kerrostaloasunto');

    // Koristamise sagedus
    await selectCustomField(
        page,
        'cleaningFrequency',
        'Kertaluonteinen'
    );

    // Koristusvahendid
    await selectCustomField(
        page,
        'cleaningSupplies',
        'Siivooja tuo välineet ja puhdistusaineet'
    );

    // Koristamise tüüp
    await selectCustomField(
        page,
        'cleaningType',
        'Tavallinen kotisiivous'
    );

    console.log(
        'PW-006: Kõik kohustuslikud ametipõhised väljad on täidetud'
    );

    await selectMultiCustomField(
        page,
        'additionalServices',
        'Ikkunoiden pesu'
    );

    console.log(
        'PW-006: Lisateenus Akende pesemine valitud'
    );

    await selectMultiCustomField(
        page,
        'additionalServices',
        'Uunin puhdistus'
    );

    const additionalServices = page.getByTestId(
        'custom-field-additionalServices'
    );

    await expect(
        additionalServices.locator('.p-multiselect-chip')
    ).toHaveCount(2);

    // Täidame täiendavate juhiste välja
    const additionalDetails = page.locator(
        '#profession-field-additionalDetails'
    );

    await additionalDetails.fill(
        'Palun pöörata erilist tähelepanu köögi ja vannitoa koristamisele.'
    );

    // Kontrollime sisestatud teksti
    await expect(additionalDetails).toHaveValue(
        'Palun pöörata erilist tähelepanu köögi ja vannitoa koristamisele.'
    );

    console.log(
        'PW-006: Täiendavad koristusjuhised edukalt sisestatud'
    );

    await expect(
        page.locator('#profession-field-propertyArea')
    ).toHaveValue('75');

    await expect(
        page.getByTestId('custom-field-additionalServices')
            .locator('.p-multiselect-chip')
    ).toHaveCount(2);

    // ====================================
    // PW-006: Tellimuse põhiväljad
    // ====================================

    // 1. Pealkiri
    const bookingHeader = page.getByTestId('booking-header');

    await expect(bookingHeader).not.toBeEmpty();

    await bookingHeader.fill(
        'Playwright E2E - Kodukoristus'
    );

    await expect(bookingHeader).toHaveValue(
        'Playwright E2E - Kodukoristus'
    );

    // 2. Aadressi käsitsi sisestamise kontroll
    const addressInput = page.getByTestId('client-address');

    await expect(addressInput).toBeVisible();

    await addressInput.fill(
        'Mannerheimintie 10, Helsinki'
    );

    await expect(addressInput).toHaveValue(
        'Mannerheimintie 10, Helsinki'
    );

    console.log(
        'PW-006: Aadressi käsitsi sisestamine töötab'
    );

    // 3. Google Mapsi aadressivaliku simuleerimine
    const selectedAddress = await selectMockAddress(page);

    await expect(addressInput).toHaveValue(
        selectedAddress.address
    );

    console.log(
        'PW-006: Aadressivaliku simuleerimine õnnestus'
    );

    // 2. Teeninduspiirkonna raadius
    const clientArea = page.getByTestId('client-area');

    await clientArea.fill('15');

    await expect(clientArea).toHaveValue('15');

    // 3. Kirjeldus
    const explanation = page.getByTestId('booking-explanation');

    await explanation.fill(
        'Playwright E2E test. Vajalik on 75 m² korteri põhjalik koristamine.'
    );

    await expect(explanation).toHaveValue(
        'Playwright E2E test. Vajalik on 75 m² korteri põhjalik koristamine.'
    );

    console.log(
        'PW-006: Tellimuse põhiväljad edukalt täidetud'
    );
});

import {
    getDateTimePicker,
    expectDateTimePicker,
    openDateTimePicker,
    selectTomorrow,
    selectTime
} from './helpers/datetime.helper.js';

test('PW-007: DateTimePicker avaneb', async ({ page }) => {

    // 1. Logime sisse
    await loginAsClient(page);

    // 2. Kontrollime avalehte
    await expect(page).toHaveURL(/\/home/);

    // 3. Sulgeme teavituste modaali, kui see on avatud
    const notificationModal = page.locator(
        '.modal.show[role="dialog"]'
    );

    if (await notificationModal.isVisible()) {

        const laterButton = notificationModal.getByRole(
            'button',
            { name: 'Myöhemmin' }
        );

        await laterButton.click();

        await expect(notificationModal).toBeHidden();

        console.log('Teavituste modaal suletud');
    }

    // 4. Avame tellimuse vormi
    const startBookingButton = page.getByTestId(
        'start-booking'
    );

    await expect(startBookingButton).toBeVisible();

    await startBookingButton.click();

    await expect(page).toHaveURL(/\/client-form/);



    // Kontrollime DateTimePickeri olemasolu
    await expectDateTimePicker(
        page,
        'booking-datetime'
    );

    const dateTimeInput = page.getByTestId('booking-datetime');

    // Valime homse kuupäeva
    await selectTomorrow(
        page,
        'booking-datetime'
    );

    console.log(
        'PW-007: Homse kuupäeva valimine õnnestus'
    );

    // Valime kella 14
    await selectTime(page, 14, 30);


    // Kontrollime sisendvälja väärtust
    await expect(dateTimeInput).not.toHaveValue('');

    // Kontrollime, et kellaaeg on õige
    await expect(dateTimeInput).toHaveValue(
        /14:30/
    );

    console.log(
        'PW-007: DateTimePicker väärtus:',
        await dateTimeInput.inputValue()
    );

    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    const day = String(
        tomorrow.getDate()
    ).padStart(2, '0');

    const month = String(
        tomorrow.getMonth() + 1
    ).padStart(2, '0');

    const year = tomorrow.getFullYear();

    const inputValue = await dateTimeInput.inputValue();

    console.log('PW-007: Sisendvälja väärtus:', inputValue);

    // Kontrollime kuupäeva komponente
    expect(inputValue).toContain(day);
    expect(inputValue).toContain(month);
    expect(inputValue).toContain(String(year));
   
});


import {
    openPhotoEditor,
    addPhoto,
    savePhotos,
    removePhoto,
    cancelPhotoChanges,
    setPhotoDescription
} from './helpers/photos.helper.js'

test('PW-008: Piltide lisamine ja eemaldamine', async ({ page }) => {

    // ==========================================
    // ETAPP 1: Sisselogimine ja vormi avamine
    // ==========================================

    // 1. Logime sisse
    await loginAsClient(page);

    // 2. Kontrollime avalehte
    await expect(page).toHaveURL(/\/home/);

    // 3. Sulgeme teavituste modaali, kui see on avatud
    const notificationModal = page.locator(
        '.modal.show[role="dialog"]'
    );

    if (await notificationModal.isVisible()) {

        const laterButton = notificationModal.getByRole(
            'button',
            { name: 'Myöhemmin' }
        );

        await laterButton.click();

        await expect(notificationModal).toBeHidden();

        console.log('PW-008: Teavituste modaal suletud');
    }

    // 4. Avame tellimuse vormi
    const startBookingButton = page.getByTestId(
        'start-booking'
    );

    await expect(startBookingButton).toBeVisible();

    await startBookingButton.click();

    await expect(page).toHaveURL(/\/client-form/);

    console.log('PW-008: Tellimisvorm avatud');


    // ==========================================
    // ETAPP 2: Pildi lisamine
    // ==========================================

    // 5. Avame piltide lisamise paneeli
    await openPhotoEditor(page);

    // 6. Kontrollime, et salvestamisnupp on keelatud
    await expect(
        page.getByTestId('booking-photo-save')
    ).toBeDisabled();

    // 7. Lisame testpildi
    await addPhoto(
        page,
        'tests/e2e/fixtures/test-photo.png'
    );

    // 8. Kontrollime pildi eelvaadet
    await expect(
        page.getByTestId('booking-photo-preview')
    ).toHaveCount(1);

    console.log('PW-008: Pilt lisatud ja eelvaade kuvatud');


    // ==========================================
    // ETAPP 3: Pildi kirjelduse lisamine
    // ==========================================

    // 9. Lisame pildile kirjelduse
    const description = 'Playwright E2E testpilt';

    await setPhotoDescription(page, description);

    console.log('PW-008: Pildi kirjeldus lisatud');

    // 10. Kontrollime, et salvestamine on lubatud
    await expect(
        page.getByTestId('booking-photo-save')
    ).toBeEnabled();


    // ==========================================
    // ETAPP 4: Pildi salvestamine
    // ==========================================

    // 11. Salvestame pildi ja kirjelduse
    await savePhotos(page);

    // 12. Kontrollime, et pilt jäi alles
    await expect(
        page.getByTestId('booking-photo-preview')
    ).toHaveCount(1);

    // 13. Kontrollime salvestatud kirjeldust
    await expect(
        page.getByTestId('booking-photo-caption')
    ).toHaveText(description);

    console.log('PW-008: Pilt ja kirjeldus salvestatud');


    // ==========================================
    // ETAPP 5: Salvestatud andmete kontrollimine
    // ==========================================

    // 14. Avame piltide muutmise uuesti
    await openPhotoEditor(page);

    // 15. Kontrollime, et kirjeldus säilis
    await expect(
        page.getByTestId('booking-photo-description')
    ).toHaveValue(description);

    console.log('PW-008: Salvestatud kirjeldus säilis');


    // ==========================================
    // ETAPP 6: Pildi eemaldamine
    // ==========================================

    // 16. Eemaldame pildi
    await removePhoto(page);

    // 17. Kontrollime, et eelvaade kadus
    await expect(
        page.getByTestId('booking-photo-preview')
    ).toHaveCount(0);

    // 18. Kontrollime, et salvestamine on lubatud
    await expect(
        page.getByTestId('booking-photo-save')
    ).toBeEnabled();

    // 19. Salvestame eemaldamise
    await savePhotos(page);

    // 20. Kontrollime, et pilt on eemaldatud
    await expect(
        page.getByTestId('booking-photo-preview')
    ).toHaveCount(0);

    console.log('PW-008: Pildi eemaldamine õnnestus');

});

test('PW-009: Piltide muudatuste tühistamine', async ({ page }) => {

    // ==========================================
    // ETAPP 1: Sisselogimine ja vormi avamine
    // ==========================================

    await loginAsClient(page);

    await expect(page).toHaveURL(/\/home/);

    // Sulgeme teavituste modaali, kui see on avatud
    const notificationModal = page.locator(
        '.modal.show[role="dialog"]'
    );

    if (await notificationModal.isVisible()) {

        const laterButton = notificationModal.getByRole(
            'button',
            { name: 'Myöhemmin' }
        );

        await laterButton.click();

        await expect(notificationModal).toBeHidden();
    }

    // Avame tellimisvormi
    const startBookingButton = page.getByTestId(
        'start-booking'
    );

    await expect(startBookingButton).toBeVisible();

    await startBookingButton.click();

    await expect(page).toHaveURL(/\/client-form/);

    console.log('PW-009: Tellimisvorm avatud');


    // ==========================================
    // ETAPP 2: Lisame ja salvestame pildi
    // ==========================================

    await openPhotoEditor(page);

    await addPhoto(
        page,
        'tests/e2e/fixtures/test-photo.png'
    );

    const originalDescription = 'Algne pildi kirjeldus';

    await setPhotoDescription(
        page,
        originalDescription
    );

    await savePhotos(page);

    // Kontrollime salvestatud andmeid
    await expect(
        page.getByTestId('booking-photo-preview')
    ).toHaveCount(1);

    await expect(
        page.getByTestId('booking-photo-caption')
    ).toHaveText(originalDescription);

    console.log('PW-009: Algne pilt ja kirjeldus salvestatud');


    // ==========================================
    // ETAPP 3: Muudame kirjeldust
    // ==========================================

    await openPhotoEditor(page);

    const changedDescription = 'Muudetud kirjeldus';

    await setPhotoDescription(
        page,
        changedDescription
    );

    // Kontrollime, et muudatus on tehtud
    await expect(
        page.getByTestId('booking-photo-description')
    ).toHaveValue(changedDescription);

    console.log('PW-009: Kirjeldus muudetud');


    // ==========================================
    // ETAPP 4: Tühistame muudatused
    // ==========================================

    await cancelPhotoChanges(page);

    // Kontrollime, et pilt on alles
    await expect(
        page.getByTestId('booking-photo-preview')
    ).toHaveCount(1);

    // Kontrollime, et algne kirjeldus taastati
    await expect(
        page.getByTestId('booking-photo-caption')
    ).toHaveText(originalDescription);

    console.log('PW-009: Algne kirjeldus säilis');


    // ==========================================
    // ETAPP 5: Kontrollime uuesti muutmisvaates
    // ==========================================

    await openPhotoEditor(page);

    await expect(
        page.getByTestId('booking-photo-description')
    ).toHaveValue(originalDescription);

    // Muudatusi ei tohiks olla
    await expect(
        page.getByTestId('booking-photo-save')
    ).toBeDisabled();

    console.log(
        'PW-009: Tühistamine toimib, salvestatud andmed säilisid'
    );

});

import {
    submitBookingForm,
    expectBookingFormOpen
} from './helpers/validation.helper.js'

test('PW-010: Tühja tellimisvormi valideerimine', async ({ page }) => {

    // ==========================================
    // ETAPP 1: Sisselogimine
    // ==========================================

    await loginAsClient(page);

    await expect(page).toHaveURL(/\/home/);

    // Sulgeme teavituste modaali
    const notificationModal = page.locator(
        '.modal.show[role="dialog"]'
    );

    if (await notificationModal.isVisible()) {

        const laterButton = notificationModal.getByRole(
            'button',
            { name: 'Myöhemmin' }
        );

        await laterButton.click();

        await expect(notificationModal).toBeHidden();
    }

    // ==========================================
    // ETAPP 2: Tellimisvormi avamine
    // ==========================================

    const startBookingButton = page.getByTestId(
        'start-booking'
    );

    await expect(startBookingButton).toBeVisible();

    await startBookingButton.click();

    await expect(page).toHaveURL(/\/client-form/);

    console.log('PW-010: Tellimisvorm avatud');


    // ==========================================
    // ETAPP 3: Jälgime tellimuse API päringuid
    // ==========================================

    const bookingRequests = [];

    // Jälgime kõiki POST /recipients päringuid
    const requestHandler = request => {

        const url = new URL(request.url());

        if (
            request.method() === 'POST' &&
            /\/recipients\/?$/.test(url.pathname)
        ) {
            bookingRequests.push(request.url());
        }
    };

    page.on('request', requestHandler);


    // ==========================================
    // ETAPP 4: Proovime saata tühja vormi
    // ==========================================

    await submitBookingForm(page);

    console.log('PW-010: Tühja vormi saatmist proovitud');

    // Kontrollime üldise veateate ilmumist
    const validationToast = page.getByTestId(
        'booking-validation-toast'
    );

    await expect(validationToast).toBeVisible();

    console.log('PW-010: Üldine valideerimise Toast ilmus');

    await expect(validationToast).toBeHidden({
        timeout: 5000
    });

    console.log('PW-010: Toast sulgus automaatselt');

    // Eraldi väljadel vigade kontrollimine

    {/* <div
        v-if="errors.profession"
        data-testid="booking-error-profession"
        class="invalid-feedback"
    >
        {{ errors.profession }}
    </div> */}


    /* await expect(
        page.getByTestId('booking-error-profession')
    ).toBeVisible(); */

    // ==========================================
    // ETAPP 5: Kontrollime valideerimist
    // ==========================================

    // Kasutaja peab jääma tellimisvormile
    await expectBookingFormOpen(page);

    console.log('PW-010: Kasutaja jäi tellimisvormile');

    // Kontrollime, et serverisse ei saadetud tellimust
    expect(bookingRequests).toHaveLength(0);

    console.log(
        'PW-010: Tühja tellimust serverisse ei saadetud'
    );

    // Eemaldame päringute jälgimise
    page.off('request', requestHandler);
});

test('PW-011: Kohustuslike väljade veateadete kontroll', async ({ page }) => {

    // ==========================================
    // ETAPP 1: Sisselogimine
    // ==========================================

    await loginAsClient(page);

    await expect(page).toHaveURL(/\/home/);

    const notificationModal = page.locator(
        '.modal.show[role="dialog"]'
    );

    if (await notificationModal.isVisible()) {

        await notificationModal.getByRole(
            'button',
            { name: 'Myöhemmin' }
        ).click();

        await expect(notificationModal).toBeHidden();
    }


    // ==========================================
    // ETAPP 2: Tellimisvormi avamine
    // ==========================================

    await page.getByTestId('start-booking').click();

    await expect(page).toHaveURL(/\/client-form/);

    await expect(
        page.getByTestId('booking-form')
    ).toBeVisible();

    console.log('PW-011: Tellimisvorm avatud');


    // ==========================================
    // ETAPP 3: Tühja vormi saatmine
    // ==========================================

    await submitBookingForm(page);

    console.log('PW-011: Valideerimine käivitatud');


    // ==========================================
    // ETAPP 4: Kontrollime veateateid
    // ==========================================

    await expect(
        page.getByTestId('error-profession')
    ).toBeVisible();

    await expect(
        page.getByTestId('error-header')
    ).toBeVisible();

    await expect(
        page.getByTestId('error-datetime')
    ).toBeVisible();

    await expect(
        page.getByTestId('error-explanation')
    ).toBeVisible();

    console.log(
        'PW-011: Kohustuslike väljade veateated ilmusid'
    );


    // ==========================================
    // ETAPP 5: Parandame pealkirja
    // ==========================================

    await page.getByTestId('booking-header').fill(
        'Playwright testtellimus'
    );

    await expect(
        page.getByTestId('error-header')
    ).toBeHidden();

    console.log(
        'PW-011: Pealkirja veateade kadus pärast parandamist'
    );


    // ==========================================
    // ETAPP 6: Parandame kirjelduse
    // ==========================================

    await page.getByTestId('booking-explanation').fill(
        'See on Playwrighti automaattesti kirjeldus.'
    );

    await expect(
        page.getByTestId('error-explanation')
    ).toBeHidden();

    console.log(
        'PW-011: Kirjelduse veateade kadus pärast parandamist'
    );


    // ==========================================
    // ETAPP 7: Kontrollime allesjäänud vigu
    // ==========================================

    await expect(
        page.getByTestId('error-profession')
    ).toBeVisible();

    await expect(
        page.getByTestId('error-datetime')
    ).toBeVisible();

    await expectBookingFormOpen(page);

    console.log(
        'PW-011: Parandamata väljade veateated jäid nähtavale'
    );

});

test('PW-012: Otsinguraadiuse valideerimine', async ({ page }) => {

    // ==========================================
    // ETAPP 1: Sisselogimine
    // ==========================================

    await loginAsClient(page);

    await expect(page).toHaveURL(/\/home/);

    const notificationModal = page.locator(
        '.modal.show[role="dialog"]'
    );

    if (await notificationModal.isVisible()) {
        await notificationModal.getByRole(
            'button',
            { name: 'Myöhemmin' }
        ).click();

        await expect(notificationModal).toBeHidden();
    }

    // ==========================================
    // ETAPP 2: Tellimisvormi avamine
    // ==========================================

    await page.getByTestId('start-booking').click();

    await expect(page).toHaveURL(/\/client-form/);

    const radiusInput = page.getByTestId('client-area');
    const radiusError = page.getByTestId('error-radius');

    await expect(radiusInput).toBeVisible();

    // ==========================================
    // ETAPP 3: Vigaste väärtuste kontroll
    // ==========================================

    for (const value of ['0', '-1', '51']) {

        await radiusInput.fill(value);

        await submitBookingForm(page);

        await expect(radiusError).toBeVisible();

        await expectBookingFormOpen(page);

        console.log(
            `PW-012: Vigane otsinguraadius ${value} km tuvastati`
        );
    }

    // ==========================================
    // ETAPP 4: Korrektse väärtuse kontroll
    // ==========================================

    await radiusInput.fill('10');

    // Käivitame uuesti kogu vormi valideerimise.
    // Teised kohustuslikud väljad on endiselt tühjad.
    await submitBookingForm(page);

    await expect(radiusError).toBeHidden();

    await expectBookingFormOpen(page);

    console.log(
        'PW-012: Otsinguraadius 10 km läbis valideerimise'
    );

});

test('PW-013: Eelarve valideerimine', async ({ page }) => {

    // ==========================================
    // ETAPP 1: Sisselogimine
    // ==========================================

    await loginAsClient(page);

    await expect(page).toHaveURL(/\/home/);

    const notificationModal = page.locator(
        '.modal.show[role="dialog"]'
    );

    if (await notificationModal.isVisible()) {

        await notificationModal.getByRole(
            'button',
            { name: 'Myöhemmin' }
        ).click();

        await expect(notificationModal).toBeHidden();
    }


    // ==========================================
    // ETAPP 2: Tellimisvormi avamine
    // ==========================================

    await page.getByTestId('start-booking').click();

    await expect(page).toHaveURL(/\/client-form/);

    console.log('PW-013: Tellimisvorm avatud');


    // ==========================================
    // ETAPP 3: Eelarve aktiveerimine
    // ==========================================

    const budgetCheckbox = page.getByTestId(
        'booking-budget'
    );

    await budgetCheckbox.check();

    const budgetMin = page.getByTestId(
        'booking-budgetmin'
    );

    const budgetMax = page.getByTestId(
        'booking-budgetmax'
    );

    await expect(budgetMin).toBeVisible();
    await expect(budgetMax).toBeVisible();

    console.log('PW-013: Eelarve aktiveeritud');


    // ==========================================
    // ETAPP 4: Vigane eelarve 500–300 €
    // ==========================================

    await budgetMin.fill('500');
    await budgetMax.fill('300');

    await submitBookingForm(page);

    await expect(
        page.getByTestId('error-budgetmin')
    ).toBeVisible();

    await expect(
        page.getByTestId('error-budgetmax')
    ).toBeVisible();

    console.log(
        'PW-013: Vigane eelarve 500–300 € tuvastati'
    );


    // ==========================================
    // ETAPP 5: Parandame eelarve 300–500 €
    // ==========================================

    await budgetMin.fill('300');
    await budgetMax.fill('500');

    await expect(
        page.getByTestId('error-budgetmin')
    ).toBeHidden();

    await expect(
        page.getByTestId('error-budgetmax')
    ).toBeHidden();

    console.log(
        'PW-013: Eelarve parandamisel veateated kadusid'
    );


    // ==========================================
    // ETAPP 6: Maksimumsumma puudub
    // ==========================================

    await budgetMax.fill('');

    await expect(
        page.getByTestId('error-budgetmax')
    ).toBeVisible();

    console.log(
        'PW-013: Puuduv maksimumsumma tuvastati'
    );


    // ==========================================
    // ETAPP 7: Taastame korrektse eelarve
    // ==========================================

    await budgetMax.fill('500');

    await expect(
        page.getByTestId('error-budgetmax')
    ).toBeHidden();

    await expectBookingFormOpen(page);

    console.log(
        'PW-013: Eelarve valideerimine õnnestus'
    );

});

test('PW-014: Ametipõhiste kohustuslike väljade valideerimine', async ({ page }) => {

    // ==========================================
    // ETAPP 1: Sisselogimine
    // ==========================================

    await loginAsClient(page);

    await expect(page).toHaveURL(/\/home/);

    const notificationModal = page.locator(
        '.modal.show[role="dialog"]'
    );

    if (await notificationModal.isVisible()) {
        await notificationModal.getByRole(
            'button',
            { name: 'Myöhemmin' }
        ).click();

        await expect(notificationModal).toBeHidden();
    }

    // ==========================================
    // ETAPP 2: Tellimisvormi avamine
    // ==========================================

    await page.getByTestId('start-booking').click();

    await expect(page).toHaveURL(/\/client-form/);

    // ==========================================
    // ETAPP 3: Ameti valimine
    // ==========================================

    // Vali amet, millel on vähemalt üks kohustuslik lisaväli.

    // 8. Leiame ameti valimise komponendi
    const professionSelect = page.getByTestId('booking-profession');

    // 9. Kontrollime, et ametivalik on nähtav
    await expect(professionSelect).toBeVisible();

    // 10. Avame ametite nimekirja
    await professionSelect.click();

    // 11. Kontrollime, et ametite nimekiri avanes
    const professionList = page.getByRole('listbox');



    await expect(professionList).toBeVisible();

    // Uurime, millised ametid on nimekirjas
    const options = professionList.getByRole('option');

    console.log('Ametite arv:', await options.count());

    console.log(
        'Ametite nimed:',
        await options.allTextContents()
    );

    console.log(
        'Maalri testielementide arv:',
        await page.getByTestId(
            'profession-option-house_painter'
        ).count()
    );





    await expect(professionList).toBeVisible();

    // 12. Valime soovitud ameti
    const professionOption = page.getByTestId(
        'profession-option-house_painter'
    );

    await expect(professionOption).toBeVisible();

    await professionOption.click();

    // 13. Kontrollime, et ametite nimekiri sulgus
    await expect(professionList).toBeHidden();

    // ==========================================
    // ETAPP 4: Kohustuslike väljade leidmine
    // ==========================================

    const requiredFields = page.locator(
        '.profession-field'
    ).filter({
        has: page.locator('.profession-field__required')
    });

    const requiredCount = await requiredFields.count();

    expect(requiredCount).toBeGreaterThan(0);

    console.log(
        `PW-014: Leiti ${requiredCount} kohustuslikku ametipõhist välja`
    );

    // ==========================================
    // ETAPP 5: Tühja vormi valideerimine
    // ==========================================

    await submitBookingForm(page);

    // Kontrollime iga kohustusliku välja veateadet
    for (let i = 0; i < requiredCount; i++) {

        const field = requiredFields.nth(i);

        const testId = await field.getAttribute('data-testid');

        const fieldKey = testId.replace('custom-field-', '');

        await expect(
            page.getByTestId(`error-custom-${fieldKey}`)
        ).toBeVisible();

        console.log(
            `PW-014: Kohustusliku välja ${fieldKey} veateade ilmus`
        );
    }

    // ==========================================
    // ETAPP 6: Kontrollime vormile jäämist
    // ==========================================

    await expectBookingFormOpen(page);

    console.log(
        'PW-014: Ametipõhiste väljade valideerimine õnnestus'
    );

});

import {
    selectCustomFieldOption
} from './helpers/select.helper.js';

test('PW-015: Ametipõhise välja veateate parandamine', async ({ page }) => {

    // ==========================================
    // ETAPP 1: Sisselogimine
    // ==========================================

    await loginAsClient(page);

    await expect(page).toHaveURL(/\/home/);

    const notificationModal = page.locator(
        '.modal.show[role="dialog"]'
    );

    if (await notificationModal.isVisible()) {
        await notificationModal.getByRole(
            'button',
            { name: 'Myöhemmin' }
        ).click();

        await expect(notificationModal).toBeHidden();
    }


    // ==========================================
    // ETAPP 2: Tellimisvormi avamine
    // ==========================================

    await page.getByTestId('start-booking').click();

    await expect(page).toHaveURL(/\/client-form/);


    // ==========================================
    // ETAPP 3: Ameti house_painter valimine
    // ==========================================

    // 8. Leiame ameti valimise komponendi
    const professionSelect = page.getByTestId('booking-profession');

    // 9. Kontrollime, et ametivalik on nähtav
    await expect(professionSelect).toBeVisible();

    // 10. Avame ametite nimekirja
    await professionSelect.click();

    // 11. Kontrollime, et ametite nimekiri avanes
    const professionList = page.getByRole('listbox');



    await expect(professionList).toBeVisible();



    // 12. Valime soovitud ameti
    const professionOption = page.getByTestId(
        'profession-option-house_painter'
    );

    await expect(professionOption).toBeVisible();

    await professionOption.click();

    // 13. Kontrollime, et ametite nimekiri sulgus
    await expect(professionList).toBeHidden();







    // Kontrollime, et maalri ametipõhised väljad ilmusid
    await expect(
        page.getByTestId('custom-field-propertyType')
    ).toBeVisible();

    console.log(
        'PW-015: Maalri amet valitud ja ametipõhised väljad kuvatud'
    );

    // ==========================================
    // ETAPP 4: Kohustuslike väljade kontroll
    // ==========================================

    const fieldKeys = [
        'propertyType',
        'workLocation',
        'serviceType',
        'surfaceType',
        'surfaceCondition'
    ];

    // Kontrollime, et kõik väljad on olemas
    for (const key of fieldKeys) {

        await expect(
            page.getByTestId(`custom-field-${key}`)
        ).toBeVisible();
    }

    console.log('PW-015: Kõik 5 ametipõhist välja leitud');


    // ==========================================
    // ETAPP 5: Käivitame valideerimise
    // ==========================================

    await submitBookingForm(page);

    for (const key of fieldKeys) {

        await expect(
            page.getByTestId(`error-custom-${key}`)
        ).toBeVisible();
    }

    console.log('PW-015: Kõik 5 veateadet ilmusid');


    // ==========================================
    // ETAPP 6: Valime ühe kohustusliku välja
    // ==========================================

    const selectedKey = 'propertyType';

    await selectCustomFieldOption(
        page,
        selectedKey
    );

    console.log(
        `PW-015: Välja ${selectedKey} väärtus valitud`
    );


    // ==========================================
    // ETAPP 7: Käivitame uuesti valideerimise
    // ==========================================

    await submitBookingForm(page);


    // ==========================================
    // ETAPP 8: Kontrollime parandatud välja
    // ==========================================

    await expect(
        page.getByTestId(`error-custom-${selectedKey}`)
    ).toBeHidden();

    console.log(
        `PW-015: Välja ${selectedKey} veateade kadus`
    );


    // ==========================================
    // ETAPP 9: Kontrollime ülejäänud vigu
    // ==========================================

    for (const key of fieldKeys) {

        if (key === selectedKey) continue;

        await expect(
            page.getByTestId(`error-custom-${key}`)
        ).toBeVisible();
    }

    await expectBookingFormOpen(page);

    console.log(
        'PW-015: Ülejäänud nelja välja veateated jäid nähtavale'
    );

});

test('PW-016: Ametipõhise välja veateade kaob automaatselt', async ({ page }) => {

    // ==========================================
    // ETAPP 1: Sisselogimine
    // ==========================================

    await loginAsClient(page);

    await expect(page).toHaveURL(/\/home/);

    const notificationModal = page.locator(
        '.modal.show[role="dialog"]'
    );

    if (await notificationModal.isVisible()) {

        await notificationModal.getByRole(
            'button',
            { name: 'Myöhemmin' }
        ).click();

        await expect(notificationModal).toBeHidden();
    }


    // ==========================================
    // ETAPP 2: Tellimisvormi avamine
    // ==========================================

    await page.getByTestId('start-booking').click();

    await expect(page).toHaveURL(/\/client-form/);


    // ==========================================
    // ETAPP 3: Ameti valimine
    // ==========================================

    // 8. Leiame ameti valimise komponendi
    const professionSelect = page.getByTestId('booking-profession');

    // 9. Kontrollime, et ametivalik on nähtav
    await expect(professionSelect).toBeVisible();

    // 10. Avame ametite nimekirja
    await professionSelect.click();

    // 11. Kontrollime, et ametite nimekiri avanes
    const professionList = page.getByRole('listbox');



    await expect(professionList).toBeVisible();



    // 12. Valime soovitud ameti
    const professionOption = page.getByTestId(
        'profession-option-house_painter'
    );

    await expect(professionOption).toBeVisible();

    await professionOption.click();

    // 13. Kontrollime, et ametite nimekiri sulgus
    await expect(professionList).toBeHidden();

    // Kontrollime, et maalri ametipõhised väljad ilmusid
    await expect(
        page.getByTestId('custom-field-propertyType')
    ).toBeVisible();

    console.log(
        'PW-015: Maalri amet valitud ja ametipõhised väljad kuvatud'
    );


    // ==========================================
    // ETAPP 4: Kontrollime ametipõhiseid välju
    // ==========================================

    const fieldKeys = [
        'propertyType',
        'workLocation',
        'serviceType',
        'surfaceType',
        'surfaceCondition'
    ];

    for (const key of fieldKeys) {

        await expect(
            page.getByTestId(`custom-field-${key}`)
        ).toBeVisible();
    }

    console.log(
        'PW-016: Kõik 5 kohustuslikku välja kuvatud'
    );


    // ==========================================
    // ETAPP 5: Käivitame valideerimise
    // ==========================================

    await submitBookingForm(page);

    for (const key of fieldKeys) {

        await expect(
            page.getByTestId(`error-custom-${key}`)
        ).toBeVisible();
    }

    console.log(
        'PW-016: Kõik 5 veateadet ilmusid'
    );


    // ==========================================
    // ETAPP 6: Valime propertyType väärtuse
    // ==========================================

    await selectCustomFieldOption(
        page,
        'propertyType'
    );

    console.log(
        'PW-016: propertyType väärtus valitud'
    );


    // ==========================================
    // ETAPP 7: Kontrollime automaatset parandamist
    // ==========================================

    // NB! Siin EI vajuta me uuesti submit-nuppu!

    await expect(
        page.getByTestId('error-custom-propertyType')
    ).toBeHidden();

    console.log(
        'PW-016: propertyType veateade kadus automaatselt'
    );


    // ==========================================
    // ETAPP 8: Ülejäänud veateated
    // ==========================================

    for (const key of fieldKeys) {

        if (key === 'propertyType') continue;

        await expect(
            page.getByTestId(`error-custom-${key}`)
        ).toBeVisible();
    }

    await expectBookingFormOpen(page);

    console.log(
        'PW-016: Ülejäänud 4 veateadet jäid nähtavale'
    );

});

test('PW-017: Ametipõhise välja veateade kaob automaatselt', async({ page }) => {
    // ==========================================
    // ETAPP 1: Sisselogimine
    // ==========================================

    await loginAsClient(page);

    await expect(page).toHaveURL(/\/home/);

    const notificationModal = page.locator(
        '.modal.show[role="dialog"]'
    );

    if (await notificationModal.isVisible()) {

        await notificationModal.getByRole(
            'button',
            { name: 'Myöhemmin' }
        ).click();

        await expect(notificationModal).toBeHidden();
    }


    // ==========================================
    // ETAPP 2: Tellimisvormi avamine
    // ==========================================

    await page.getByTestId('start-booking').click();

    await expect(page).toHaveURL(/\/client-form/);


    // ==========================================
    // ETAPP 3: Ameti valimine
    // ==========================================

    // 8. Leiame ameti valimise komponendi
    const professionSelect = page.getByTestId('booking-profession');

    // 9. Kontrollime, et ametivalik on nähtav
    await expect(professionSelect).toBeVisible();

    // 10. Avame ametite nimekirja
    await professionSelect.click();

    // 11. Kontrollime, et ametite nimekiri avanes
    const professionList = page.getByRole('listbox');



    await expect(professionList).toBeVisible();



    // 12. Valime soovitud ameti
    const professionOption = page.getByTestId(
        'profession-option-house_painter'
    );

    await expect(professionOption).toBeVisible();

    await professionOption.click();

    // 13. Kontrollime, et ametite nimekiri sulgus
    await expect(professionList).toBeHidden();

    // Kontrollime, et maalri ametipõhised väljad ilmusid
    await expect(
        page.getByTestId('custom-field-propertyType')
    ).toBeVisible();

    console.log(
        'PW-015: Maalri amet valitud ja ametipõhised väljad kuvatud'
    );






    const fieldKeys = [
        'propertyType',
        'workLocation',
        'serviceType',
        'surfaceType',
        'surfaceCondition'
    ];

    for (const key of fieldKeys) {

        await expect(
            page.getByTestId(`custom-field-${key}`)
        ).toBeVisible();
    }

    console.log(
        'PW-016: Kõik 5 kohustuslikku välja kuvatud'
    );








    // ==========================================
    // PW-017: Valiku eemaldamine ja vea taastamine
    // ==========================================

    const propertyType = page.getByTestId(
        'custom-field-propertyType'
    );

    const propertyTypeError = page.getByTestId(
        'error-custom-propertyType'
    );

    // 1. Käivitame valideerimise
    await submitBookingForm(page);

    // 2. Veateade peab ilmuma
    await expect(propertyTypeError).toBeVisible();

    console.log('PW-017: Kohustusliku välja veateade ilmus');

    // 3. Valime väärtuse
    await selectCustomFieldOption(page, 'propertyType');

    // 4. Veateade peab automaatselt kaduma
    await expect(propertyTypeError).toBeHidden();

    console.log('PW-017: Veateade kadus pärast valimist');

    // 5. Eemaldame valiku PrimeVue Clear-nupuga
    const clearButton = propertyType.locator(
        '.p-select-clear-icon'
    );

    await expect(clearButton).toBeVisible();

    await clearButton.click();

    // 6. Veateade peab automaatselt tagasi ilmuma
    await expect(propertyTypeError).toBeVisible();

    console.log('PW-017: Veateade ilmus pärast valiku eemaldamist');

    // 7. Valime uuesti väärtuse
    await selectCustomFieldOption(page, 'propertyType');

    // 8. Veateade peab uuesti kaduma
    await expect(propertyTypeError).toBeHidden();

    console.log('PW-017: Veateade kadus pärast uut valikut');

    // 9. Kontrollime, et oleme endiselt tellimisvormil
    await expectBookingFormOpen(page);

    console.log('PW-017: Valideerimine mõlemas suunas õnnestus');

});

import {
    selectCustomMultiOptions
} from './helpers/select.helper.js';

test('PW-018: MultiSelect kohustusliku välja valideerimine', async ({ page }) => {

    // ==========================================
    // ETAPP 1: Sisselogimine
    // ==========================================

    await loginAsClient(page);

    await expect(page).toHaveURL(/\/home/);

    const notificationModal = page.locator(
        '.modal.show[role="dialog"]'
    );

    if (await notificationModal.isVisible()) {
        await notificationModal.getByRole(
            'button',
            { name: 'Myöhemmin' }
        ).click();

        await expect(notificationModal).toBeHidden();
    }

    // ==========================================
    // ETAPP 2: Tellimisvormi avamine
    // ==========================================

    await page.getByTestId('start-booking').click();

    await expectBookingFormOpen(page);

    // ==========================================
    // ETAPP 3: Maalri ameti valimine
    // ==========================================

    // 8. Leiame ameti valimise komponendi
    const professionSelect = page.getByTestId('booking-profession');

    // 9. Kontrollime, et ametivalik on nähtav
    await expect(professionSelect).toBeVisible();

    // 10. Avame ametite nimekirja
    await professionSelect.click();

    // 11. Kontrollime, et ametite nimekiri avanes
    const professionList = page.getByRole('listbox');



    await expect(professionList).toBeVisible();



    // 12. Valime soovitud ameti
    const professionOption = page.getByTestId(
        'profession-option-house_painter'
    );

    await expect(professionOption).toBeVisible();

    await professionOption.click();

    // 13. Kontrollime, et ametite nimekiri sulgus
    await expect(professionList).toBeHidden();

    // Kontrollime, et maalri ametipõhised väljad ilmusid
    await expect(
        page.getByTestId('custom-field-propertyType')
    ).toBeVisible();

    console.log(
        'PW-015: Maalri amet valitud ja ametipõhised väljad kuvatud'
    );

    // ==========================================
    // ETAPP 4: MultiSelecti leidmine
    // ==========================================

    const field = page.getByTestId(
        'custom-field-workLocation'
    );

    const multiSelect = field.locator('.p-multiselect');

    const error = page.getByTestId(
        'error-custom-workLocation'
    );

    await expect(multiSelect).toBeVisible();

    console.log('PW-018: workLocation MultiSelect leitud');

    // ==========================================
    // ETAPP 5: Tühja välja valideerimine
    // ==========================================

    await submitBookingForm(page);

    await expect(error).toBeVisible();

    console.log('PW-018: Tühja välja veateade ilmus');

    // ==========================================
    // ETAPP 6: Kahe väärtuse valimine
    // ==========================================

    await selectCustomMultiOptions(
        page,
        'workLocation',
        2
    );

    // Veateade peab automaatselt kaduma
    await expect(error).toBeHidden();

    console.log('PW-018: Kaks väärtust valitud, veateade kadus');

    // ==========================================
    // ETAPP 7: Esimese väärtuse eemaldamine
    // ==========================================

    const chips = multiSelect.locator(
        '.p-multiselect-chip'
    );

    await expect(chips).toHaveCount(2);

    await chips.first().locator(
        '.p-chip-remove-icon'
    ).click();

    await expect(chips).toHaveCount(1);

    // Üks väärtus on alles, seega viga ei tohi ilmuda
    await expect(error).toBeHidden();

    console.log(
        'PW-018: Üks väärtus eemaldatud, veateadet ei ilmunud'
    );

    // ==========================================
    // ETAPP 8: Viimase väärtuse eemaldamine
    // ==========================================

    await chips.first().locator(
        '.p-chip-remove-icon'
    ).click();

    await expect(chips).toHaveCount(0);

    // Kohustuslik väli on nüüd tühi
    await expect(error).toBeVisible();

    console.log(
        'PW-018: Viimane väärtus eemaldatud, veateade ilmus'
    );

    // ==========================================
    // ETAPP 9: Vormile jäämise kontroll
    // ==========================================

    await expectBookingFormOpen(page);

    console.log(
        'PW-018: MultiSelect valideerimine õnnestus'
    );

});

import {
    createBookingAndVerify,
    deleteTestBooking,
    findBookingCard,
    deleteTestBookingByApi
} from './helpers/booking.helper.js'

import {
    fillHousePainterBookingForm
} from './helpers/booking-form.helper.js'


test(
    'PW-019: Tellimuse loomine ja salvestamine MongoDB-sse',
    async ({ page }) => {

        // Annab testile 3 minutit aega, et vältida aegumise vigu
        

        let bookingId = null;

        try {

            // ==========================================
            // ETAPP 1: Tellimisvormi täitmine
            // ==========================================

            const testHeader =
                `PW-019 Playwright test ${Date.now()}`;

            const formData =
                await fillHousePainterBookingForm(
                    page,
                    testHeader
                );

            // ==========================================
            // ETAPP 2: Tellimuse loomine
            // ==========================================

            const booking = await createBookingAndVerify(
                page,
                'house_painter'
            );

            bookingId = booking.id || booking._id;

            // ==========================================
            // ETAPP 3: Salvestatud andmete kontroll
            // ==========================================

            expect(booking.header).toBe(formData.header);

            expect(booking.address).toBe(
                formData.address.address
            );

            expect(booking.latitude).toBe(
                formData.address.lat
            );

            expect(booking.longitude).toBe(
                formData.address.lng
            );

            expect(booking.zone).toBe(formData.zone);

            // ==========================================
            // ETAPP 4: Suunamise kontroll
            // ==========================================

            await expect(page).toHaveURL(
                /\/client-panel/,
                { timeout: 15000 }
            );

            console.log(
                'PW-019: Tellimuse loomise test õnnestus!'
            );

        } finally {

            if (bookingId) {
                await deleteTestBooking(page, bookingId);
            }
        }
    }
);

test(
    'PW-020: Tellimus säilib pärast lehe värskendamist',
    async ({ page }) => {

        let bookingId = null;

        try {
            // ==========================================
            // ETAPP 1: Tellimuse loomine
            // ==========================================

            const testHeader =
                `PW-020 Playwright test ${Date.now()}`;

            await fillHousePainterBookingForm(
                page,
                testHeader
            );

            const booking = await createBookingAndVerify(
                page,
                'house_painter'
            );

            bookingId = booking.id || booking._id;

            await expect(page).toHaveURL(
                /\/client-panel/,
                { timeout: 15000 }
            );

            // ==========================================
            // ETAPP 2: Tellimuse kuvamise kontroll
            // ==========================================

            const bookingCard = findBookingCard(
                page,
                testHeader
            );

            await expect(bookingCard).toHaveCount(1);
            await expect(bookingCard).toBeVisible();

            await expect(
                bookingCard.locator('.order-card__title')
            ).toHaveText(testHeader);

            console.log(
                'PW-020: Tellimus kuvatakse kliendi nimekirjas'
            );

            // ==========================================
            // ETAPP 3: Lehe värskendamine
            // ==========================================

            await page.reload();

            await expect(page).toHaveURL(
                /\/client-panel/
            );

            // ==========================================
            // ETAPP 4: Tellimuse uuesti kuvamine
            // ==========================================

            const reloadedBookingCard = findBookingCard(
                page,
                testHeader
            );

            await expect(reloadedBookingCard).toHaveCount(1);
            await expect(reloadedBookingCard).toBeVisible();

            await expect(
                reloadedBookingCard.locator(
                    '.order-card__title'
                )
            ).toHaveText(testHeader);

            console.log(
                'PW-020: Tellimus säilis pärast lehe värskendamist'
            );

        } finally {
            // ==========================================
            // ETAPP 5: Testandmete kustutamine
            // ==========================================

            if (bookingId) {
                await deleteTestBooking(page, bookingId);
            }
        }
    }
);

import {
    createTemporaryProvider
} from './helpers/provider-setup.helper.js';

import { deleteTestProvider } from './helpers/provider.helper.js';


test(
    'PW-029: Tellimus edastatakse õige ametiga pakkujale',
    async ({ browser, request }) => {

        test.setTimeout(180000);

        let clientToken = null;

        const painterContext = await browser.newContext();
        const electricianContext = await browser.newContext();

        const painterPage = await painterContext.newPage();
        const electricianPage = await electricianContext.newPage();

        const createdProviders = [];
        const createdUserIds = [];

        let painterUserId = null;
        let electricianUserId = null;

        const clientContext = await browser.newContext();
        const clientPage = await clientContext.newPage();

        let bookingId = null;

        try {
            // ==========================================
            // ETAPP 1: Maalri registreerimine
            // ==========================================

            const painter = await createTemporaryProvider(
                painterPage,
                {
                    profession: 'house_painter',

                    onUserCreated: id => {
                        painterUserId = id;
                        createdUserIds.push(id);
                    },

                    onProviderCreated: id => {
                        createdProviders.push({
                            providerId: id,
                            userId: painterUserId
                        });
                    }
                }
            );

            console.log(
                'Maalri Provider ID:',
                painter.providerId
            );

            // ==========================================
            // ETAPP 2: Elektriku registreerimine
            // ==========================================

            const electrician = await createTemporaryProvider(
                electricianPage,
                {
                    profession: 'electrician',

                    onUserCreated: id => {
                        electricianUserId = id;
                        createdUserIds.push(id);
                    },

                    onProviderCreated: id => {
                        createdProviders.push({
                            providerId: id,
                            userId: electricianUserId
                        });
                    }
                }
            );

            console.log(
                'Elektriku Provider ID:',
                electrician.providerId
            );

            // ==========================================
            // ETAPP 3: Kontrollime ameteid
            // ==========================================

            expect(painter.provider.profession).toContain(
                'house_painter'
            );

            expect(electrician.provider.profession).toContain(
                'electrician'
            );

            console.log(
                'PW-029: Mõlemad Providerid loodud!'
            );

            // ==========================================
            // Pakkujad valmistuvad tellimuse vastuvõtuks
            // ==========================================

            await painterPage.goto(
                'http://localhost:5174/admin/provider'
            );

            await electricianPage.goto(
                'http://localhost:5174/admin/provider'
            );

            await expect(painterPage).toHaveURL(
                /\/admin\/provider/
            );

            await expect(electricianPage).toHaveURL(
                /\/admin\/provider/
            );


            // ==========================================
            // ETAPP: Socket.io ühenduste kontroll
            // ==========================================

            await painterPage.waitForFunction(
                () => window.__E2E_SOCKET__?.connected === true,
                null,
                { timeout: 15000 }
            );

            await electricianPage.waitForFunction(
                () => window.__E2E_SOCKET__?.connected === true,
                null,
                { timeout: 15000 }
            );

            console.log(
                'PW-029: Mõlema Provideri Socket.io ühendus aktiivne'
            );


            // ==========================================
            // Socket.io sündmuste jälgimine
            // ==========================================

            await painterPage.evaluate(() => {
                window.__E2E_BOOKING_EVENTS__ = [];

                window.__E2E_SOCKET__.on(
                    'handle-create-booking-multiple',
                    (userId, bookingId) => {
                        window.__E2E_BOOKING_EVENTS__.push({
                            userId: String(userId),
                            bookingId: String(bookingId)
                        });
                    }
                );
            });

            await electricianPage.evaluate(() => {
                window.__E2E_BOOKING_EVENTS__ = [];

                window.__E2E_SOCKET__.on(
                    'handle-create-booking-multiple',
                    (userId, bookingId) => {
                        window.__E2E_BOOKING_EVENTS__.push({
                            userId: String(userId),
                            bookingId: String(bookingId)
                        });
                    }
                );
            });

            // ==========================================
            // ETAPP 4: Ajutise kliendi registreerimine
            // ==========================================

            const { userId: clientUserId } =
                await registerAndLoginAsClient(clientPage);

            createdUserIds.push(clientUserId);

            console.log('Kliendi kasutaja ID:', clientUserId);

            // ==========================================
            // ETAPP 5: Tellimuse loomine
            // ==========================================

            const savedUsername = await clientPage.evaluate(() => {
                const saved =
                    localStorage.getItem('loggedAppUser') ||
                    sessionStorage.getItem('loggedAppUser');

                return saved
                    ? JSON.parse(saved).username
                    : null;
            });

            console.log(
                'PW-029 sisselogitud klient:',
                savedUsername
            );

            expect(savedUsername).toBeTruthy();


            clientPage.on('console', message => {
                const text = message.text();

                if (text.includes('[PW-029')) {
                    console.log('[CLIENT BROWSER]', text);
                }
            });

            clientPage.on('pageerror', error => {
                console.error(
                    '[CLIENT PAGE ERROR]',
                    error.message
                );
            });


            clientToken = await clientPage.evaluate(() => {
                const savedUser =
                    localStorage.getItem('loggedAppUser') ||
                    sessionStorage.getItem('loggedAppUser');

                if (!savedUser) return null;

                return JSON.parse(savedUser).token;
            });

            expect(clientToken).toBeTruthy();

            const testHeader =
                `PW-029 Playwright test ${Date.now()}`;

            await fillHousePainterBookingForm(
                clientPage,
                testHeader,
                {
                    skipLogin: true
                }
            );

            const booking = await createBookingAndVerify(
                clientPage,
                'house_painter'
            );

            clientPage.on('pageerror', error => {
                console.error(
                    '[PW-029 CLIENT ERROR]',
                    error.message
                );
            });

            console.log('PW-029 booking result:', booking);

            bookingId = booking.id ?? booking._id;

            console.log('PW-029 bookingId:', bookingId);

            expect(bookingId).toBeTruthy();


            expect(booking.professional).toContain(
                'house_painter'
            );

            await expect(clientPage).toHaveURL(
                url => url.pathname === '/client-panel',
                { timeout: 15000 }
            );

            console.log(
                'PW-029: Kliendi tellimus loodud:',
                bookingId
            );


            // ==========================================
            // Reaalajas tellimuse saabumise kontroll
            // ==========================================

            const painterBooking = painterPage.locator(
                `.booking-row-new[data-testid="provider-booking-${bookingId}"]`
            ).first();

            const electricianBooking = electricianPage.locator(
                `.booking-row-new[data-testid="provider-booking-${bookingId}"]`
            );

            // ==========================================
            // SOCKET.IO DIAGNOSTIKA
            // ==========================================

            const painterEvents = await painterPage.evaluate(() => {
                return window.__E2E_BOOKING_EVENTS__ ?? [];
            });

            const electricianEvents = await electricianPage.evaluate(() => {
                return window.__E2E_BOOKING_EVENTS__ ?? [];
            });

            console.log(
                'PW-029 Painter Socket events:',
                painterEvents
            );

            console.log(
                'PW-029 Electrician Socket events:',
                electricianEvents
            );


            // Maaler peab tellimuse saama ilma lehte värskendamata.
            await expect(painterBooking).toBeVisible({
                timeout: 15000
            });

            // Elektrik ei tohi maalritöö tellimust saada.
            await expect(electricianBooking).toHaveCount(0);

            console.log(
                'PW-029: Tellimus jõudis maalrile, kuid mitte elektrikule'
            );


            /* await painterPage.getByTestId(
                `provider-booking-open-${bookingId}`
            ).click(); */


            // ==========================================
            // Maalri tellimuse detailvaate avamine
            // ==========================================

            const painterBookingOpen = painterPage.locator(
                `.booking-row-new span.new_notification[data-testid="provider-booking-${bookingId}"]`
            ).first();

            await expect(painterBookingOpen).toBeVisible({
                timeout: 15000
            });

            await painterBookingOpen.click();

            console.log(
                '[PW-029] Maalri tellimus avatud'
            );

            await expect(
                painterPage.getByTestId('provider-booking-header')
            ).toHaveText(testHeader, {
                timeout: 15000
            });


            // Kontrollime avatud tellimuse pealkirja
            await expect(
                painterPage.getByTestId('provider-booking-header')
            ).toHaveText(testHeader, {
                timeout: 15000
            });

            // ==========================================
            // Kontrollime tellimuse olekut pärast reload'i
            // ==========================================

            await painterPage.reload();

            // Tellimus peab olema juba vaadatud
            const bookingAfterReload = painterPage.locator(
                `.booking-row-seen[data-testid="provider-booking-${bookingId}"]`
            ).first();

            // Kontrollime, et tellimus on nähtav
            await expect(bookingAfterReload).toBeVisible({
                timeout: 15000
            });

            console.log(
                '[PW-029] Tellimus säilis pärast reloadi olekus booking-row-seen'
            );

            // Kontrollime, et tellimus on endiselt nähtav
            await expect(bookingAfterReload).toBeVisible({
                timeout: 15000
            });

            console.log(
                '[PW-029] Tellimus on nähtav ka pärast lehe värskendamist'
            );
            

        } finally {

            // ==========================================
            // ETAPP 4: Testandmete kustutamine
            // ==========================================

            // 1. Kustutame tellimuse API kaudu
            if (bookingId) {

                try {

                    await deleteTestBookingByApi(
                        request,
                        bookingId,
                        clientToken
                    );

                    console.log(
                        "[PW-029 CLEANUP] Booking deleted:",
                        bookingId
                    );

                } catch (error) {

                    console.error(
                        "[PW-029 CLEANUP] Booking deletion failed:",
                        bookingId,
                        error.message
                    );
                }
            }

            // 2. Kustutame Providerid
            for (const provider of [...createdProviders].reverse()) {

                try {

                    await deleteTestProvider(
                        provider.providerId,
                        provider.userId
                    );

                    console.log(
                        "[PW-029 CLEANUP] Provider deleted:",
                        provider.providerId
                    );

                } catch (error) {

                    console.error(
                        "[PW-029 CLEANUP] Provider deletion failed:",
                        provider.providerId,
                        error.message
                    );
                }
            }

            // 3. Kustutame kasutajad
            for (const userId of [...createdUserIds].reverse()) {

                try {

                    await deleteTestUser(userId);

                    console.log(
                        "[PW-029 CLEANUP] User deleted:",
                        userId
                    );

                } catch (error) {

                    console.error(
                        "[PW-029 CLEANUP] User deletion failed:",
                        userId,
                        error.message
                    );
                }
            }

            // 4. Sulgeme brauserikontekstid
            const contexts = [
                clientContext,
                painterContext,
                electricianContext
            ].filter(Boolean);

            const closeResults = await Promise.allSettled(
                contexts.map(context => context.close())
            );

            for (const result of closeResults) {

                if (result.status === "rejected") {

                    console.error(
                        "[PW-029 CLEANUP] Context close failed:",
                        result.reason?.message
                    );
                }
            }

            console.log(
                "[PW-029 CLEANUP] Cleanup completed"
            );
        }
    }
);

test(
    'PW-030: Pakkuja saadab kliendi tellimusele hinnapakkumise',
    async ({ browser, request }) => {

        test.setTimeout(180000);

        let clientToken = null;
        let bookingId = null;
        let painterUserId = null;

        const createdProviders = [];
        const createdUserIds = [];

        const painterContext = await browser.newContext();
        const clientContext = await browser.newContext();

        const painterPage = await painterContext.newPage();
        const clientPage = await clientContext.newPage();

        try {

            // ==========================================
            // ETAPP 1: Maalri registreerimine
            // ==========================================

            const painter = await createTemporaryProvider(
                painterPage,
                {
                    profession: 'house_painter',

                    onUserCreated: id => {
                        painterUserId = id;
                        createdUserIds.push(id);
                    },

                    onProviderCreated: id => {
                        createdProviders.push({
                            providerId: id,
                            userId: painterUserId
                        });
                    }
                }
            );

            expect(painter.provider.profession).toContain(
                'house_painter'
            );

            console.log(
                '[PW-030] Maaler registreeritud:',
                painter.providerId
            );


            // ==========================================
            // ETAPP 2: Maaler avab pakkuja lehe
            // ==========================================

            await painterPage.goto(
                'http://localhost:5174/admin/provider'
            );

            await expect(painterPage).toHaveURL(
                /\/admin\/provider/
            );

            await painterPage.waitForFunction(
                () => window.__E2E_SOCKET__?.connected === true,
                null,
                { timeout: 15000 }
            );


            // ==========================================
            // ETAPP 3: Kliendi registreerimine
            // ==========================================

            const { userId: clientUserId } =
                await registerAndLoginAsClient(clientPage);

            createdUserIds.push(clientUserId);

            clientToken = await clientPage.evaluate(() => {

                const savedUser =
                    localStorage.getItem('loggedAppUser') ||
                    sessionStorage.getItem('loggedAppUser');

                return savedUser
                    ? JSON.parse(savedUser).token
                    : null;
            });

            expect(clientToken).toBeTruthy();

            console.log(
                '[PW-030] Klient registreeritud:',
                clientUserId
            );


            // ==========================================
            // ETAPP 4: Klient loob maalritöö tellimuse
            // ==========================================

            const testHeader =
                `PW-030 Playwright test ${Date.now()}`;

            await fillHousePainterBookingForm(
                clientPage,
                testHeader,
                {
                    skipLogin: true
                }
            );

            const booking = await createBookingAndVerify(
                clientPage,
                'house_painter'
            );

            bookingId = booking.id ?? booking._id;

            expect(bookingId).toBeTruthy();

            expect(booking.professional).toContain(
                'house_painter'
            );

            await expect(clientPage).toHaveURL(
                url => url.pathname === '/client-panel',
                { timeout: 15000 }
            );

            // Hinnapakkumiste küsimiseks loodud tellimus
            expect(booking.isIncludeOffers).toBe(true);

            console.log(
                '[PW-030] Tellimus loodud:',
                bookingId
            );


            // ==========================================
            // ETAPP 5: Maaler saab tellimuse
            // ==========================================

            const painterBooking = painterPage.locator(
                `.booking-row-new[data-testid="provider-booking-${bookingId}"]`
            ).first();

            await expect(painterBooking).toBeVisible({
                timeout: 15000
            });

            console.log(
                '[PW-030] Tellimus jõudis maalrile'
            );


            // ==========================================
            // ETAPP 6: Maaler avab tellimuse
            // ==========================================

            const painterBookingOpen = painterPage.locator(
                `.booking-row-new span.new_notification[data-testid="provider-booking-${bookingId}"]`
            ).first();

            await painterBookingOpen.click();

            await expect(
                painterPage.getByTestId('provider-booking-header')
            ).toHaveText(testHeader, {
                timeout: 15000
            });

            console.log(
                '[PW-030] Maaler avas tellimuse'
            );


            // ==========================================
            // ETAPP 7: Hinnapakkumise vormi avamine
            // ==========================================

            await expect(
                painterPage.getByTestId('open-offer-panel')
            ).toBeVisible({
                timeout: 15000
            });

            await painterPage.getByTestId(
                'open-offer-panel'
            ).click();

            await expect(
                painterPage.getByTestId('offer-input')
            ).toBeVisible();

            console.log(
                '[PW-030] Hinnapakkumise vorm avatud'
            );


            // ==========================================
            // ETAPP 8: Hinnapakkumise täitmine
            // ==========================================

            const offerPrice = 250;

            const offerDescription =
                'PW-030 Playwright test offer';

            await painterPage.getByTestId(
                'offer-input'
            ).fill(String(offerPrice));

            await painterPage.getByTestId(
                'offer-at-client-radio'
            ).check();

            await painterPage.getByTestId(
                'offer-details'
            ).fill(offerDescription);

            await expect(
                painterPage.getByTestId('offer-confirm-btn')
            ).toBeEnabled();

            console.log(
                '[PW-030] Hinnapakkumise vorm täidetud'
            );


            // ==========================================
            // ETAPP 9: Hinnapakkumise saatmine
            // ==========================================

            const offerResponsePromise =
                painterPage.waitForResponse(
                    response =>
                        new URL(response.url()).pathname ===
                        '/api/offer' &&
                        response.request().method() === 'POST'
                );

            await painterPage.getByTestId(
                'offer-confirm-btn'
            ).click();

            const offerResponse = await offerResponsePromise;

            expect(offerResponse.status()).toBe(201);

            const offerResult = await offerResponse.json();

            expect(offerResult.success).toBe(true);

            expect(offerResult.offer).toBeTruthy();

            console.log(
                '[PW-030] Backend kinnitas pakkumise salvestamise'
            );


            // ==========================================
            // ETAPP 10: Salvestatud pakkumise kontroll
            // ==========================================

            const savedOffer = offerResult.offer;

            expect(String(savedOffer.bookingID)).toBe(
                String(bookingId)
            );

            expect(String(savedOffer.sender)).toBe(
                String(painterUserId)
            );

            expect(String(savedOffer.provider)).toBe(
                String(painter.providerId)
            );

            expect(Number(savedOffer.price)).toBe(
                offerPrice
            );

            expect(savedOffer.description).toBe(
                offerDescription
            );

            expect(savedOffer.placeOrGo).toBe('go');

            expect(String(offerResult.bookingId)).toBe(
                String(bookingId)
            );

            console.log(
                '[PW-030] Salvestatud pakkumise andmed õiged:',
                savedOffer._id
            );


            // ==========================================
            // ETAPP 11: Pakkuja kaardi oleku kontroll
            // ==========================================

            const completedBooking = painterPage.locator(
                `.booking-row-done[data-testid="provider-booking-${bookingId}"]`
            ).first();

            await expect(completedBooking).toBeVisible({
                timeout: 15000
            });

            console.log(
                '[PW-030] Tellimuse kaart on olekus booking-row-done'
            );


            // ==========================================
            // ETAPP 12: Kontroll pärast reload'i
            // ==========================================

            await painterPage.reload();

            const bookingAfterReload = painterPage.locator(
                `.booking-row-done[data-testid="provider-booking-${bookingId}"]`
            ).first();

            await expect(bookingAfterReload).toBeVisible({
                timeout: 15000
            });

            console.log(
                '[PW-030] Pakkumise olek säilis pärast reloadi'
            );

            console.log(
                '[PW-030] TEST EDUKALT LÄBITUD'
            );

        } finally {

            // ==========================================
            // TESTANDMETE KUSTUTAMINE
            // ==========================================

            // 1. Tellimus koos hinnapakkumistega

            if (bookingId) {
                try {
                    await deleteTestBookingByApi(
                        request,
                        bookingId,
                        clientToken
                    );

                    console.log(
                        '[PW-030 CLEANUP] Booking deleted:',
                        bookingId
                    );

                } catch (error) {
                    console.error(
                        '[PW-030 CLEANUP] Booking deletion failed:',
                        error.message
                    );
                }
            }


            // 2. Pakkujad

            for (const provider of [...createdProviders].reverse()) {
                try {
                    await deleteTestProvider(
                        provider.providerId,
                        provider.userId
                    );

                    console.log(
                        '[PW-030 CLEANUP] Provider deleted:',
                        provider.providerId
                    );

                } catch (error) {
                    console.error(
                        '[PW-030 CLEANUP] Provider deletion failed:',
                        error.message
                    );
                }
            }


            // 3. Kasutajad

            for (const userId of [...createdUserIds].reverse()) {
                try {
                    await deleteTestUser(userId);

                    console.log(
                        '[PW-030 CLEANUP] User deleted:',
                        userId
                    );

                } catch (error) {
                    console.error(
                        '[PW-030 CLEANUP] User deletion failed:',
                        error.message
                    );
                }
            }


            // 4. Brauserikontekstid

            const contexts = [
                clientContext,
                painterContext
            ];

            const closeResults = await Promise.allSettled(
                contexts.map(context => context.close())
            );

            for (const result of closeResults) {
                if (result.status === 'rejected') {
                    console.error(
                        '[PW-030 CLEANUP] Context close failed:',
                        result.reason?.message
                    );
                }
            }

            console.log(
                '[PW-030 CLEANUP] Cleanup completed'
            );
        }
    }
);


const setupBookingWithOffer = async ({ browser, request }) => {
    let clientToken = null;
    let bookingId = null;
    let painterUserId = null;

    const createdProviders = [];
    const createdUserIds = [];
    const contexts = [];

    const cleanup = async () => {
        if (bookingId) {
            try {
                await deleteTestBookingByApi(request, bookingId, clientToken);
                console.log('[OFFER CLEANUP] Booking deleted:', bookingId);
            } catch (error) {
                console.error('[OFFER CLEANUP] Booking:', error.message);
            }
        }

        for (const provider of [...createdProviders].reverse()) {
            try {
                await deleteTestProvider(provider.providerId, provider.userId);
            } catch (error) {
                console.error('[OFFER CLEANUP] Provider:', error.message);
            }
        }

        for (const userId of [...createdUserIds].reverse()) {
            try {
                await deleteTestUser(userId);
            } catch (error) {
                console.error('[OFFER CLEANUP] User:', error.message);
            }
        }

        const results = await Promise.allSettled(
            contexts.map(context => context.close())
        );

        for (const result of results) {
            if (result.status === 'rejected') {
                console.error(
                    '[OFFER CLEANUP] Context:',
                    result.reason?.message
                );
            }
        }

        console.log('[OFFER CLEANUP] Completed');
    };

    try {
        const painterContext = await browser.newContext();
        contexts.push(painterContext);

        const clientContext = await browser.newContext();
        contexts.push(clientContext);

        const painterPage = await painterContext.newPage();
        const clientPage = await clientContext.newPage();

        // ETAPP 1: Maalri registreerimine
        const painter = await createTemporaryProvider(
            painterPage,
            {
                profession: 'house_painter',

                onUserCreated: id => {
                    painterUserId = id;
                    createdUserIds.push(id);
                },

                onProviderCreated: id => {
                    createdProviders.push({
                        providerId: id,
                        userId: painterUserId
                    });
                }
            }
        );

        expect(painter.provider.profession).toContain('house_painter');

        // ETAPP 2: Maaler avab pakkuja lehe
        await painterPage.goto(
            'http://localhost:5174/admin/provider'
        );

        await expect(painterPage).toHaveURL(/\/admin\/provider/);

        await painterPage.waitForFunction(
            () => window.__E2E_SOCKET__?.connected === true,
            null,
            { timeout: 15000 }
        );

        // ETAPP 3: Kliendi registreerimine
        const { userId: clientUserId } =
            await registerAndLoginAsClient(clientPage);

        createdUserIds.push(clientUserId);

        clientToken = await clientPage.evaluate(() => {
            const savedUser =
                localStorage.getItem('loggedAppUser') ||
                sessionStorage.getItem('loggedAppUser');

            return savedUser
                ? JSON.parse(savedUser).token
                : null;
        });

        expect(clientToken).toBeTruthy();

        // ETAPP 4: Klient loob maalritöö tellimuse
        const testHeader =
            `PW-OFFER Playwright test ${Date.now()}`;

        await fillHousePainterBookingForm(
            clientPage,
            testHeader,
            { skipLogin: true }
        );

        const booking = await createBookingAndVerify(
            clientPage,
            'house_painter'
        );

        bookingId = booking.id ?? booking._id;

        expect(bookingId).toBeTruthy();
        expect(booking.professional).toContain('house_painter');
        expect(booking.isIncludeOffers).toBe(true);

        await expect(clientPage).toHaveURL(
            url => url.pathname === '/client-panel',
            { timeout: 15000 }
        );

        // Socket.io ühenduse kontroll
        await clientPage.waitForFunction(
            () => window.__E2E_SOCKET__?.connected === true,
            null,
            { timeout: 15000 }
        );

        // Registreerime kuulaja ENNE pakkumise saatmist
        await clientPage.evaluate(() => {
            window.__E2E_CLIENT_OFFER_EVENTS__ = [];

            window.__E2E_SOCKET__.on(
                'client-use-offer',
                (bookingID, offer) => {
                    window.__E2E_CLIENT_OFFER_EVENTS__.push({
                        bookingID: String(bookingID),
                        offer
                    });
                }
            );
        });

        // ETAPP 5: Maaler saab tellimuse
        const painterBooking = painterPage.locator(
            `.booking-row-new[data-testid="provider-booking-${bookingId}"]`
        ).first();

        await expect(painterBooking).toBeVisible({
            timeout: 15000
        });

        // ETAPP 6: Maaler avab tellimuse
        const painterBookingOpen = painterPage.locator(
            `.booking-row-new span.new_notification[data-testid="provider-booking-${bookingId}"]`
        ).first();

        await painterBookingOpen.click();

        await expect(
            painterPage.getByTestId('provider-booking-header')
        ).toHaveText(testHeader, {
            timeout: 15000
        });

        // ETAPP 7: Hinnapakkumise vormi avamine
        await expect(
            painterPage.getByTestId('open-offer-panel')
        ).toBeVisible({ timeout: 15000 });

        await painterPage.getByTestId(
            'open-offer-panel'
        ).click();

        await expect(
            painterPage.getByTestId('offer-input')
        ).toBeVisible();

        // ETAPP 8: Hinnapakkumise täitmine
        const offerPrice = 250;
        const offerDescription = 'PW-030 Playwright test offer';

        await painterPage.getByTestId(
            'offer-input'
        ).fill(String(offerPrice));

        await painterPage.getByTestId(
            'offer-at-client-radio'
        ).check();

        await painterPage.getByTestId(
            'offer-details'
        ).fill(offerDescription);

        await expect(
            painterPage.getByTestId('offer-confirm-btn')
        ).toBeEnabled();

        // ETAPP 9: Hinnapakkumise saatmine
        const offerResponsePromise =
            painterPage.waitForResponse(
                response =>
                    new URL(response.url()).pathname === '/api/offer' &&
                    response.request().method() === 'POST'
            );

        await painterPage.getByTestId(
            'offer-confirm-btn'
        ).click();

        const offerResponse = await offerResponsePromise;

        expect(offerResponse.status()).toBe(201);

        const offerResult = await offerResponse.json();

        expect(offerResult.success).toBe(true);
        expect(offerResult.offer).toBeTruthy();

        const savedOffer = offerResult.offer;

        expect(String(savedOffer.bookingID)).toBe(String(bookingId));
        expect(String(savedOffer.sender)).toBe(String(painterUserId));
        expect(String(savedOffer.provider)).toBe(String(painter.providerId));
        expect(Number(savedOffer.price)).toBe(offerPrice);
        expect(savedOffer.description).toBe(offerDescription);
        expect(savedOffer.placeOrGo).toBe('go');
        expect(String(offerResult.bookingId)).toBe(String(bookingId));

        // Kontrollime pakkuja kaardi olekut
        const completedBooking = painterPage.locator(
            `.booking-row-done[data-testid="provider-booking-${bookingId}"]`
        ).first();

        await expect(completedBooking).toBeVisible({
            timeout: 15000
        });

        console.log(
            '[OFFER SETUP] Booking and offer created:',
            bookingId
        );

        return {
            painterPage,
            clientPage,
            bookingId,
            painterUserId,
            clientToken,
            offerResult,
            offerPrice,
            offerDescription,
            cleanup
        };

    } catch (error) {
        await cleanup();
        throw error;
    }
};

const findTestOffer = clientPage => {
    return clientPage
        .locator('.offer-item')
        .filter({
            has: clientPage.locator('.offer-name', {
                hasText: 'Playwright Test Provider'
            })
        });
};


// =====================================================
// PW-031: Klient saab hinnapakkumise reaalajas
// =====================================================

test('PW-031: Klient saab hinnapakkumise reaalajas', async ({
    browser,
    request
}) => {
    test.setTimeout(180000);

    const data = await setupBookingWithOffer({
        browser,
        request
    });

    try {
        const {
            clientPage,
            bookingId
        } = data;

        // Ootame Socket.io sündmust
        await clientPage.waitForFunction(
            bookingId => {
                const events =
                    window.__E2E_CLIENT_OFFER_EVENTS__ || [];

                return events.some(
                    event =>
                        event.bookingID === String(bookingId)
                );
            },
            bookingId,
            { timeout: 15000 }
        );

        const receivedEvents = await clientPage.evaluate(() => {
            return window.__E2E_CLIENT_OFFER_EVENTS__ || [];
        });

        const receivedOfferEvent = receivedEvents.find(
            event =>
                event.bookingID === String(bookingId)
        );

        expect(receivedOfferEvent).toBeTruthy();

        expect(
            Number(receivedOfferEvent.offer.price)
        ).toBe(250);

        console.log(
            '[PW-031] Socket.io offer received:',
            receivedOfferEvent.offer
        );

        // Kontrollime UI automaatset uuenemist
        const newOffersBadge = clientPage.getByTestId(
            'new-offers-badge'
        );

        await expect(newOffersBadge).toBeVisible({
            timeout: 15000
        });

        await expect(newOffersBadge).toHaveText('1');

        console.log('[PW-031] TEST PASSED');

    } finally {
        await data.cleanup();
    }
});


// =====================================================
// PW-032: Hinnapakkumine säilib pärast lehe värskendamist
// =====================================================

test('PW-032: Hinnapakkumine säilib pärast värskendamist', async ({
    browser,
    request
}) => {
    test.setTimeout(180000);

    const data = await setupBookingWithOffer({
        browser,
        request
    });

    try {
        const {
            clientPage,
            offerPrice,
            offerDescription
        } = data;

        // Veendume, et pakkumine on enne reload'i saabunud
        await expect(
            clientPage.getByTestId('new-offers-badge')
        ).toHaveText('1', {
            timeout: 15000
        });

        // Värskendame kliendi lehe
        await clientPage.reload({
            waitUntil: 'domcontentloaded'
        });

        // Kontrollime tellimuse kaarti
        await expect(
            clientPage.getByTestId('open-booking-panel')
        ).toBeVisible({
            timeout: 15000
        });

        // Kontrollime uue pakkumise märgist
        await expect(
            clientPage.getByTestId('new-offers-badge')
        ).toHaveText('1', {
            timeout: 15000
        });

        // Avame tellimuse
        await clientPage.getByTestId(
            'open-booking-panel'
        ).click();

        const offerItem = findTestOffer(clientPage);

        await expect(offerItem).toBeVisible({
            timeout: 15000
        });

        // Kontrollime pakkuja nime
        await expect(
            offerItem.locator('.offer-name')
        ).toHaveText('Playwright Test Provider');

        // Kontrollime hinda
        await expect(
            offerItem.locator('.offer-price')
        ).toContainText(String(offerPrice));

        // Pakkumine peab olema uus
        await expect(offerItem).toHaveClass(
            /offer-item--new/
        );

        // Avame pakkumise detailvaate
        await offerItem.click();

        const offerDetails = clientPage.getByTestId(
            'offer-details'
        );

        await expect(offerDetails).toBeVisible({
            timeout: 15000
        });

        await expect(offerDetails).toContainText(
            `${offerPrice} eur`
        );

        await expect(offerDetails).toContainText(
            offerDescription
        );

        await expect(offerDetails).toContainText(
            'Playwright Test Provider'
        );

        console.log('[PW-032] TEST PASSED');

    } finally {
        await data.cleanup();
    }
});


// =====================================================
// PW-033: Hinnapakkumise loetuks märkimine
// =====================================================

test('PW-033: Hinnapakkumise loetuks märkimine', async ({
    browser,
    request
}) => {
    test.setTimeout(180000);

    const data = await setupBookingWithOffer({
        browser,
        request
    });

    try {
        const { clientPage } = data;

        // Ootame uut pakkumist
        await expect(
            clientPage.getByTestId('new-offers-badge')
        ).toHaveText('1', {
            timeout: 15000
        });

        // Avame tellimuse
        await clientPage.getByTestId(
            'open-booking-panel'
        ).click();

        const offerItem = findTestOffer(clientPage);

        await expect(offerItem).toBeVisible({
            timeout: 15000
        });

        // Kontrollime, et pakkumine on uus
        await expect(offerItem).toHaveClass(
            /offer-item--new/
        );

        await expect(
            offerItem.locator('.new-dot')
        ).toHaveCount(1);

        // Avame pakkumise
        await offerItem.click();

        // Kontrollime, et pakkumine märgiti loetuks
        await expect(offerItem).toHaveClass(
            /offer-item--opened/,
            { timeout: 15000 }
        );

        // Oranž täpp peab kaduma
        await expect(
            offerItem.locator('.new-dot')
        ).toHaveCount(0);

        console.log('[PW-033] Offer marked as read');

        // Värskendame lehe
        await clientPage.reload({
            waitUntil: 'domcontentloaded'
        });

        // Ootame tellimuste laadimist
        await expect(
            clientPage.getByTestId('open-booking-panel')
        ).toBeVisible({
            timeout: 15000
        });

        // Uute pakkumiste märgis peab puuduma
        await expect(
            clientPage.getByTestId('new-offers-badge')
        ).toHaveCount(0, {
            timeout: 15000
        });

        // Avame tellimuse uuesti
        await clientPage.getByTestId(
            'open-booking-panel'
        ).click();

        const restoredOffer = findTestOffer(clientPage);

        await expect(restoredOffer).toBeVisible({
            timeout: 15000
        });

        // Pakkumine peab jääma loetuks
        await expect(restoredOffer).toHaveClass(
            /offer-item--opened/
        );

        await expect(
            restoredOffer.locator('.new-dot')
        ).toHaveCount(0);

        console.log('[PW-033] TEST PASSED');

    } finally {
        await data.cleanup();
    }
});


