import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

import { fillRegisterForm } from './helpers/register.helper.js';
import { deleteTestUser } from './helpers/user.helper.js';
import { selectMockAddress } from './helpers/google-maps.helper.js';

import { deleteTestProvider } from './helpers/provider.helper.js';





test(
    'PW-023: Teenusepakkuja profiili loomine',
    async ({ page }) => {

        test.setTimeout(60000);

        let createdUserId = null;
        let createdProviderId = null;

        page.on('request', request => {
            if (request.url().includes('/api/providers/')) {
                console.log(
                    'PROVIDER REQUEST:',
                    request.method(),
                    request.url()
                );
            }
        });

        page.on('response', response => {
            if (response.url().includes('/api/providers/')) {
                console.log(
                    'PROVIDER RESPONSE:',
                    response.status(),
                    response.url()
                );
            }
        });

        page.on('pageerror', error => {
            console.error('PAGE ERROR:', error.message);
        });

        page.on('close', () => {
            console.log('PAGE CLOSED');
        });







        const uniqueId = randomUUID().replaceAll('-', '');

        const user = {
            firstName: 'Playwright',
            lastName: 'Provider',
            username: `pw${uniqueId}`,
            email: `pw${uniqueId}@example.com`,
            password: 'TestPassword123!'
        };

        try {

            // 1. Registreerime ajutise kasutaja
            await fillRegisterForm(page, user);

            const registrationPromise = page.waitForResponse(
                response =>
                    new URL(response.url()).pathname === '/api/users' &&
                    response.request().method() === 'POST'
            );

            await page.getByTestId('register-submit').click();

            const response = await registrationPromise;
            const registeredUser = await response.json();

            expect(response.status()).toBe(201);

            createdUserId =
                registeredUser.id ||
                registeredUser._id ||
                null;

            expect(createdUserId).toBeTruthy();

            // 2. Kontrollime automaatset sisselogimist
            await expect.poll(async () => {
                return page.evaluate(() => {
                    const saved =
                        localStorage.getItem('loggedAppUser') ||
                        sessionStorage.getItem('loggedAppUser');

                    return saved
                        ? JSON.parse(saved).username
                        : null;
                });
            }).toBe(user.username);

            console.log('Ajutine kasutaja registreeritud');


            // 3. Avame avalehe
            await page.goto('/');

            // Sulgeme teavituste modaali, kui see on avatud
            const notificationModal = page.locator(
                '.modal.show[role="dialog"]'
            );
        
            if (await notificationModal.isVisible()) {
        
                const laterButton = notificationModal.getByRole(
                    'button',
                    { name: 'Myöhemmin' }
                );
        
                await laterButton.click();
        
                await expect(notificationModal).toBeHidden();
            }

            // 4. Avame teenusepakkuja vormi
            await page.getByTestId('provider-account').click();

            await expect(page).toHaveURL(
                url => url.pathname === '/provider-form'
            );

            // 5. Täidame teenusepakkuja vormi

            const providerName = 'Playwright Test Provider';

            // Ettevõtte nimi
            await page.locator('#yritys').fill(providerName);

            // Aadress koos koordinaatidega
            const address = await selectMockAddress(page);

            // Teenindusraadius
            await page.getByTestId('provider-range').fill('30');

            // Amet
            await page.getByTestId('booking-profession').click();

            await page.getByTestId(
                'profession-option-house_painter'
            ).click();

            // Tunnitasu
            await page.getByTestId('select-hour-price').check();

            await page.getByTestId('hour-price').fill('45');

            // Kirjeldus
            await page.getByTestId('provider-description').fill(
                'Playwright E2E test provider'
            );

            console.log('PW-023: Teenusepakkuja vorm täidetud');







            // 6. Valmistume API vastuse ootamiseks
            /* const providerResponsePromise = page.waitForResponse(
                response =>
                    /\/api\/providers\/[^/]+$/.test(
                        new URL(response.url()).pathname
                    ) &&
                    response.request().method() === 'POST'
            ); */

            // 7. Salvestame teenusepakkuja profiili
            //await page.getByTestId('create-account').click();

            // 8. Kontrollime API vastust
            //const providerResponse = await providerResponsePromise;


            console.log('PW-023: Alustan Provider-profiili salvestamist');

            const [providerResponse] = await Promise.all([
                page.waitForResponse(
                    response =>
                        new URL(response.url()).pathname === '/api/providers' &&
                        response.request().method() === 'POST',
                    { timeout: 15000 }
                ),

                page.getByTestId('create-account').click()
            ]);

            console.log(
                'PW-023: Provider API vastus:',
                providerResponse.status()
            );


           

            expect(providerResponse.status()).toBe(200);

            const createdProvider = await providerResponse.json();

            console.log(
                'PW-023: Provider API response:',
                JSON.stringify(createdProvider, null, 2)
            );

            createdProviderId = createdProvider.id;

            expect(createdProviderId).toBeTruthy();

            expect(createdProvider.pName).toBe(providerName);

            expect(createdProvider.profession).toContain(
                'house_painter'
            );

            expect(createdProvider.address).toBe(address.address);

            expect(createdProvider.latitude).toBe(address.lat);

            expect(createdProvider.longitude).toBe(address.lng);

            console.log(
                'PW-023: Provider-profiil salvestatud:',
                createdProviderId
            );

            // 9. Kontrollime suunamist
            await expect(page).toHaveURL(
                url => url.pathname === '/admin/provider'
            );


            // 10. Kontrollime profiili säilimist pärast lehe värskendamist

            console.log('PW-023: Värskendan Provider halduslehte');

            // Alustame profiili uuesti laadimise API vastuse ootamist
            // enne lehe värskendamist.
            const providerReloadPromise = page.waitForResponse(
                response =>
                    response.request().method() === 'GET' &&
                    new URL(response.url()).pathname ===
                    `/api/providers/${createdUserId}` &&
                    response.status() === 200,
                { timeout: 15000 }
            );

            // Värskendame lehte
            await page.reload();

            // Ootame, kuni backendist on profiili andmed laaditud
            const reloadResponse = await providerReloadPromise;

            const reloadedProvider = await reloadResponse.json();

            console.log(
                'PW-023: Provider andmed pärast reload:',
                reloadedProvider
            );

            // Kontrollime, et tegemist on sama profiiliga
            expect(reloadedProvider.id).toBe(createdProviderId);

            // Kontrollime ettevõtte nime
            expect(reloadedProvider.pName).toBe(providerName);

            // Kontrollime ametit
            expect(reloadedProvider.profession).toContain(
                'house_painter'
            );

            // Kontrollime aadressi
            expect(reloadedProvider.address).toBe(address.address);

            // Kontrollime koordinaate
            expect(reloadedProvider.latitude).toBe(address.lat);
            expect(reloadedProvider.longitude).toBe(address.lng);

            // Kontrollime, et kasutaja jäi halduslehele
            await expect(page).toHaveURL(
                url => url.pathname === '/admin/provider'
            );

            console.log(
                'PW-023: Provider andmed säilisid pärast lehe värskendamist'
            );

        } finally {

            // Kõigepealt kustutame Provider-profiili
            if (createdProviderId && createdUserId) {
                await deleteTestProvider(
                    createdProviderId,
                    createdUserId
                );

                console.log(
                    'PW-023: Ajutine Provider-profiil kustutatud'
                );
            }

            // Seejärel kustutame kasutajakonto
            if (createdUserId) {
                await deleteTestUser(createdUserId);

                console.log(
                    'PW-023: Ajutine kasutajakonto kustutatud'
                );
            }
        }
    }
);