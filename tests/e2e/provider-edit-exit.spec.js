import { test, expect } from '@playwright/test';

import { createTemporaryProvider }
    from './helpers/provider-setup.helper.js';

import { deleteTestProvider }
    from './helpers/provider.helper.js';

import { deleteTestUser }
    from './helpers/user.helper.js';

test(
    'PW-026: Provider-profiili muutmisest väljumine',
    async ({ page }) => {

        test.setTimeout(90000);

        let createdUserId = null;
        let createdProviderId = null;

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

            console.log('PW-026: Provider loodud:', providerId);

            // 2. Avame muutmisvormi
            await page.getByTestId('pro-edit-btn').click();

            const descriptionInput =
                page.getByTestId('pro-edit-description');

            const rangeInput =
                page.getByTestId('pro-edit-range');

            const priceInput =
                page.getByTestId('pro-edit-price');

            const saveButton =
                page.getByTestId('pro-edit-save');

            // 3. Salvestame algsed väärtused
            const originalDescription =
                provider.description ?? '';

            const originalRange =
                String(provider.range ?? '');

            const originalPrice =
                String(provider.priceByHour ?? '');

            // 4. Muudame väärtusi
            await descriptionInput.fill(
                'Unsaved Playwright description'
            );

            await rangeInput.fill('90');

            await priceInput.fill('85');

            await expect(saveButton).toBeEnabled();

            console.log('PW-026: Salvestamata muudatused sisestatud');

            // 5. Väljume muutmisvormist
            await page.getByTestId('pro-edit-exit').click();

            // Kontrollime, et muutmisvorm sulgus
            await expect(
                page.getByTestId('pro-edit-btn')
            ).toBeVisible();

            await expect(saveButton).toBeHidden();

            console.log('PW-026: Muutmisvorm suletud');

            // 6. Avame muutmisvormi uuesti
            await page.getByTestId('pro-edit-btn').click();

            // 7. Kontrollime, et algsed väärtused taastati
            await expect(descriptionInput).toHaveValue(
                originalDescription
            );

            await expect(rangeInput).toHaveValue(
                originalRange
            );

            await expect(priceInput).toHaveValue(
                originalPrice
            );

            // Salvestamisnupp peab olema keelatud
            await expect(saveButton).toBeDisabled();

            console.log(
                'PW-026: Salvestamata muudatused tühistatud'
            );

            // 8. Kontrollime, et PUT-päringut ei tehtud
            expect(putRequests).toHaveLength(0);

            // 9. Kontrollime serveri andmeid pärast reload'i
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

            expect(putRequests).toHaveLength(0);

            console.log(
                'PW-026: MongoDB andmed jäid muutmata'
            );

        } finally {

            // 10. Kustutame Provideri
            if (createdProviderId && createdUserId) {
                await deleteTestProvider(
                    createdProviderId,
                    createdUserId
                );

                console.log(
                    'PW-026: Ajutine Provider kustutatud'
                );
            }

            // 11. Kustutame kasutaja
            if (createdUserId) {
                await deleteTestUser(createdUserId);

                console.log(
                    'PW-026: Ajutine kasutaja kustutatud'
                );
            }
        }
    }
);