import { expect } from '@playwright/test';

import { loginAsClient } from './auth.helper.js';

import {
    selectCustomFieldOption,
    selectCustomMultiOptions
} from './select.helper.js';

import {
    expectBookingFormOpen
} from './validation.helper.js'

import {
    selectMockAddress
} from './google-maps.helper.js'

import {
    expectDateTimePicker,
    selectTime,
    selectTomorrow
} from './datetime.helper.js'

export const fillHousePainterBookingForm = async (
    page,
    testHeader,
    {
        skipLogin = false
    } = {}
) => {

    // ==========================================
    // ETAPP 1: Sisselogimine
    // ==========================================

    if (!skipLogin) {
        await loginAsClient(page);
    }

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

    const professionSelect = page.getByTestId(
        'booking-profession'
    );

    await expect(professionSelect).toBeVisible();

    await professionSelect.click();

    const professionList = page.getByRole('listbox');

    await expect(professionList).toBeVisible();

    const professionOption = page.getByTestId(
        'profession-option-house_painter'
    );

    await expect(professionOption).toBeVisible();

    await professionOption.click();

    await expect(professionList).toBeHidden();

    await expect(
        page.getByTestId('custom-field-propertyType')
    ).toBeVisible();

    // ==========================================
    // ETAPP 4: Pealkiri
    // ==========================================

    await page.getByTestId('booking-header').fill(
        testHeader
    );

    // ==========================================
    // ETAPP 5: Aadress
    // ==========================================

    const address = await selectMockAddress(page);

    // ==========================================
    // ETAPP 6: Raadius
    // ==========================================

    await page.getByTestId('client-area').fill('10');

    // ==========================================
    // ETAPP 7: Ametipõhised väljad
    // ==========================================

    await selectCustomFieldOption(
        page,
        'propertyType'
    );

    await selectCustomMultiOptions(
        page,
        'workLocation',
        1
    );

    await selectCustomMultiOptions(
        page,
        'serviceType',
        1
    );

    await selectCustomMultiOptions(
        page,
        'surfaceType',
        1
    );

    await selectCustomFieldOption(
        page,
        'surfaceCondition'
    );

    // ==========================================
    // ETAPP 8: Kuupäev ja kellaaeg
    // ==========================================

    await expectDateTimePicker(
        page,
        'booking-datetime'
    );

    const dateTimeInput = page.getByTestId(
        'booking-datetime'
    );

    await selectTomorrow(
        page,
        'booking-datetime'
    );

    await selectTime(page, 14, 30);

    await expect(dateTimeInput).not.toHaveValue('');

    await expect(dateTimeInput).toHaveValue(
        /14:30/
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

    expect(inputValue).toContain(day);
    expect(inputValue).toContain(month);
    expect(inputValue).toContain(String(year));

    // ==========================================
    // ETAPP 9: Kirjeldus
    // ==========================================

    await page.getByTestId(
        'booking-explanation'
    ).fill(
        'Playwright E2E test booking. ' +
        'This booking is created in the test database.'
    );

    // ==========================================
    // ETAPP 10: Nõusolek
    // ==========================================

    /* await page
        .getByTestId('booking-agreement')
        .locator('input[type="checkbox"]')
        .check(); */

    const agreement = page.getByTestId(
        'booking-agreement'
    );

    await agreement.check();

    console.log(
        'Booking form helper: Kõik väljad täidetud'
    );

    return {
        header: testHeader,
        address,
        zone: 10,
        professionCode: 'house_painter'
    };
};