import { expect } from '@playwright/test';

/**
 * Valib ametipõhise PrimeVue Select komponendi
 * rippmenüüst esimese lubatud väärtuse.
 */
export const selectCustomFieldOption = async (page, fieldKey) => {

    // 1. Leiame ametipõhise välja
    const field = page.getByTestId(
        `custom-field-${fieldKey}`
    );

    await expect(field).toBeVisible();

    // 2. Leiame PrimeVue Select komponendi
    const select = field.locator('.p-select');

    await expect(select).toBeVisible();

    // 3. Avame rippmenüü
    await select.click();

    // 4. Leiame avatud valikute paneeli
    const panel = page.locator(
        '.p-select-overlay:visible'
    );

    await expect(panel).toBeVisible();

    // 5. Valime esimese lubatud väärtuse
    const firstOption = panel.locator(
        '.p-select-option:not(.p-disabled)'
    ).first();

    await expect(firstOption).toBeVisible();

    await firstOption.click();

    // 6. Kontrollime, et väärtus on valitud
    await expect(
        select.locator('.p-select-label')
    ).not.toBeEmpty();

    console.log(
        `PrimeVue Select: ${fieldKey} väärtus valitud`
    );
};

/**
 * Valib PrimeVue MultiSelect komponendist
 * määratud arvu väärtusi.
 */
export const selectCustomMultiOptions = async (
    page,
    fieldKey,
    count = 2
) => {

    const field = page.getByTestId(
        `custom-field-${fieldKey}`
    );

    const multiSelect = field.locator('.p-multiselect');

    await expect(multiSelect).toBeVisible();

    // Avame valikute paneeli
    await multiSelect.click();

    const panel = page.locator(
        '.p-multiselect-overlay:visible:not(.p-anchored-overlay-leave-active)'
    ).last();

    await expect(panel).toBeVisible();

    const options = panel.locator(
        '.p-multiselect-option:not(.p-disabled)'
    );

    const availableCount = await options.count();

    expect(availableCount).toBeGreaterThanOrEqual(count);

    // Valime järjest soovitud arvu väärtusi
    for (let i = 0; i < count; i++) {
        await options.nth(i).click();
    }

    // Sulgeme paneeli
    await page.keyboard.press('Escape');

    // Ootame, kuni selle välja rippmenüü on sulgunud
    await expect(panel).toBeHidden();

    // Kontrollime valitud väärtuste arvu
    await expect(
        multiSelect.locator('.p-multiselect-chip')
    ).toHaveCount(count);

    // Kontrollime valitud väärtuste arvu
    await expect(
        multiSelect.locator('.p-multiselect-chip')
    ).toHaveCount(count);

    console.log(
        `MultiSelect ${fieldKey}: valitud ${count} väärtust`
    );
};