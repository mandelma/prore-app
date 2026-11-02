import { test, expect } from '@playwright/test';

import { createTemporaryProvider }
    from './helpers/provider-setup.helper.js';

import { deleteTestProvider }
    from './helpers/provider.helper.js';

import { deleteTestUser }
    from './helpers/user.helper.js';

test(
    'PW-024: Teenusepakkuja profiili muutmine',
    async ({ page }) => {

        test.setTimeout(90000);

        let createdUserId = null;
        let createdProviderId = null;

        try {

            // 1. Loome ajutise kasutaja ja Provideri
            const {
                userId,
                providerId
            } = await createTemporaryProvider(page, {
                onUserCreated: id => {
                    createdUserId = id;
                },
                onProviderCreated: id => {
                    createdProviderId = id;
                }
            });

            console.log(
                'PW-024: Provider loodud:',
                providerId
            );

            // 2. Avame muutmisvormi
            await page.getByTestId('pro-edit-btn').click();

            await expect(
                page.getByTestId('pro-edit-save')
            ).toBeVisible();

            // 3. Kontrollime, et salvestamine on alguses keelatud
            await expect(
                page.getByTestId('pro-edit-save')
            ).toBeDisabled();

            // 4. Muudame profiili andmeid
            const updatedDescription =
                'Playwright updated provider description';

            const updatedNotes =
                'Updated by Playwright E2E test';

            await page.getByTestId(
                'pro-edit-description'
            ).fill(updatedDescription);

            await page.getByTestId(
                'pro-edit-range'
            ).fill('50');

            await page.getByTestId(
                'pro-edit-price'
            ).fill('60');

            await page.getByTestId(
                'pro-edit-notes'
            ).fill(updatedNotes);

            // 5. Kontrollime, et salvestamine on lubatud
            await expect(
                page.getByTestId('pro-edit-save')
            ).toBeEnabled();

            // 6. Salvestame muudatused
            const [updateResponse] = await Promise.all([
                page.waitForResponse(
                    response =>
                        response.request().method() === 'PUT' &&
                        new URL(response.url()).pathname ===
                        `/api/providers/${providerId}/main-update`,
                    { timeout: 15000 }
                ),

                page.getByTestId('pro-edit-save').click()
            ]);

            expect(updateResponse.status()).toBe(200);

            const updatedProvider =
                await updateResponse.json();

            expect(updatedProvider.id).toBe(providerId);

            expect(updatedProvider.description).toBe(
                updatedDescription
            );

            expect(Number(updatedProvider.range)).toBe(50);

            expect(Number(updatedProvider.priceByHour)).toBe(60);

            expect(updatedProvider.notes).toBe(updatedNotes);

            console.log(
                'PW-024: Provideri andmed uuendatud'
            );

            // 7. Kontrollime, et muutmisvorm sulgus
            await expect(
                page.getByTestId('pro-edit-btn')
            ).toBeVisible();

            // 8. Kontrollime andmete säilimist pärast reload'i
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

            expect(reloadedProvider.description).toBe(
                updatedDescription
            );

            expect(Number(reloadedProvider.range)).toBe(50);

            expect(Number(reloadedProvider.priceByHour)).toBe(60);

            expect(reloadedProvider.notes).toBe(updatedNotes);

            // 9. Kontrollime andmeid ka kasutajaliideses
            await expect(
                page.getByTestId('pro-info-panel')
            ).toContainText(updatedDescription);

            await expect(
                page.getByTestId('pro-info-panel')
            ).toContainText(updatedNotes);

            console.log(
                'PW-024: Muudatused säilisid pärast reload'
            );

        } finally {

            // 10. Kustutame Provider-profiili
            if (createdProviderId && createdUserId) {
                await deleteTestProvider(
                    createdProviderId,
                    createdUserId
                );

                console.log(
                    'PW-024: Ajutine Provider kustutatud'
                );
            }

            // 11. Kustutame ajutise kasutaja
            if (createdUserId) {
                await deleteTestUser(createdUserId);

                console.log(
                    'PW-024: Ajutine kasutaja kustutatud'
                );
            }
        }
    }
);