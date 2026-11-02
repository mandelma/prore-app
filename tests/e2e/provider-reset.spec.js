import { test, expect } from '@playwright/test';

import { createTemporaryProvider }
    from './helpers/provider-setup.helper.js';

import { deleteTestProvider }
    from './helpers/provider.helper.js';

import { deleteTestUser }
    from './helpers/user.helper.js';

test(
    'PW-025: Provider-profiili muudatuste lähtestamine',
    async ({ page }) => {

        test.setTimeout(90000);

        let createdUserId = null;
        let createdProviderId = null;

        // Salvestame kõik testis toimunud Provider PUT-päringud
        const putRequests = [];

        page.on('request', request => {
            if (
                request.method() === 'PUT' &&
                /^\/api\/providers\/[^/]+\/main-update$/.test(
                    new URL(request.url()).pathname
                )
            ) {
                putRequests.push(request.url());
            }
        });

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

            console.log(
                'PW-025: Provider loodud:',
                providerId
            );

            // 2. Avame muutmisvormi
            await page.getByTestId('pro-edit-btn').click();

            const descriptionInput =
                page.getByTestId('pro-edit-description');

            const rangeInput =
                page.getByTestId('pro-edit-range');

            const priceInput =
                page.getByTestId('pro-edit-price');

            const notesInput =
                page.getByTestId('pro-edit-notes');

            const resetButton =
                page.getByTestId('pro-edit-reset');

            const saveButton =
                page.getByTestId('pro-edit-save');

            // 3. Kontrollime algseid väärtusi
            const originalDescription =
                provider.description ?? '';

            const originalRange =
                String(provider.range ?? '');

            const originalPrice =
                String(provider.priceByHour ?? '');

            const originalNotes =
                provider.notes ?? '';

            await expect(descriptionInput).toHaveValue(
                originalDescription
            );

            await expect(rangeInput).toHaveValue(
                originalRange
            );

            await expect(priceInput).toHaveValue(
                originalPrice
            );

            await expect(notesInput).toHaveValue(
                originalNotes
            );

            // Alguses ei tohiks muudatusi olla
            await expect(resetButton).toBeDisabled();
            await expect(saveButton).toBeDisabled();

            console.log(
                'PW-025: Algväärtused kontrollitud'
            );

            // 4. Muudame profiili andmeid
            await descriptionInput.fill(
                'Temporary Playwright description'
            );

            await rangeInput.fill('80');

            await priceInput.fill('75');

            await notesInput.fill(
                'Temporary Playwright notes'
            );

            // 5. Kontrollime muudetud väärtusi
            await expect(descriptionInput).toHaveValue(
                'Temporary Playwright description'
            );

            await expect(rangeInput).toHaveValue('80');

            await expect(priceInput).toHaveValue('75');

            await expect(notesInput).toHaveValue(
                'Temporary Playwright notes'
            );

            // Reset ja Save peavad olema aktiivsed
            await expect(resetButton).toBeEnabled();
            await expect(saveButton).toBeEnabled();

            console.log(
                'PW-025: Muudatused sisestatud'
            );

            // 6. Lähtestame vormi
            await resetButton.click();

            // 7. Kontrollime, et algväärtused taastati
            await expect(descriptionInput).toHaveValue(
                originalDescription
            );

            await expect(rangeInput).toHaveValue(
                originalRange
            );

            await expect(priceInput).toHaveValue(
                originalPrice
            );

            await expect(notesInput).toHaveValue(
                originalNotes
            );

            // 8. Kontrollime, et vorm ei ole enam muudetud
            await expect(resetButton).toBeDisabled();
            await expect(saveButton).toBeDisabled();

            console.log(
                'PW-025: Algväärtused taastatud'
            );

            // 9. Kontrollime, et PUT-päringuid ei saadetud
            expect(putRequests).toHaveLength(0);

            // 10. Kontrollime andmete säilimist serveris
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
                originalDescription
            );

            expect(String(reloadedProvider.range ?? '')).toBe(
                originalRange
            );

            expect(String(reloadedProvider.priceByHour ?? '')).toBe(
                originalPrice
            );

            expect(reloadedProvider.notes ?? '').toBe(
                originalNotes
            );

            // Kontrollime uuesti, et PUT-päringut ei toimunud
            expect(putRequests).toHaveLength(0);

            console.log(
                'PW-025: Serveri andmed jäid muutmata'
            );

        } finally {

            // 11. Kustutame ajutise Provideri
            if (createdProviderId && createdUserId) {
                await deleteTestProvider(
                    createdProviderId,
                    createdUserId
                );

                console.log(
                    'PW-025: Ajutine Provider kustutatud'
                );
            }

            // 12. Kustutame ajutise kasutaja
            if (createdUserId) {
                await deleteTestUser(createdUserId);

                console.log(
                    'PW-025: Ajutine kasutaja kustutatud'
                );
            }
        }
    }
);