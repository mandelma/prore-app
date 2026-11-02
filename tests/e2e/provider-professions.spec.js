import { test, expect } from '@playwright/test';

import { createTemporaryProvider }
    from './helpers/provider-setup.helper.js';

import { deleteTestProvider }
    from './helpers/provider.helper.js';

import { deleteTestUser }
    from './helpers/user.helper.js';

test(
    'PW-027: Provideri ametite lisamine ja eemaldamine',
    async ({ page }) => {

        test.setTimeout(90000);

        let createdUserId = null;
        let createdProviderId = null;

        try {

            // 1. Loome ajutise Provideri
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

            expect(provider.profession).toContain(
                'house_painter'
            );

            console.log(
                'PW-027: Provider loodud:',
                providerId
            );

            // 2. Avame muutmisvormi
            await page.getByTestId('pro-edit-btn').click();

            const saveButton =
                page.getByTestId('pro-edit-save');

            // 3. Kontrollime algset ametit
            await expect(
                page.getByTestId(
                    'pro-profession-house_painter'
                )
            ).toBeVisible();

            // 4. Lisame uue ameti
            await page.getByTestId(
                'pro-edit-profession-select'
            ).click();

            await page.getByTestId(
                'pro-profession-option-electrician'
            ).click();

            // 5. Kontrollime mõlema ameti olemasolu
            await expect(
                page.getByTestId(
                    'pro-profession-house_painter'
                )
            ).toBeVisible();

            await expect(
                page.getByTestId(
                    'pro-profession-electrician'
                )
            ).toBeVisible();

            await expect(saveButton).toBeEnabled();

            console.log(
                'PW-027: Uus amet lisatud'
            );

            // 6. Eemaldame algse ameti
            await page.getByTestId(
                'pro-profession-house_painter'
            ).getByTestId(
                'pro-remove-profession'
            ).click();

            // 7. Kontrollime, et alles jäi elektrik
            await expect(
                page.getByTestId(
                    'pro-profession-house_painter'
                )
            ).toHaveCount(0);

            await expect(
                page.getByTestId(
                    'pro-profession-electrician'
                )
            ).toBeVisible();

            console.log(
                'PW-027: Algne amet eemaldatud'
            );

            // 8. Kontrollime viimase ameti kaitset
            await expect(
                page.getByTestId(
                    'pro-profession-electrician'
                ).getByTestId(
                    'pro-remove-profession'
                )
            ).toHaveCount(0);

            // 9. Salvestame muudatused
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

            expect(updatedProvider.profession).toEqual([
                'electrician'
            ]);

            console.log(
                'PW-027: Ametite muudatused salvestatud'
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

            expect(reloadedProvider.profession).toEqual([
                'electrician'
            ]);

            // 11. Kontrollime ka Vue kasutajaliidest
            await page.getByTestId('pro-edit-btn').click();

            await expect(
                page.getByTestId(
                    'pro-profession-electrician'
                )
            ).toBeVisible();

            await expect(
                page.getByTestId(
                    'pro-profession-house_painter'
                )
            ).toHaveCount(0);

            console.log(
                'PW-027: Ametite muudatused säilisid pärast reload'
            );

        } finally {

            // 12. Kustutame ajutise Provideri
            if (createdProviderId && createdUserId) {
                await deleteTestProvider(
                    createdProviderId,
                    createdUserId
                );

                console.log(
                    'PW-027: Ajutine Provider kustutatud'
                );
            }

            // 13. Kustutame ajutise kasutaja
            if (createdUserId) {
                await deleteTestUser(createdUserId);

                console.log(
                    'PW-027: Ajutine kasutaja kustutatud'
                );
            }
        }
    }
);