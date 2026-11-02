import { expect } from '@playwright/test';

/**
 * Proovib tellimisvormi saata.
 */
export const submitBookingForm = async (page) => {

    const submitButton = page.getByTestId(
        'booking-submit'
    );

    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();

    await submitButton.click();

};

/**
 * Kontrollib, et kasutaja jäi tellimisvormile.
 */
export const expectBookingFormOpen = async (page) => {

    await expect(page).toHaveURL(/\/client-form/);

    await expect(
        page.getByTestId('booking-form')
    ).toBeVisible();
};
