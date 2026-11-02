import { expect } from '@playwright/test';

export const closeNotificationModal = async (page) => {

    const modal = page.locator(
        '[role="dialog"][aria-modal="true"]'
    );

    // Anname modaalile kuni 3 sekundit ilmumiseks.
    // Kui seda ei ilmu, jätkame testiga.
    try {
        await modal.waitFor({
            state: 'visible',
            timeout: 3000
        });
    } catch (error) {
        if (error.name === 'TimeoutError') {
            console.log('Teavituste modaali ei ilmunud');
            return;
        }

        throw error;
    }

    // Modaal on avatud
    const laterButton = modal.getByRole('button', {
        name: 'Myöhemmin',
        exact: true
    });

    await expect(laterButton).toBeVisible();

    await laterButton.click();

    // Ootame, kuni modaal on täielikult suletud
    await expect(modal).toBeHidden({
        timeout: 10000
    });

    console.log('Teavituste modaal suletud');
};