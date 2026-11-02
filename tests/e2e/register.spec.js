import { test, expect } from '@playwright/test';

import {
    fillRegisterForm
} from './helpers/register.helper.js';

test(
    'PW-021: Uue kasutaja registreerimisvormi täitmine',
    async ({ page }) => {

        // Unikaalsed andmed igaks testiks
        const uniqueId = Date.now();

        const user = {
            firstName: 'Playwright',
            lastName: 'Provider',
            username: `playprovider${uniqueId}`,
            email: `playprovider${uniqueId}@example.com`,
            password: 'TestPassword123!'
        };

        // ==========================================
        // ETAPP 1: Vormi täitmine
        // ==========================================

        await fillRegisterForm(page, user);

        // ==========================================
        // ETAPP 2: Sisestatud andmete kontroll
        // ==========================================

        await expect(
            page.locator('#registerFirstName')
        ).toHaveValue(user.firstName);

        await expect(
            page.locator('#registerLastName')
        ).toHaveValue(user.lastName);

        await expect(
            page.locator('#registerUsername')
        ).toHaveValue(user.username);

        await expect(
            page.locator('#registerEmail')
        ).toHaveValue(user.email);

        await expect(
            page.locator('#registerPassword')
        ).toHaveValue(user.password);

        await expect(
            page.locator('#registerPasswordRepeat')
        ).toHaveValue(user.password);

        await expect(
            page.locator('#registerTermsCheck')
        ).toBeChecked();

        await expect(
            page.getByTestId('register-submit')
        ).toBeEnabled();

        console.log(
            'PW-021: Registreerimisvorm täideti edukalt'
        );
    }
);

import { randomUUID } from 'node:crypto';
import { deleteTestUser } from './helpers/user.helper.js';


test(
    'PW-022: Uue kasutaja registreerimine ja automaatne sisselogimine',
    async ({ page}) => {

        // Genereerime iga testi jaoks unikaalse kasutaja
        const uniqueId = randomUUID().replaceAll('-', '');

        const user = {
            firstName: 'Playwright',
            lastName: 'Provider',
            username: `pw${uniqueId}`,
            email: `pw${uniqueId}@example.com`,
            password: 'TestPassword123!'
        };

        let createdUserId = null;

        try {

            // 1. Täidame registreerimisvormi
            await fillRegisterForm(page, user);

            // 2. Ootame registreerimise API vastust
            const registrationPromise = page.waitForResponse(
                response =>
                    new URL(response.url()).pathname === '/api/users' &&
                    response.request().method() === 'POST'
            );

            // 3. Registreerime kasutaja
            await page.getByTestId('register-submit').click();

            const response = await registrationPromise;

            // Salvestame vastuse enne kontrollide tegemist,
            // et saaksime kasutaja vajadusel kustutada.
            const registeredUser = await response.json();

            createdUserId =
                registeredUser.id || registeredUser._id || null;

            // 4. Kontrollime HTTP staatust
            expect(response.status()).toBe(201);

            // 5. Kontrollime registreeritud kasutajat
            expect(createdUserId).toBeTruthy();

            expect(registeredUser.username).toBe(user.username);
            expect(registeredUser.email).toBe(user.email);

            // 6. Kontrollime, et parooliräsi ei tagastata
            expect(registeredUser.passwordHash).toBeUndefined();

            console.log(
                'Registreeritud kasutaja:',
                registeredUser.username
            );

            // 7. Kontrollime automaatset sisselogimist
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

            console.log('Automaatne sisselogimine õnnestus');

        } finally {

            // 8. Kustutame ajutise testkasutaja
            if (createdUserId) {
                await deleteTestUser(createdUserId);

                console.log(
                    'Ajutine testkasutaja kustutatud:',
                    user.username
                );
            }
        }
    }
);