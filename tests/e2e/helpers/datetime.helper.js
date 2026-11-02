import { expect } from '@playwright/test';

/**
 * Leiab DateTimePickeri komponendi.
 */
export const getDateTimePicker = (page, testId) => {
    return page.getByTestId(testId);
};

/**
 * Leiab DateTimePickeri tegeliku input-elemendi.
 */
export const expectDateTimePicker = async (page, testId) => {

    const picker = getDateTimePicker(page, testId);

    

    await expect(picker).toBeVisible();

    // Kontrollime, kas data-testid asub otse input-elemendil
    const tagName = await picker.evaluate(
        element => element.tagName.toLowerCase()
    );

    const input = tagName === 'input'
        ? picker
        : picker.locator('input').first();

    await expect(input).toBeVisible();

    return input;
};

/**
 * Avab DateTimePickeri.
 */
export const openDateTimePicker = async (page, testId) => {

    const input = await expectDateTimePicker(
        page,
        testId
    );

    await input.click();

    return input;
};

/**
 * Avab MDB DateTimePickeri kalendri.
 * Kui kalender on juba avatud, ei klõpsa uuesti.
 */
export const openDateTimeCalendar = async (page, testId) => {

    const calendar = page.locator(
        '.datepicker-modal-container:visible'
    );

    // Kui kalender on juba avatud, tagastame selle.
    if (await calendar.isVisible()) {
        return calendar;
    }

    // Avame kalendri ainult vajaduse korral.
    await openDateTimePicker(page, testId);

    await expect(calendar).toBeVisible();

    return calendar;
};

/**
 * Valib MDB kalendrist homse kuupäeva.
 */
export const selectTomorrow = async (
    page,
    testId
) => {

    const calendar = await openDateTimeCalendar(
        page,
        testId
    );

    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    const day = tomorrow.getDate();

    // Kui homme on järgmises kuus,
    // liigume kalendris edasi.
    if (tomorrow.getMonth() !== new Date().getMonth()) {

        await calendar.locator(
            '.datepicker-next-button'
        ).click();

    }

    // Leiame õige kuupäeva
    const dayCell = calendar.locator(
        '.datepicker-day-cell:not(.disabled)'
    ).filter({
        hasText: new RegExp(`^${day}$`)
    });

    await expect(dayCell).toBeVisible();

    await dayCell.click();

    console.log(
        `PW-007: Valitud kuupäev ${tomorrow.toLocaleDateString('fi-FI')}`
    );

    // Kontrollime, et valitud kuupäev on aktiivne
    await expect(dayCell).toHaveAttribute(
        'aria-selected',
        'true'
    );

    // Kinnitame kuupäeva
    const confirmButton = calendar.locator(
        '.datepicker-ok-btn'
    );

    await expect(confirmButton).toBeVisible();

    await confirmButton.click();

    // Ootame kalendri sulgumist
    await expect(calendar).toBeHidden();

    console.log('PW-007: Kuupäev kinnitatud');
};

export const selectTime = async (page, hour, minute) => {

    const modal = page.locator('.timepicker-modal');

    await expect(modal).toBeVisible();

    // 1. Valime tunni
    const hourSelector = hour >= 13 || hour === 0
        ? '.timepicker-time-tips-inner'
        : '.timepicker-time-tips-hours';

    const hourText = hour === 0
        ? '00'
        : String(hour);

    const hourElement = modal
        .locator(hourSelector)
        .filter({
            hasText: new RegExp(`^${hourText}$`)
        });

    await expect(hourElement).toBeVisible();

    await hourElement.click();

    // Kontrollime, et õige tund on valitud
    await expect(
        modal.locator('.timepicker-current.timepicker-hour')
    ).toHaveText(
        String(hour).padStart(2, '0')
    );

    console.log(`PW-007: Valitud tund ${hour}`);

    // 2. Valime minutid
    const minuteText = String(minute).padStart(2, '0');

    const minuteElement = modal
        .locator('.timepicker-time-tips-minutes')
        .filter({
            hasText: new RegExp(`^${minuteText}$`)
        });

    await expect(minuteElement).toBeVisible();

    await minuteElement.click();

    // Kontrollime valitud minuteid
    await expect(
        modal.locator('.timepicker-current.timepicker-minute')
    ).toHaveText(minuteText);

    console.log(`PW-007: Valitud minut ${minuteText}`);

    // 3. Kinnitame kellaaja
    const confirmButton = modal.locator(
        '.timepicker-submit'
    );

    await expect(confirmButton).toBeVisible();

    await confirmButton.click();

    // 4. Kontrollime TimePickeri sulgumist
    await expect(modal).toBeHidden();

    console.log('PW-007: Kellaaeg kinnitatud');
};