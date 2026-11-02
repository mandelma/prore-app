import { test, expect } from '@playwright/test';

import { createTemporaryProvider }
    from './helpers/provider-setup.helper.js';

import { deleteTestProvider }
    from './helpers/provider.helper.js';

import { deleteTestUser }
    from './helpers/user.helper.js';

test(
    'PW-028: Provideri aadressi muutmine',
    async ({ page }) => {

        test.setTimeout(90000);

        let createdUserId = null;
        let createdProviderId = null;

        const newAddress = {
            address: 'Mannerheimintie 10, Helsinki, Finland',
            lat: 60.1715,
            lng: 24.9315
        };

        try {

            // 1. Loome ajutise kasutaja ja Provideri
            const {
                userId,
                providerId,
                provider
            } = await createTemporaryProvider(page, {
                onUserCreated: id => {
                    createdUserId = id;
                },
                onProviderCreated: id => {
                    createdProviderId = id;
                }
            });

            expect(provider.address).toBeTruthy();

            console.log(
                'PW-028: Algne aadress:',
                provider.address
            );

            // 2. Avame Provideri muutmisvormi
            await page.getByTestId('pro-edit-btn').click();

            const addressInput =
                page.getByTestId('client-address');

            const saveButton =
                page.getByTestId('pro-edit-save');

            // 3. Kontrollime algset aadressi
            await expect(addressInput).toHaveValue(
                provider.address
            );

            await expect(saveButton).toBeDisabled();

            // 4. Sisestame aadressi käsitsi
            await addressInput.fill(
                'Mannerheimintie 10'
            );

            // 5. Käsitsi sisestatud aadress ei ole kinnitatud
            await expect(saveButton).toBeDisabled();

            console.log(
                'PW-028: Kinnitamata aadressi ei saa salvestada'
            );

            // 6. Simuleerime Google Mapsi aadressivalikut
            await page.evaluate(address => {

                window.dispatchEvent(
                    new CustomEvent(
                        'duunhub:e2e-select-address',
                        {
                            detail: address
                        }
                    )
                );

            }, newAddress);

            // 7. Kontrollime valitud aadressi
            await expect(addressInput).toHaveValue(
                newAddress.address
            );

            // Salvestamisnupp peab nüüd olema aktiivne
            await expect(saveButton).toBeEnabled();

            console.log(
                'PW-028: Google Mapsi aadress kinnitatud'
            );

            // 8. Salvestame uue aadressi
            const [updateResponse] = await Promise.all([

                page.waitForResponse(
                    response =>
                        response.request().method() === 'PUT' &&
                        new URL(response.url()).pathname ===
                        `/api/providers/${providerId}/main-update`,
                    { timeout: 15000 }
                ),

                saveButton.click()

            ]);

            expect(updateResponse.status()).toBe(200);

            const updatedProvider =
                await updateResponse.json();

            // 9. Kontrollime serveri vastust
            expect(updatedProvider.address).toBe(
                newAddress.address
            );

            expect(updatedProvider.latitude).toBe(
                newAddress.lat
            );

            expect(updatedProvider.longitude).toBe(
                newAddress.lng
            );

            console.log(
                'PW-028: Aadress ja koordinaadid salvestatud'
            );

            // 10. Kontrollime andmeid pärast reload'i
            const reloadPromise = page.waitForResponse(
                response =>
                    response.request().method() === 'GET' &&
                    new URL(response.url()).pathname ===
                    `/api/providers/${userId}` &&
                    response.status() === 200,
                { timeout: 15000 }
            );

            await page.reload();

            const reloadResponse = await reloadPromise;

            const reloadedProvider =
                await reloadResponse.json();

            expect(reloadedProvider.id).toBe(providerId);

            expect(reloadedProvider.address).toBe(
                newAddress.address
            );

            expect(reloadedProvider.latitude).toBe(
                newAddress.lat
            );

            expect(reloadedProvider.longitude).toBe(
                newAddress.lng
            );

            console.log(
                'PW-028: Aadress säilis pärast reload'
            );

            // 11. Kontrollime ka Vue kasutajaliidest
            await page.getByTestId('pro-edit-btn').click();

            await expect(
                page.getByTestId('client-address')
            ).toHaveValue(newAddress.address);

            console.log(
                'PW-028: Uus aadress kuvatakse muutmisvormis'
            );

        } finally {

            // 12. Kustutame ajutise Provideri
            if (createdProviderId && createdUserId) {
                await deleteTestProvider(
                    createdProviderId,
                    createdUserId
                );
            }

            // 13. Kustutame ajutise kasutaja
            if (createdUserId) {
                await deleteTestUser(createdUserId);
            }

            console.log(
                'PW-028: Testandmete puhastamine lõpetatud'
            );
        }
    }
);