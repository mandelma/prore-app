import { expect } from '@playwright/test';

export async function selectMockAddress(page) {

    const address = {
        address: 'Mannerheimintie 10, 00100 Helsinki, Finland',
        lat: 60.1708,
        lng: 24.9347
    };

    const addressInput = page.getByTestId('client-address');

    await expect(addressInput).toBeVisible();

    // Saadame Vue komponendile testisündmuse
    await page.evaluate(place => {

        window.dispatchEvent(
            new CustomEvent('duunhub:e2e-select-address', {
                detail: place
            })
        );

    }, address);

    // Kontrollime aadressi kuvamist
    await expect(addressInput).toHaveValue(
        address.address
    );

    console.log(
        'Mock-aadress edukalt valitud'
    );

    return address;
}