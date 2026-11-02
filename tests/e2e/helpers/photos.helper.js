import { expect } from '@playwright/test';

/**
 * Avab piltide lisamise/muutmise paneeli.
 */
export const openPhotoEditor = async (page) => {

    const actions = page.getByTestId(
        'booking-photo-actions'
    );

    await expect(actions).toBeVisible();

    await actions.locator('button').click();

    await expect(
        page.getByTestId('booking-photo-input')
    ).toBeAttached();

};


/**
 * Lisab pildi failisisendi kaudu.
 *
 * @param {Page} page
 * @param {string} filePath
 */
export const addPhoto = async (page, filePath) => {

    const input = page.getByTestId(
        'booking-photo-input'
    );

    await input.setInputFiles(filePath);

    // Kontrollime eelvaate ilmumist
    const previews = page.getByTestId(
        'booking-photo-preview'
    );

    await expect(previews.first()).toBeVisible();

};

export const setPhotoDescription = async (page, text, index = 0) => {
    const description = page
        .getByTestId('booking-photo-description')
        .nth(index);

    await expect(description).toBeVisible();
    await description.fill(text);

    await expect(description).toHaveValue(text);
};


/**
 * Eemaldab pildi muutmisvaates.
 *
 * @param {Page} page
 * @param {number} index
 */
export const removePhoto = async (page, index = 0) => {
    const removeButton = page
        .getByTestId('booking-photo-remove')
        .nth(index);

    await expect(removeButton).toBeVisible();
    await removeButton.click();
};


/**
 * Salvestab piltide muudatused.
 */
export const savePhotos = async (page) => {

    const saveButton = page.getByTestId(
        'booking-photo-save'
    );

    await expect(saveButton).toBeEnabled();

    await saveButton.click();

    await expect(
        page.getByTestId('booking-photo-actions')
    ).toBeVisible();

};


/**
 * Tühistab piltide lisamise või muutmise.
 */
export const cancelPhotoChanges = async (page) => {

    const cancelButton = page.getByTestId(
        'booking-photo-cancel'
    );

    await expect(cancelButton).toBeVisible();

    await cancelButton.click();

    // Kontrollime, et muutmisvaade suleti
    await expect(
        page.getByTestId('booking-photo-input')
    ).toHaveCount(0);

    // Kontrollime, et tavavaade on nähtav
    await expect(
        page.getByTestId('booking-photo-actions')
    ).toBeVisible();

    console.log('PW-009: Piltide muutmine tühistatud');
};