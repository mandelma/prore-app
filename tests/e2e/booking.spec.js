import { test, expect } from '@playwright/test';

import { loginAsClient, loginExistingUser, registerAndLoginAsClient, logout } from './helpers/auth.helper.js';
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


            // ETAPP 6: Maaler avab tellimuse

            const painterBookingOpen = painterPage.locator(
                `.booking-row-new span.new_notification[data-testid="provider-booking-${bookingId}"]`
            ).first();

            // Jälgime visitor API päringuid
            painterPage.on('request', request => {
                if (request.url().includes('/visitor')) {
                    console.log(
                        '[VISITOR REQUEST]',
                        request.method(),
                        request.url()
                    );
                }
            });

            painterPage.on('response', response => {
                if (response.url().includes('/visitor')) {
                    console.log(
                        '[VISITOR RESPONSE]',
                        response.status(),
                        response.url()
                    );
                }
            });

            painterPage.on('pageerror', error => {
                console.error(
                    '[PROVIDER PAGE ERROR]',
                    error.message
                );
            });

            // Avame tellimuse ainult ühe korra
            await painterBookingOpen.click();

            // Kontrollime avatud tellimuse pealkirja
            await expect(
                painterPage.getByTestId('provider-booking-header')
            ).toHaveText(testHeader, {
                timeout: 15000
            });


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


const setupBookingWithOffer = async ({ browser, request, createOffer = true }) => {
    let clientToken = null;
    let bookingId = null;
    let painterUserId = null;

    const createdProviders = [];
    const createdUserIds = [];
    const contexts = [];

    const cleanup = async ({ bookingAlreadyDeleted = false } = {}) => {

        if (bookingId && !bookingAlreadyDeleted) {
            try {
                await deleteTestBookingByApi(
                    request,
                    bookingId,
                    clientToken
                );

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



        painterPage.on('console', msg => {
            console.log(
                '[PROVIDER BROWSER]',
                msg.text()
            );
        });

        painterPage.on('pageerror', error => {
            console.error(
                '[PROVIDER PAGE ERROR]',
                error.message
            );
        });

        painterPage.on('close', () => {
            console.log('[PW-045] Provider page CLOSED');
        });

        painterPage.context().on('close', () => {
            console.log('[PW-045] Provider context CLOSED');
        });










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
        const { userId: clientUserId, user: clientUser } =
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
        // ETAPP 6 — Pakkuja avab tellimuse

        const painterBookingOpen = painterPage.locator(
            `.booking-row-new span.new_notification[data-testid="provider-booking-${bookingId}"]`
        ).first();

        await expect(painterBookingOpen).toBeVisible({
            timeout: 15000
        });

        const [visitorResponse] = await Promise.all([
            painterPage.waitForResponse(
                response =>
                    new URL(response.url()).pathname ===
                    `/api/recipients/${bookingId}/visitor` &&
                    response.request().method() === 'PUT',
                { timeout: 15000 }
            ),

            painterBookingOpen.click()
        ]);

        console.log(
            '[PW-045] Visitor API status:',
            visitorResponse.status()
        );

        expect(visitorResponse.status()).toBe(200);

        await expect(
            painterPage.getByTestId('provider-booking-header')
        ).toHaveText(testHeader, {
            timeout: 15000
        });













        if (!createOffer) {

            console.log(
                '[OFFER SETUP] Booking created WITHOUT offer:',
                bookingId
            );

            return {
                painterPage,
                clientPage,
                bookingId,
                painterUserId,

                painterUsername: painter.user.username,
                painterPassword: painter.user.password,

                clientUsername: clientUser.username,
                clientPassword: clientUser.password,
                clientUserId,

                clientToken,
                offerResult: null,
                offerPrice: null,
                offerDescription: null,
                cleanup
            };
        }



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

            // Pakkuja uuesti sisselogimiseks
            painterUsername: painter.user.username,
            painterPassword: painter.user.password,

            clientUsername: clientUser.username,
            clientPassword: clientUser.password,
            clientUserId,

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

// =====================================================
// PW-034: Klient kinnitab pakkuja hinnapakkumise
// =====================================================

test('PW-034: Klient kinnitab pakkuja hinnapakkumise', async ({
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

        // 1. Ootame hinnapakkumise saabumist
        await expect(
            clientPage.getByTestId('new-offers-badge')
        ).toHaveText('1', {
            timeout: 15000
        });

        // 2. Klient avab tellimuse
        await clientPage.getByTestId(
            'open-booking-panel'
        ).click();

        // 3. Leiame maalri hinnapakkumise
        const offerItem = findTestOffer(clientPage);

        await expect(offerItem).toBeVisible({
            timeout: 15000
        });

        // 4. Klient avab hinnapakkumise
        await offerItem.click();

        // 5. Kontrollime tellimisnuppu
        const orderButton = clientPage.getByTestId(
            'order-provider-btn'
        );

        await expect(orderButton).toBeVisible();
        await expect(orderButton).toBeEnabled();

        // 6. Klient vajutab tellimisnuppu
        await orderButton.click();

        console.log(
            '[PW-034] Order button clicked'
        );

        // ==========================================
        // PW-034: Kinnitamise dialoog
        // ==========================================

        const confirmDialog = clientPage.locator(
            '.deal-modal[role="dialog"]'
        );

        await expect(confirmDialog).toBeVisible({
            timeout: 15000
        });

        const confirmButton = confirmDialog.getByTestId(
            'confirm-deal-btn'
        );

        await expect(confirmButton).toBeVisible();
        await expect(confirmButton).toBeEnabled();

        console.log('[PW-034] Confirmation dialog opened');


        // ==========================================
        // PW-034: API vastuse kontroll
        // ==========================================

        // Alustame API vastuse ootamist enne nupuvajutust
        const confirmationResponsePromise =
            clientPage.waitForResponse(
                response => {
                    const url = new URL(response.url());

                    return (
                        url.pathname ===
                        `/api/recipients/${bookingId}/confirm-provider-offer` &&
                        response.request().method() === 'POST'
                    );
                },
                { timeout: 30000 }
            );

        // Klient kinnitab tellimuse
        await confirmButton.click();

        // Ootame API vastust
        const confirmationResponse =
            await confirmationResponsePromise;

        // Kontrollime HTTP staatust
        expect(confirmationResponse.status()).toBe(200);

        // Loeme vastuse
        const confirmationResult =
            await confirmationResponse.json();

        // Backend kinnitas tellimuse
        expect(confirmationResult.success).toBe(true);

        // Kontrollime endpointi versiooni
        expect(confirmationResult.debugVersion).toBe(
            'CONFIRM_ROUTE_V3'
        );

        /* console.log(
            '[PW-034] Backend confirmed booking:',
            confirmationResult.booking
        ); */

        

        // ==========================================
        // PW-034: Kinnitatud tellimuse kontroll
        // ==========================================

        const confirmedBooking = confirmationResult.booking;

        console.log('[PW-034] Backend confirmed booking:', {
            bookingId: confirmedBooking.id,
            status: confirmedBooking.status,
            providerId: confirmedBooking.confirmed_provider_user_id,
            offerId: confirmedBooking.confirmedOffer._id,
            price: confirmedBooking.confirmedOffer.price
        });



        // Tellimus peab olema kinnitatud
        expect(confirmedBooking.status).toBe('confirmed');

        // Kinnitatud pakkuja peab olema meie testmaaler
        expect(
            String(confirmedBooking.confirmed_provider_user_id)
        ).toBe(
            String(data.painterUserId)
        );

        // Kinnitatud pakkumine peab eksisteerima
        expect(confirmedBooking.confirmedOffer).toBeTruthy();

        // Kontrollime kinnitatud pakkumise hinda
        expect(
            Number(confirmedBooking.confirmedOffer.price)
        ).toBe(250);

        // Kontrollime pakkumise ID-d
        expect(
            String(
                confirmedBooking.confirmedOffer._id ??
                confirmedBooking.confirmedOffer.id
            )
        ).toBe(
            String(
                data.offerResult.offer._id ??
                data.offerResult.offer.id
            )
        );

        // Kinnitamise aeg peab olema salvestatud
        expect(confirmedBooking.confirmedAt).toBeTruthy();

        console.log(
            '[PW-034] Confirmed booking data verified'
        );

    } finally {
        await data.cleanup();
    }
});


// =====================================================
// PW-035: Pakkuja saab tellimuse kinnitamise Socket.io teavituse
// =====================================================

test('PW-035: Pakkuja saab tellimuse kinnitamise teavituse', async ({
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
            painterPage,
            bookingId
        } = data;

        // 1. Kontrollime maalri Socket.io ühendust
        await expect.poll(
            () => painterPage.evaluate(
                () => window.__E2E_SOCKET__?.connected === true
            ),
            { timeout: 15000 }
        ).toBe(true);

        // 2. Registreerime sündmuse kuulaja
        // ENNE kliendi kinnitamisnupu vajutamist
        await painterPage.evaluate(() => {
            window.__E2E_CONFIRMED_EVENTS__ = [];

            window.__E2E_SOCKET__.on(
                'booking-offer-confirmed',
                data => {
                    window.__E2E_CONFIRMED_EVENTS__.push(data);
                }
            );
        });

        console.log('[PW-035] Provider Socket.io listener registered');

        // 3. Klient avab tellimuse
        await expect(
            clientPage.getByTestId('new-offers-badge')
        ).toHaveText('1', { timeout: 15000 });

        await clientPage.getByTestId('open-booking-panel').click();

        // 4. Klient avab maalri pakkumise
        const offerItem = findTestOffer(clientPage);

        await expect(offerItem).toBeVisible();
        await offerItem.click();

        // 5. Klient vajutab tellimisnuppu
        await clientPage.getByTestId('order-provider-btn').click();

        const confirmDialog = clientPage.locator(
            '.deal-modal[role="dialog"]'
        );

        await expect(confirmDialog).toBeVisible();

        // 6. Valmistame ette API vastuse ootamise
        const responsePromise = clientPage.waitForResponse(
            response => {
                const url = new URL(response.url());

                return (
                    url.pathname ===
                    `/api/recipients/${bookingId}/confirm-provider-offer` &&
                    response.request().method() === 'POST'
                );
            },
            { timeout: 30000 }
        );

        // 7. Klient kinnitab tellimuse
        await confirmDialog.getByTestId('confirm-deal-btn').click();

        const response = await responsePromise;

        expect(response.status()).toBe(200);

        const result = await response.json();

        expect(result.success).toBe(true);
        expect(result.booking.status).toBe('confirmed');

        console.log('[PW-035] Client confirmed booking');

        // 8. Kontrollime Socket.io sündmuse saabumist
        await expect.poll(
            () => painterPage.evaluate(
                bookingId => {
                    const events =
                        window.__E2E_CONFIRMED_EVENTS__ || [];

                    return events.some(
                        event =>
                            String(event.bookingId) ===
                            String(bookingId)
                    );
                },
                bookingId
            ),
            {
                timeout: 15000,
                message:
                    'Provider did not receive booking-offer-confirmed event'
            }
        ).toBe(true);

        // 9. Kontrollime teavituse sisu
        const events = await painterPage.evaluate(
            () => window.__E2E_CONFIRMED_EVENTS__
        );

        const confirmationEvent = events.find(
            event => String(event.bookingId) === String(bookingId)
        );

        expect(confirmationEvent.notification).toBeTruthy();

        expect(
            String(confirmationEvent.notification.receiver)
        ).toBe(String(data.painterUserId));

        expect(
            String(confirmationEvent.notification.bookingId)
        ).toBe(String(bookingId));

        console.log(
            '[PW-035] Provider received confirmation:',
            {
                bookingId: confirmationEvent.bookingId,
                notificationId:
                    confirmationEvent.notification._id,
                title: confirmationEvent.notification.title
            }
        );

    } finally {
        await data.cleanup();
    }
});


// =====================================================
// PW-036: Kinnitatud tellimus ilmub pakkuja kasutajaliideses
// =====================================================

test('PW-036: Kinnitatud tellimus ilmub pakkuja kasutajaliideses', async ({
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
            painterPage,
            bookingId
        } = data;

        // ==========================================
        // 1. Kontrollime pakkuja Socket.io ühendust
        // ==========================================

        await expect.poll(
            () => painterPage.evaluate(
                () => window.__E2E_SOCKET__?.connected === true
            ),
            { timeout: 15000 }
        ).toBe(true);

        // ==========================================
        // 2. Loeme kinnitatud tellimuste algse arvu
        // ==========================================

        const confirmedCount = painterPage.getByTestId(
            'confirmed-requests-count'
        );

        await expect(confirmedCount).toBeVisible();

        const initialCount = Number(
            await confirmedCount.innerText()
        );

        console.log(
            '[PW-036] Initial confirmed bookings:',
            initialCount
        );

        // ==========================================
        // 3. Klient avab hinnapakkumise
        // ==========================================

        await expect(
            clientPage.getByTestId('new-offers-badge')
        ).toHaveText('1', {
            timeout: 15000
        });

        await clientPage.getByTestId(
            'open-booking-panel'
        ).click();

        const offerItem = findTestOffer(clientPage);

        await expect(offerItem).toBeVisible();

        await offerItem.click();

        // ==========================================
        // 4. Klient alustab tellimuse kinnitamist
        // ==========================================

        await clientPage.getByTestId(
            'order-provider-btn'
        ).click();

        const confirmDialog = clientPage.locator(
            '.deal-modal[role="dialog"]'
        );

        await expect(confirmDialog).toBeVisible();

        // ==========================================
        // 5. Ootame API vastust
        // ==========================================

        const responsePromise = clientPage.waitForResponse(
            response => {
                const url = new URL(response.url());

                return (
                    url.pathname ===
                    `/api/recipients/${bookingId}/confirm-provider-offer` &&
                    response.request().method() === 'POST'
                );
            },
            { timeout: 30000 }
        );

        await confirmDialog.getByTestId(
            'confirm-deal-btn'
        ).click();

        const response = await responsePromise;

        expect(response.status()).toBe(200);

        const result = await response.json();

        expect(result.success).toBe(true);
        expect(result.booking.status).toBe('confirmed');

        console.log(
            '[PW-036] Client confirmed booking'
        );

        // ==========================================
        // 6. Kontrollime kasutajaliidese reaktiivset muutust
        // ==========================================

        await expect(confirmedCount).toHaveText(
            String(initialCount + 1),
            { timeout: 15000 }
        );

        console.log(
            '[PW-036] Provider confirmed bookings count updated:',
            initialCount,
            '→',
            initialCount + 1
        );

    } finally {
        await data.cleanup();
    }
});


// =====================================================
// PW-037: Kinnitatud tellimus ilmub pakkuja kalendris
// =====================================================

test('PW-037: Kinnitatud tellimus ilmub pakkuja kalendris', async ({
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
            painterPage,
            bookingId
        } = data;

        // 1. Kontrollime kinnitatud tellimuste algset arvu
        const confirmedCount = painterPage.getByTestId(
            'confirmed-requests-count'
        );

        await expect(confirmedCount).toBeVisible();

        const initialCount = Number(
            await confirmedCount.innerText()
        );

        // 2. Klient avab pakkumise
        await expect(
            clientPage.getByTestId('new-offers-badge')
        ).toHaveText('1', { timeout: 15000 });

        await clientPage.getByTestId(
            'open-booking-panel'
        ).click();

        const offerItem = findTestOffer(clientPage);

        await expect(offerItem).toBeVisible();
        await offerItem.click();

        // 3. Klient kinnitab pakkumise
        await clientPage.getByTestId(
            'order-provider-btn'
        ).click();

        const confirmDialog = clientPage.locator(
            '.deal-modal[role="dialog"]'
        );

        await expect(confirmDialog).toBeVisible();

        const responsePromise = clientPage.waitForResponse(
            response => {
                const url = new URL(response.url());

                return (
                    url.pathname ===
                    `/api/recipients/${bookingId}/confirm-provider-offer` &&
                    response.request().method() === 'POST'
                );
            },
            { timeout: 30000 }
        );

        await confirmDialog.getByTestId(
            'confirm-deal-btn'
        ).click();

        const response = await responsePromise;

        expect(response.status()).toBe(200);

        const result = await response.json();

        expect(result.success).toBe(true);
        expect(result.booking.status).toBe('confirmed');

        // 4. Ootame pakkuja kasutajaliidese uuendamist
        await expect(confirmedCount).toHaveText(
            String(initialCount + 1),
            { timeout: 15000 }
        );

        console.log(
            '[PW-037] Provider confirmed booking count updated'
        );

        // 5. Avame pakkuja kalendri
        await painterPage.getByTestId(
            'confirmed-requests'
        ).click();

        await expect(painterPage).toHaveURL(/\/calendar/);

        // 6. Ootame FullCalendari laadimist
        await expect(
            painterPage.locator('.fc')
        ).toBeVisible();

        // 7. Leiame kinnitatud tellimuse kalendris
        const calendarEvent = painterPage.getByTestId(
            `provider-calendar-event-${bookingId}`
        );

        await expect(calendarEvent).toBeVisible({
            timeout: 15000
        });

        console.log(
            '[PW-037] Confirmed booking visible in calendar:',
            bookingId
        );

        // 8. Avame kalendris kinnitatud tellimuse
        await calendarEvent.click();

        console.log(
            '[PW-037] Confirmed booking clicked in calendar'
        );


        // Debug paus, et uurida modaalakna sisu
        /* const modalData = await painterPage.evaluate(() => {
            const modal = document.querySelector(
                '[data-testid="provider-calendar-modal"]'
            );

            return {
                modalExists: !!modal,
                addressExists: !!modal?.querySelector(
                    '[data-testid="calendar-booking-address"]'
                ),
                modalText: modal?.innerText
            };
        });

        console.log('PW-037 MODAL DEBUG:', modalData);

        await painterPage.pause(); */




        // ==========================================
        // PW-037: Kinnitatud tellimuse detailide kontroll
        // ==========================================

        // 9. Kontrollime detailakna avanemist
        const bookingModal = painterPage.getByTestId(
            'provider-calendar-modal'
        );

        await expect(bookingModal).toBeVisible({
            timeout: 15000
        });

        console.log('[PW-037] Provider booking modal opened');


        // 10. Kontrollime tellimuse pealkirja
        await expect(
            bookingModal.getByTestId('calendar-booking-title')
        ).toHaveText(result.booking.header);


        // 11. Kontrollime tellimuse kirjeldust
        await expect(
            bookingModal.getByTestId('calendar-booking-description')
        ).toContainText(
            'Playwright E2E test booking'
        );


        // 12. Kontrollime tellimuse aadressi
        await expect(
            bookingModal.getByTestId('calendar-booking-address')
        ).toHaveText(
            result.booking.address
        );


        // 13. Kontrollime kokkulepitud hinda
        await expect(
            bookingModal.getByTestId('calendar-booking-price')
        ).toHaveText('250 €');


        // 14. Kontrollime, et staatus on kuvatud
        const bookingStatus = bookingModal.getByTestId(
            'calendar-booking-status'
        );

        await expect(bookingStatus).toBeVisible();
        await expect(bookingStatus).not.toBeEmpty();


        // 15. Kontrollime algusaja kuvamist
        const bookingStart = bookingModal.getByTestId(
            'calendar-booking-start'
        );

        await expect(bookingStart).toBeVisible();
        await expect(bookingStart).not.toHaveText('—');


        console.log('[PW-037] Booking details verified:', {
            bookingId,
            title: result.booking.header,
            address: result.booking.address,
            price: 250,
            status: result.booking.status
        });

    } finally {
        await data.cleanup();
    }
});


// =====================================================
// PW-038: Kinnitatud tellimus säilib pärast lehe reload'i
// =====================================================

test('PW-038: Kinnitatud tellimus säilib pärast lehe värskendamist', async ({
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
            painterPage,
            bookingId
        } = data;

        // ==========================================
        // 1. Klient kinnitab pakkuja hinnapakkumise
        // ==========================================

        await expect(
            clientPage.getByTestId('new-offers-badge')
        ).toHaveText('1', { timeout: 15000 });

        await clientPage.getByTestId(
            'open-booking-panel'
        ).click();

        const offerItem = findTestOffer(clientPage);

        await expect(offerItem).toBeVisible();
        await offerItem.click();

        await clientPage.getByTestId(
            'order-provider-btn'
        ).click();

        const confirmDialog = clientPage.locator(
            '.deal-modal[role="dialog"]'
        );

        await expect(confirmDialog).toBeVisible();

        const responsePromise = clientPage.waitForResponse(
            response => {
                const url = new URL(response.url());

                return (
                    url.pathname ===
                    `/api/recipients/${bookingId}/confirm-provider-offer` &&
                    response.request().method() === 'POST'
                );
            },
            { timeout: 30000 }
        );

        await confirmDialog.getByTestId(
            'confirm-deal-btn'
        ).click();

        const response = await responsePromise;

        expect(response.status()).toBe(200);

        const result = await response.json();

        expect(result.success).toBe(true);
        expect(result.booking.status).toBe('confirmed');

        console.log(
            '[PW-038] Booking confirmed:',
            bookingId
        );

        // ==========================================
        // 2. Kontrollime reaalajas uuendamist
        // ==========================================

        const confirmedCount = painterPage.getByTestId(
            'confirmed-requests-count'
        );

        await expect(confirmedCount).toHaveText('1', {
            timeout: 15000
        });

        // ==========================================
        // 3. Avame pakkuja kalendri
        // ==========================================

        await painterPage.getByTestId(
            'confirmed-requests'
        ).click();

        await expect(painterPage).toHaveURL(/\/calendar/);

        await expect(
            painterPage.locator('.fc')
        ).toBeVisible();

        const calendarEvent = painterPage.getByTestId(
            `provider-calendar-event-${bookingId}`
        );

        await expect(calendarEvent).toBeVisible({
            timeout: 15000
        });

        console.log(
            '[PW-038] Booking visible before reload'
        );












        // ==========================================
        // 4. Värskendame pakkuja kalendri lehte
        // ==========================================

        await painterPage.reload();

        await expect(painterPage).toHaveURL(/\/calendar/);

        await expect(
            painterPage.locator('.fc')
        ).toBeVisible({
            timeout: 15000
        });

        console.log(
            '[PW-038] Calendar page reloaded'
        );

        // ==========================================
        // 5. Kontrollime tellimuse taastamist
        // ==========================================

        const restoredEvent = painterPage.getByTestId(
            `provider-calendar-event-${bookingId}`
        );

        await expect(restoredEvent).toBeVisible({
            timeout: 20000
        });

        console.log(
            '[PW-038] Booking restored after reload'
        );

        // ==========================================
        // 6. Avame taastatud tellimuse
        // ==========================================

        await restoredEvent.click();

        const bookingModal = painterPage.getByTestId(
            'provider-calendar-modal'
        );

        await expect(bookingModal).toBeVisible();

        // ==========================================
        // 7. Kontrollime taastatud andmeid
        // ==========================================

        await expect(
            bookingModal.getByTestId(
                'calendar-booking-title'
            )
        ).toHaveText(result.booking.header);

        await expect(
            bookingModal.getByTestId(
                'calendar-booking-address'
            )
        ).toHaveText(result.booking.address);

        await expect(
            bookingModal.getByTestId(
                'calendar-booking-price'
            )
        ).toHaveText('250 €');

        await expect(
            bookingModal.getByTestId(
                'calendar-booking-status'
            )
        ).toBeVisible();

        console.log(
            '[PW-038] Restored booking details verified:',
            {
                bookingId,
                title: result.booking.header,
                price: 250,
                status: result.booking.status
            }
        );

    } finally {
        await data.cleanup();
    }
});


// =====================================================
// PW-039: Kinnitatud tellimus pärast uut sisselogimist
// =====================================================

test('PW-039: Kinnitatud tellimus säilib pärast uut sisselogimist', async ({
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
            painterPage,
            bookingId,
            painterUserId,
            painterUsername,
            painterPassword
        } = data;

        // ==========================================
        // 1. Kontrollime algset tellimuste arvu
        // ==========================================

        const confirmedCount = painterPage.getByTestId(
            'confirmed-requests-count'
        );

        await expect(confirmedCount).toBeVisible();

        const initialCount = Number(
            await confirmedCount.innerText()
        );

        // ==========================================
        // 2. Klient kinnitab maalri pakkumise
        // ==========================================

        await expect(
            clientPage.getByTestId('new-offers-badge')
        ).toHaveText('1', { timeout: 15000 });

        await clientPage.getByTestId(
            'open-booking-panel'
        ).click();

        const offerItem = findTestOffer(clientPage);

        await expect(offerItem).toBeVisible();

        await offerItem.click();

        await clientPage.getByTestId(
            'order-provider-btn'
        ).click();

        const confirmDialog = clientPage.locator(
            '.deal-modal[role="dialog"]'
        );

        await expect(confirmDialog).toBeVisible();

        const responsePromise = clientPage.waitForResponse(
            response =>
                new URL(response.url()).pathname ===
                `/api/recipients/${bookingId}/confirm-provider-offer` &&
                response.request().method() === 'POST'
        );

        await confirmDialog.getByTestId(
            'confirm-deal-btn'
        ).click();

        const response = await responsePromise;

        expect(response.status()).toBe(200);

        const result = await response.json();

        expect(result.booking.status).toBe('confirmed');

        // ==========================================
        // 3. Kontrollime pakkuja tellimuste arvu
        // ==========================================

        await expect(confirmedCount).toHaveText(
            String(initialCount + 1),
            { timeout: 15000 }
        );

        // ==========================================
        // 4. Avame pakkuja kalendri
        // ==========================================

        await painterPage.getByTestId(
            'confirmed-requests'
        ).click();

        await expect(painterPage).toHaveURL(/\/calendar/);

        const calendarEvent = painterPage.getByTestId(
            `provider-calendar-event-${bookingId}`
        );

        await expect(calendarEvent).toBeVisible({
            timeout: 15000
        });

        console.log(
            '[PW-039] Booking visible before logout'
        );

        // 5. Logime pakkuja välja
        await logout(
            painterPage,
            'desktop-user-menu'
        );

        console.log('[PW-039] Provider logged out');

        // 6. Logime sama pakkuja uuesti sisse
        await loginExistingUser(
            painterPage,
            painterUsername,
            painterPassword,
            { expectedPath: '/admin/provider' }
        );

        console.log('[PW-039] Provider logged in again');


        const loggedInUserId = await painterPage.evaluate(() => {
            const saved =
                sessionStorage.getItem('loggedAppUser') ||
                localStorage.getItem('loggedAppUser');

            if (!saved) return null;

            const user = JSON.parse(saved);

            return user.id ?? user._id;
        });

        expect(String(loggedInUserId)).toBe(
            String(painterUserId)
        );


        // ==========================================
        // 7. Avame uuesti kalendri
        // ==========================================

        await painterPage.goto('/calendar');

        await expect(
            painterPage.locator('.fc')
        ).toBeVisible({
            timeout: 15000
        });

        // ==========================================
        // 8. Kontrollime tellimuse taastamist
        // ==========================================

        const restoredEvent = painterPage.getByTestId(
            `provider-calendar-event-${bookingId}`
        );

        await expect(restoredEvent).toBeVisible({
            timeout: 20000
        });

        console.log(
            '[PW-039] Booking restored after login'
        );

        // ==========================================
        // 9. Kontrollime tellimuse andmeid
        // ==========================================

        await restoredEvent.click();

        const bookingModal = painterPage.getByTestId(
            'provider-calendar-modal'
        );

        await expect(bookingModal).toBeVisible();

        await expect(
            bookingModal.getByTestId(
                'calendar-booking-title'
            )
        ).toHaveText(result.booking.header);

        await expect(
            bookingModal.getByTestId(
                'calendar-booking-price'
            )
        ).toHaveText('250 €');

        await expect(
            bookingModal.getByTestId(
                'calendar-booking-address'
            )
        ).toHaveText(result.booking.address);

        console.log(
            '[PW-039] Booking successfully restored after login:',
            bookingId
        );

    } finally {

        await data.cleanup();

    }

});


// ==========================================
// PW-040: Uus sõltumatu brauserikontekst
// ==========================================

test('PW-040: Uus sõltumatu brauserikontekst', async ({
    browser,
    request
}) => {
    test.setTimeout(180000);

    const data = await setupBookingWithOffer({
        browser,
        request
    });

    const newContext = await browser.newContext();


    try {

        const {
            clientPage,
            painterPage,
            bookingId,
            painterUserId,
            painterUsername,
            painterPassword
        } = data;

        // ==========================================
        // 1. Klient kinnitab pakkuja hinnapakkumise
        // ==========================================

        await expect(
            clientPage.getByTestId('new-offers-badge')
        ).toHaveText('1', { timeout: 15000 });

        await clientPage.getByTestId(
            'open-booking-panel'
        ).click();

        const offerItem = findTestOffer(clientPage);

        await expect(offerItem).toBeVisible();
        await offerItem.click();

        await clientPage.getByTestId(
            'order-provider-btn'
        ).click();

        const confirmDialog = clientPage.locator(
            '.deal-modal[role="dialog"]'
        );

        await expect(confirmDialog).toBeVisible();

        const responsePromise = clientPage.waitForResponse(
            response => {
                const url = new URL(response.url());

                return (
                    url.pathname ===
                    `/api/recipients/${bookingId}/confirm-provider-offer` &&
                    response.request().method() === 'POST'
                );
            },
            { timeout: 30000 }
        );

        await confirmDialog.getByTestId(
            'confirm-deal-btn'
        ).click();

        const response = await responsePromise;

        expect(response.status()).toBe(200);

        const result = await response.json();

        expect(result.success).toBe(true);
        expect(result.booking.status).toBe('confirmed');

        console.log(
            '[PW-040] Booking confirmed:',
            bookingId
        );

        // ==========================================
        // 2. Kontrollime reaalajas uuendamist
        // ==========================================

        const confirmedCount = painterPage.getByTestId(
            'confirmed-requests-count'
        );

        await expect(confirmedCount).toHaveText('1', {
            timeout: 15000
        });

        // ==========================================
        // 3. Avame pakkuja kalendri
        // ==========================================

        await painterPage.getByTestId(
            'confirmed-requests'
        ).click();

        await expect(painterPage).toHaveURL(/\/calendar/);

        await expect(
            painterPage.locator('.fc')
        ).toBeVisible();

        const calendarEvent = painterPage.getByTestId(
            `provider-calendar-event-${bookingId}`
        );

        await expect(calendarEvent).toBeVisible({
            timeout: 15000
        });

        console.log(
            '[PW-040] Booking visible before reload'
        );

        const newPainterPage = await newContext.newPage();

        // 2. Kontrollime, et kasutaja pole sisse logitud
        await newPainterPage.goto('/login-register');

        const savedUser = await newPainterPage.evaluate(() => ({
            local: localStorage.getItem('loggedAppUser'),
            session: sessionStorage.getItem('loggedAppUser')
        }));

        expect(savedUser).toEqual({
            local: null,
            session: null
        });

        console.log('[PW-040] New browser context is empty');

        // 3. Logime sisse sama pakkujaga
        await loginExistingUser(
            newPainterPage,
            painterUsername,
            painterPassword,
            { expectedPath: '/admin/provider' }
        );

        // 4. Kontrollime kasutaja identiteeti
        const loggedInUserId = await newPainterPage.evaluate(() => {
            const saved =
                sessionStorage.getItem('loggedAppUser') ||
                localStorage.getItem('loggedAppUser');

            if (!saved) return null;

            const user = JSON.parse(saved);

            return user.id ?? user._id;
        });

        expect(String(loggedInUserId)).toBe(
            String(painterUserId)
        );

        // Sulgeme teavituse modaalakna, kui see on avatud
        await closeNotificationModal(newPainterPage);

        console.log('[PW-040] Pakkuja on uues brauserikontekstis sisse logitud');

        console.log('[PW-040] Same provider logged in');

        // 5. Avame kalendri
        await newPainterPage.goto('/calendar');

        await expect(
            newPainterPage.locator('.fc')
        ).toBeVisible({ timeout: 15000 });

        // 6. Kontrollime kinnitatud tellimuse taastamist
        const restoredEvent = newPainterPage.getByTestId(
            `provider-calendar-event-${bookingId}`
        );

        await expect(restoredEvent).toBeVisible({
            timeout: 20000
        });

        console.log(
            '[PW-040] Confirmed booking restored in new context'
        );

        // 7. Avame tellimuse detailakna
        await restoredEvent.click();

        const bookingModal = newPainterPage.getByTestId(
            'provider-calendar-modal'
        );

        await expect(bookingModal).toBeVisible();

        // 8. Kontrollime tellimuse andmeid
        await expect(
            bookingModal.getByTestId('calendar-booking-title')
        ).toHaveText(result.booking.header);

        await expect(
            bookingModal.getByTestId('calendar-booking-address')
        ).toHaveText(result.booking.address);

        await expect(
            bookingModal.getByTestId('calendar-booking-price')
        ).toHaveText('250 €');

        console.log(
            '[PW-040] Booking verified in independent browser context:',
            bookingId
        );


    } finally {
        try {
            await newContext.close();
        } finally {
            await data.cleanup();
        }
    }

});


test('PW-041: Client confirmed booking appears in calendar', async ({
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
            bookingId,
            offerPrice
        } = data;

        // ==========================================
        // 1. Klient kinnitab pakkuja hinnapakkumise
        // ==========================================

        await expect(
            clientPage.getByTestId('new-offers-badge')
        ).toHaveText('1', { timeout: 15000 });

        await clientPage.getByTestId(
            'open-booking-panel'
        ).click();

        const offerItem = findTestOffer(clientPage);

        await expect(offerItem).toBeVisible();
        await offerItem.click();

        await clientPage.getByTestId(
            'order-provider-btn'
        ).click();

        const confirmDialog = clientPage.locator(
            '.deal-modal[role="dialog"]'
        );

        await expect(confirmDialog).toBeVisible();

        const responsePromise = clientPage.waitForResponse(
            response => {
                const url = new URL(response.url());

                return (
                    url.pathname ===
                    `/api/recipients/${bookingId}/confirm-provider-offer` &&
                    response.request().method() === 'POST'
                );
            },
            { timeout: 30000 }
        );

        await confirmDialog.getByTestId(
            'confirm-deal-btn'
        ).click();

        const response = await responsePromise;

        expect(response.status()).toBe(200);

        const result = await response.json();



        expect(result.success).toBe(true);
        expect(result.booking.status).toBe('confirmed');

        console.log(
            '[PW-041] Booking confirmed:',
            bookingId
        );

        console.log(
            '[PW-041] Current URL:',
            clientPage.url()
        );

        console.log(
            '[PW-041] Confirmed count elements:',
            await clientPage.getByTestId(
                'client-confirmed-count'
            ).count()
        );

        console.log(
            '[PW-041] Calendar button elements:',
            await clientPage.getByTestId(
                'client-calendar-arrow'
            ).count()
        );


        const testIds = await clientPage.locator(
            '[data-testid]'
        ).evaluateAll(elements =>
            elements
                .map(el => el.getAttribute('data-testid'))
                .filter(id =>
                    id?.includes('confirmed') ||
                    id?.includes('calendar')
                )
        );

        console.log('[PW-041] Relevant test IDs:', testIds);


        // ==========================================
        // 2. Kontrollime kinnitatud tellimust
        // ==========================================

        await expect(
            clientPage.getByTestId('client-calendar-arrow')
        ).toBeVisible();

        await expect(
            clientPage.getByTestId('client-confirmed-count')
        ).toHaveText('1', {
            timeout: 15000
        });

        console.log('[PW-041] Confirmed count verified');

        // ==========================================
        // 3. Avame kliendi kalendri
        // ==========================================

        const calendarButton = clientPage.getByTestId(
            'client-calendar-arrow'
        );

        await expect(calendarButton).toBeVisible();

        await calendarButton.click();

        await expect(clientPage).toHaveURL(
            url => url.pathname === '/calendar'
        );

        await expect(
            clientPage.locator('.fc')
        ).toBeVisible({
            timeout: 15000
        });

        console.log('[PW-041] Calendar opened');

        // ==========================================
        // 4. Kontrollime kalendrisündmust
        // ==========================================

        const calendarEvent = clientPage.getByTestId(
            `client-calendar-event-${bookingId}`
        );

        await expect(calendarEvent).toBeVisible({
            timeout: 20000
        });

        console.log(
            '[PW-041] Client booking found in calendar'
        );

        // ==========================================
        // 5. Avame sündmuse detailakna
        // ==========================================

        await calendarEvent.click();

        const modal = clientPage.getByTestId(
            'client-calendar-modal'
        );

        await expect(modal).toBeVisible();

        // ==========================================
        // 6. Kontrollime kokkulepitud hinda
        // ==========================================

        await expect(
            modal.getByTestId('client-calendar-price')
        ).toHaveText(`${offerPrice} €`);

        // ==========================================
        // 7. Kontrollime staatust
        // ==========================================

        await expect(
            modal.getByTestId('client-calendar-status')
        ).toBeVisible();

        console.log(
            '[PW-041] Client calendar booking verified:',
            bookingId
        );

    } finally {
        await data.cleanup();
    }
});


test('PW-042: Client confirmed booking restored in new browser context', async ({
    browser,
    request
}) => {

    test.setTimeout(180000);

    const data = await setupBookingWithOffer({
        browser,
        request
    });

    let newContext;

    try {
        const {
            clientPage,
            bookingId,
            clientUserId,
            clientUsername,
            clientPassword,
            offerPrice
        } = data;

        // ==========================================
        // 1. Klient kinnitab pakkuja hinnapakkumise
        // ==========================================

        await expect(
            clientPage.getByTestId('new-offers-badge')
        ).toHaveText('1', { timeout: 15000 });

        await clientPage.getByTestId(
            'open-booking-panel'
        ).click();

        const offerItem = findTestOffer(clientPage);

        await expect(offerItem).toBeVisible();
        await offerItem.click();

        await clientPage.getByTestId(
            'order-provider-btn'
        ).click();

        const confirmDialog = clientPage.locator(
            '.deal-modal[role="dialog"]'
        );

        await expect(confirmDialog).toBeVisible();

        const responsePromise = clientPage.waitForResponse(
            response => {
                const url = new URL(response.url());

                return (
                    url.pathname ===
                    `/api/recipients/${bookingId}/confirm-provider-offer` &&
                    response.request().method() === 'POST'
                );
            },
            { timeout: 30000 }
        );

        await confirmDialog.getByTestId(
            'confirm-deal-btn'
        ).click();

        const response = await responsePromise;

        expect(response.status()).toBe(200);

        const result = await response.json();

        expect(result.success).toBe(true);
        expect(result.booking.status).toBe('confirmed');

        console.log(
            '[PW-042] Booking confirmed:',
            bookingId
        );

        // ==========================================
        // 2. Loome uue brauserikonteksti
        // ==========================================

        newContext = await browser.newContext({
            baseURL: 'http://localhost:5174'
        });

        const newClientPage = await newContext.newPage();

        await newClientPage.goto('/login-register');

        // Kontrollime, et kasutaja pole sisse logitud
        const storedUser = await newClientPage.evaluate(() => ({
            local: localStorage.getItem('loggedAppUser'),
            session: sessionStorage.getItem('loggedAppUser')
        }));

        expect(storedUser).toEqual({
            local: null,
            session: null
        });

        console.log(
            '[PW-042] New browser context has no previous session'
        );

        // ==========================================
        // 3. Logime sisse sama kliendina
        // ==========================================

        await loginExistingUser(
            newClientPage,
            clientUsername,
            clientPassword,
            { expectedPath: '/home' }
        );

        // Kontrollime kasutaja identiteeti
        const loggedInUserId = await newClientPage.evaluate(() => {

            const saved =
                sessionStorage.getItem('loggedAppUser') ||
                localStorage.getItem('loggedAppUser');

            if (!saved) return null;

            const user = JSON.parse(saved);

            return user.id ?? user._id;
        });

        expect(String(loggedInUserId)).toBe(
            String(clientUserId)
        );

        console.log(
            '[PW-042] Same client authenticated in new context'
        );

        // Sulgeme teavituse modaalakna, kui see on avatud
        await closeNotificationModal(newClientPage);

        // ==========================================
        // 4. Kontrollime kinnitatud tellimuste arvu
        // ==========================================

        /* const confirmedCount = newClientPage.getByTestId(
            'client-confirmed-count'
        );

        await expect(confirmedCount).toHaveText('1', {
            timeout: 15000
        });

        console.log(
            '[PW-042] Confirmed booking restored in client account'
        ); */




        /* console.log(
            '[PW-042] Confirmed text in page:',
            await newClientPage.locator('body').innerText()
        ); */



        const menu = newClientPage.getByTestId('desktop-user-menu');

        await expect(menu).toBeVisible();

        await expect(menu).toHaveAttribute(
            'aria-expanded',
            'false'
        );


        await menu.click();

        await expect(menu).toHaveAttribute(
            'aria-expanded',
            'true'
        );



        console.log(
            '[PW-042] Dropdown item count:',
            await newClientPage.getByTestId(
                'client-page-dropdown-item'
            ).count()
        );

        console.log(
            '[PW-042] Client panel links:',
            await newClientPage.locator(
                'a[href="/client-panel"]'
            ).count()
        );







        console.log(
            '[PW-042] User menu opened in new context'
        );

        const clientPageItem = newClientPage.getByTestId(
            'client-page-dropdown-item'
        ).filter({ visible: true });

        await expect(clientPageItem).toBeVisible();

        await clientPageItem.click();

        await expect(newClientPage).toHaveURL(url => url.pathname === '/client-panel'
        );

        console.log(
            '[PW-042] Navigated to client page in new context'
        );


        console.log(
            '[PW-042] Current URL after navigation:',
            newClientPage.url()
        );

              


        const confirmedCount = newClientPage.getByTestId(
            'client-confirmed-count'
        );

        await expect(confirmedCount).toHaveText('1', {
            timeout: 15000
        });

        // ==========================================
        // 5. Avame kliendi kalendri
        // ==========================================

        const calendarButton = newClientPage.getByTestId(
            'client-calendar-arrow'
        );

        await expect(calendarButton).toBeVisible();

        await calendarButton.click();

        await expect(newClientPage).toHaveURL(
            url => url.pathname === '/calendar'
        );

        await expect(
            newClientPage.locator('.fc')
        ).toBeVisible({
            timeout: 15000
        });

        console.log(
            '[PW-042] Client calendar opened'
        );

        // ==========================================
        // 6. Kontrollime kinnitatud tellimuse taastamist
        // ==========================================

        const calendarEvent = newClientPage.getByTestId(
            `client-calendar-event-${bookingId}`
        );

        await expect(calendarEvent).toBeVisible({
            timeout: 20000
        });

        console.log(
            '[PW-042] Confirmed booking visible in new context'
        );

        // ==========================================
        // 7. Avame tellimuse detailakna
        // ==========================================

        await calendarEvent.click();

        const modal = newClientPage.getByTestId(
            'client-calendar-modal'
        );

        await expect(modal).toBeVisible();

        // ==========================================
        // 8. Kontrollime tellimuse andmeid
        // ==========================================

        await expect(
            modal.getByTestId('client-calendar-title')
        ).toHaveText(result.booking.header);

        await expect(
            modal.getByTestId('client-calendar-address')
        ).toBeVisible();

        await expect(
            modal.getByTestId('client-calendar-price')
        ).toHaveText(`${offerPrice} €`);

        await expect(
            modal.getByTestId('client-calendar-status')
        ).toBeVisible();

        console.log(
            '[PW-042] SUCCESS: Client booking restored:',
            bookingId
        );

    } finally {

        // Sulgeme uue brauserikonteksti
        try {
            if (newContext) {
                await newContext.close();
            }
        } finally {
            // Kustutame ajutised testandmed
            await data.cleanup();
        }
    }
});


test('PW-043: Client deletes open booking with provider offer', async ({
    browser,
    request
}) => {

    test.setTimeout(180000);

    const data = await setupBookingWithOffer({
        browser,
        request
    });

    let bookingDeleted = false;

    try {

        const {
            clientPage,
            bookingId
        } = data;

        console.log('[PW-043] Booking created:', bookingId);

        // ==========================================
        // 1. Kontrollime hinnapakkumise olemasolu
        // ==========================================

        await expect(
            clientPage.getByTestId('new-offers-badge')
        ).toHaveText('1', { timeout: 15000 });

        console.log('[PW-043] Provider offer received');

        // ==========================================
        // 2. Avame open-tellimuse
        // ==========================================

        await clientPage.getByTestId(
            'open-booking-panel'
        ).click();

        const removeButton = clientPage.getByTestId(
            'client-remove-open-booking'
        );

        await expect(removeButton).toBeVisible();

        console.log('[PW-043] Open booking panel opened');

        // ==========================================
        // 3. Avame kustutamise kinnitusakna
        // ==========================================

        await removeButton.click();

        const modal = clientPage.getByTestId(
            'confirm-modal'
        );

        await expect(modal).toBeVisible();

        await expect(
            modal.getByTestId('confirm-modal-confirm')
        ).toBeVisible();

        console.log('[PW-043] Delete confirmation modal opened');

        // ==========================================
        // 4. Kinnitame kustutamise
        // ==========================================

        const deleteResponsePromise = clientPage.waitForResponse(
            response =>
                new URL(response.url()).pathname ===
                `/api/recipients/${bookingId}` &&
                response.request().method() === 'DELETE',
            { timeout: 30000 }
        );

        await modal.getByTestId(
            'confirm-modal-confirm'
        ).click();

        // ==========================================
        // 5. Kontrollime backendi vastust
        // ==========================================

        const deleteResponse = await deleteResponsePromise;

        expect(deleteResponse.status()).toBe(200);

        const result = await deleteResponse.json();

        expect(result.ok).toBe(true);
        expect(result.deleted).toBe(true);

        bookingDeleted = true;

        expect(String(result.bookingId)).toBe(
            String(bookingId)
        );

        console.log(
            '[PW-043] Backend confirmed booking deletion'
        );

        // ==========================================
        // 6. Kontrollime kasutajaliidest
        // ==========================================

        await expect(
            clientPage.getByTestId(
                'client-remove-open-booking'
            )
        ).toBeHidden({ timeout: 15000 });

        console.log(
            '[PW-043] Deleted booking panel closed'
        );

        console.log('[PW-043] TEST PASSED');

    } finally {

        await data.cleanup({
            bookingAlreadyDeleted: bookingDeleted
        });

    }

});


test('PW-044: Provider receives open booking deletion in real time', async ({ browser, request }) => {
    test.setTimeout(180000);

    const data = await setupBookingWithOffer({
        browser,
        request
    });

    let bookingDeleted = false;

    try {
        const {
            clientPage,
            painterPage,
            bookingId
        } = data;



        painterPage.on('console', msg => {
            console.log('[PROVIDER BROWSER]', msg.text());
        });

        painterPage.on('pageerror', error => {
            console.error('[PROVIDER PAGE ERROR]', error.message);
        });




        // 1. Kontrollime pakkuja tellimuse olemasolu
        const bookingCard = painterPage.getByTestId(
            `provider-incoming-booking-${bookingId}`
        ).filter({ visible: true });




        const bookingCards = painterPage.getByTestId(
            `provider-incoming-booking-${bookingId}`
        );

        console.log(
            '[PW-044] Matching booking cards:',
            await bookingCards.count()
        );

        for (let i = 0; i < await bookingCards.count(); i++) {
            console.log(
                `[PW-044] Card ${i} visible:`,
                await bookingCards.nth(i).isVisible()
            );
        }


        await expect(bookingCard).toBeVisible({
            timeout: 15000
        });

        console.log('[PW-044] Provider booking visible');

        // 2. Enne kustutamist pole kustutamise teadet
        const removedNotice = bookingCard.getByTestId(
            'provider-booking-status-notice'
        );

        await expect(removedNotice).toHaveCount(0);

        // 3. Klient avab open-tellimuse
        await clientPage.getByTestId('open-booking-panel').click();

        const removeButton = clientPage.getByTestId(
            'client-remove-open-booking'
        );

        await expect(removeButton).toBeVisible();

        // 4. Klient avab kustutamise kinnituse
        await removeButton.click();

        const modal = clientPage.getByTestId('confirm-modal');

        await expect(modal).toBeVisible();

        // 5. Jälgime DELETE päringut
        const deleteResponsePromise = clientPage.waitForResponse(
            response =>
                new URL(response.url()).pathname ===
                `/api/recipients/${bookingId}` &&
                response.request().method() === 'DELETE',
            { timeout: 30000 }
        );

        // 6. Klient kinnitab kustutamise
        await modal.getByTestId('confirm-modal-confirm').click();

        const deleteResponse = await deleteResponsePromise;

        expect(deleteResponse.status()).toBe(200);

        const result = await deleteResponse.json();

        expect(result.ok).toBe(true);
        expect(result.deleted).toBe(true);
        expect(String(result.bookingId)).toBe(String(bookingId));

        bookingDeleted = true;

        console.log('[PW-044] Client deleted open booking');

        // 7. Kontrollime pakkuja kasutajaliidese muutumist
        // Lehte EI värskendata!
        await expect(removedNotice).toBeVisible({
            timeout: 15000
        });

        await expect(removedNotice).toHaveClass(
            /booking-status-notice--removed/
        );

        console.log('[PW-044] Provider received deletion in real time');

        // 8. Kontrollime, et tellimuse tegevused on blokeeritud
        const offerButton = bookingCard.getByTestId('open-offer-panel');

        if (await offerButton.count() > 0) {
            await expect(offerButton).toBeDisabled();
        }

        console.log('[PW-044] Provider booking actions disabled');

        console.log('[PW-044] TEST PASSED');

    } finally {
        await data.cleanup({
            bookingAlreadyDeleted: bookingDeleted
        });
    }
});


test('PW-045: Provider receives open booking deletion without offer', async ({ browser, request }) => {

    test.setTimeout(120000);

    const data = await setupBookingWithOffer({
        browser,
        request,
        createOffer: false
    });

    let bookingDeleted = false;

    const {
        clientPage,
        painterPage,
        bookingId
    } = data;

    try {

        // 1. Registreerime Socket.io sündmuse jälgimise

        await painterPage.evaluate(() => {

            const socket = window.__E2E_SOCKET__;

            if (!socket) {
                throw new Error('E2E Socket not available');
            }

            window.__PW045_SOCKET_EVENTS__ = [];

            window.__PW045_SOCKET_HANDLER__ = id => {

                window.__PW045_SOCKET_EVENTS__.push(
                    String(id)
                );

                console.log(
                    '[PW-045 SOCKET RECEIVED]',
                    id
                );
            };

            socket.on(
                'local-client-del-open-booking',
                window.__PW045_SOCKET_HANDLER__
            );
        });


        // 2. Kontrollime, et pakkuja näeb tellimust

        const bookingCard = painterPage.getByTestId(
            `provider-incoming-booking-${bookingId}`
        ).filter({ visible: true });

        await expect(bookingCard).toBeVisible({
            timeout: 15000
        });

        console.log('[PW-045] Provider booking visible');


        // 3. Kontrollime, et hinnapakkumist pole tehtud

        const offerButton = bookingCard.getByTestId(
            'open-offer-panel'
        );

        await expect(offerButton).toBeEnabled();

        console.log('[PW-045] No offer submitted');


        // 4. Enne kustutamist pole staatuse teadet

        const removedNotice = bookingCard.getByTestId(
            'provider-booking-status-notice'
        );

        await expect(removedNotice).toHaveCount(0);


        // 5. Klient avab open-tellimuse

        await clientPage.getByTestId(
            'open-booking-panel'
        ).click();


        // 6. Klient avab kustutamise kinnituse

        const removeButton = clientPage.getByTestId(
            'client-remove-open-booking'
        );

        await expect(removeButton).toBeVisible();

        await removeButton.click();

        const modal = clientPage.getByTestId(
            'confirm-modal'
        );

        await expect(modal).toBeVisible();


        // 7. Klient kinnitab tellimuse kustutamise

        console.log('[PW-045] CLIENT DELETE START');

        const deleteResponsePromise = clientPage.waitForResponse(
            response =>
                new URL(response.url()).pathname ===
                `/api/recipients/${bookingId}` &&
                response.request().method() === 'DELETE',
            { timeout: 30000 }
        );

        await modal.getByTestId(
            'confirm-modal-confirm'
        ).click();

        const deleteResponse = await deleteResponsePromise;

        expect(deleteResponse.status()).toBe(200);

        const result = await deleteResponse.json();

        expect(result.ok).toBe(true);
        expect(result.deleted).toBe(true);

        expect(String(result.bookingId)).toBe(
            String(bookingId)
        );

        bookingDeleted = true;

        console.log('[PW-045] CLIENT DELETE COMPLETED');


        // 8. Kontrollime Socket.io sündmuse saabumist

        await expect.poll(
            async () => painterPage.evaluate(
                () => window.__PW045_SOCKET_EVENTS__ || []
            ),
            { timeout: 15000 }
        ).toContain(String(bookingId));

        console.log('[PW-045] Socket event received');


        // 9. Pakkuja näeb kustutamise teadet
        // ilma lehte värskendamata

        await expect(removedNotice).toBeVisible({
            timeout: 15000
        });

        await expect(removedNotice).toHaveClass(
            /booking-status-notice--removed/
        );

        console.log(
            '[PW-045] Provider received deletion in real time'
        );


        // 10. Hinnapakkumise nupp on blokeeritud

        await expect(offerButton).toBeDisabled();

        console.log('[PW-045] Offer action disabled');

        console.log('[PW-045] TEST PASSED');

    } finally {

        // Eemaldame ainult selle testi Socket.io kuulaja

        if (!painterPage.isClosed()) {
            try {
                await painterPage.evaluate(() => {

                    const socket = window.__E2E_SOCKET__;

                    if (socket && window.__PW045_SOCKET_HANDLER__) {

                        socket.off(
                            'local-client-del-open-booking',
                            window.__PW045_SOCKET_HANDLER__
                        );
                    }

                    delete window.__PW045_SOCKET_HANDLER__;
                    delete window.__PW045_SOCKET_EVENTS__;
                });
            } catch (error) {
                console.warn(
                    '[PW-045] Socket listener cleanup failed:',
                    error.message
                );
            }
        }

        // Testandmete koristamine

        await data.cleanup({
            bookingAlreadyDeleted: bookingDeleted
        });
    }
});


test('PW-046: Provider removes open booking without offer', async ({ browser, request }) => {
    test.setTimeout(120000);

    const data = await setupBookingWithOffer({
        browser,
        request,
        createOffer: false
    });

    const {
        clientPage,
        painterPage,
        bookingId
    } = data;

    try {
        // 1. Pakkuja näeb avatud tellimust
        const bookingCard = painterPage.getByTestId(
            `provider-incoming-booking-${bookingId}`
        ).filter({ visible: true });

        await expect(bookingCard).toBeVisible({
            timeout: 15000
        });

        console.log('[PW-046] Provider booking visible');




        const buttonsDebug = await painterPage.evaluate(() => {
            return [...document.querySelectorAll('button')].map(button => ({
                text: button.textContent?.trim(),
                testId: button.getAttribute('data-testid'),
                disabled: button.disabled,
                visible: button.getClientRects().length > 0,
                html: button.outerHTML.slice(0, 500)
            })).filter(button =>
                button.text?.toUpperCase().includes('POISTA') ||
                button.testId?.includes('remove')
            );
        });

        console.log(
            '[PW-046] REMOVE BUTTONS:',
            JSON.stringify(buttonsDebug, null, 2)
        );



        const debugState = await painterPage.evaluate(() => {

            const buttons = [
                ...document.querySelectorAll(
                    '[data-testid="open-remove-panel-btn"]'
                )
            ];

            return {
                removeButtons: buttons.length,

                buttons: buttons.map(button => ({
                    html: button.outerHTML,
                    visible: button.getClientRects().length > 0,
                    disabled: button.disabled
                }))
            };
        });

        console.log(
            '[PW-046] Remove button debug:',
            JSON.stringify(debugState, null, 2)
        );





        // 2. Pakkuja saab avatud tellimuse eemaldada

        const deleteOrderButton = painterPage.getByTestId(
            'delete-order-btn'
        ).filter({ visible: true });

        await expect(deleteOrderButton).toBeVisible({
            timeout: 15000
        });

        await expect(deleteOrderButton).toBeEnabled();

        console.log('[PW-046] Delete order button visible');


        // 3. Pakkuja vajutab eemaldamise nuppu

        await deleteOrderButton.click();


        // 4. Kontrollime kinnitamise dialoogi

        const modal = painterPage.getByTestId(
            'confirm-modal'
        );

        await expect(modal).toBeVisible({
            timeout: 15000
        });

        console.log('[PW-046] Confirmation modal opened');


        // 5. Kontrollime kinnitamise nuppu

        const modalConfirmButton = modal.getByTestId(
            'confirm-modal-confirm'
        );

        await expect(modalConfirmButton).toBeVisible();
        await expect(modalConfirmButton).toBeEnabled();








        // 6. Jälgime eemaldamise API päringut
        const removeResponsePromise = painterPage.waitForResponse(
            response =>
                new URL(response.url()).pathname ===
                `/api/providers/${bookingId}/recipient` &&
                response.request().method() === 'PUT',
            { timeout: 30000 }
        );

        // 7. Pakkuja kinnitab eemaldamise
        await modal.getByTestId(
            'confirm-modal-confirm'
        ).click();

        const removeResponse = await removeResponsePromise;

        expect(removeResponse.status()).toBe(200);

        const result = await removeResponse.json();

        expect(result.ok).toBe(true);
        expect(result.removed).toBe(true);
        expect(String(result.bookingId)).toBe(String(bookingId));

        console.log('[PW-046] Remove API successful');

        // 8. Tellimus kaob pakkuja nimekirjast
        await expect(bookingCard).toHaveCount(0, {
            timeout: 15000
        });

        console.log('[PW-046] Booking removed from provider list');

        // 9. Kontrollime, et eemaldamine säilib pärast värskendamist
        await painterPage.reload();

        await expect(
            painterPage.getByTestId(
                `provider-incoming-booking-${bookingId}`
            )
        ).toHaveCount(0, {
            timeout: 15000
        });

        console.log('[PW-046] Booking remains removed after reload');

        // 10. Kontrollime, et kliendi tellimus jäi alles
        const clientBooking = clientPage.getByTestId(
            `client-booking-${bookingId}`
        );

        await expect(clientBooking).toBeVisible({
            timeout: 15000
        });

        console.log('[PW-046] Client booking still exists');

        console.log('[PW-046] TEST PASSED');

    } finally {
        await data.cleanup({
            bookingAlreadyDeleted: false
        });
    }
});