import { test, expect } from '@playwright/test';

import { loginAsClient, logout } from './helpers/auth.helper';
import { initPwa, checkPwaMode } from './helpers/pwa.helper';

test('PW-002: Kasutaja saab DuunHubi sisse logida', async ({ page }) => {

    // 1. Avame sisselogimislehe
    await page.goto('/login-register');

    // 2. Täidame sisselogimisvormi
    await page.locator('#loginUsername').fill(
        process.env.E2E_USERNAME
    );

    await page.locator('#loginPassword').fill(
        process.env.E2E_PASSWORD
    );

    // 3. Ootame sisselogimise API vastust
    const loginResponsePromise = page.waitForResponse(
        response =>
            response.url().includes('/api/login') &&
            response.request().method() === 'POST'
    );

    // 4. Vajutame sisselogimisnuppu
    await page.locator('button[type="submit"]').click();

    // 5. Kontrollime API vastust
    const loginResponse = await loginResponsePromise;

    expect(loginResponse.status()).toBe(200);

    // 6. Kontrollime suunamist avalehele
    await expect(page).toHaveURL(/\/home(?:[?#]|$)/);

    // 7. Ootame, kuni kasutajaandmed on sessionStorage'is olemas
    await expect.poll(async () => {
        try {
            return await page.evaluate(() => {
                const stored = sessionStorage.getItem('loggedAppUser');

                if (!stored) {
                    return false;
                }

                const user = JSON.parse(stored);

                return Boolean(user.token);
            });
        } catch (error) {
            // Leht võib navigatsiooni ajal vahetuda.
            // Proovime järgmisel kontrollimisel uuesti.
            if (
                error.message.includes('Execution context was destroyed')
            ) {
                return false;
            }

            throw error;
        }
    }, {
        timeout: 10000,
        intervals: [250, 500, 1000]
    }).toBe(true);

});

test('PW-003: Vale parooliga sisselogimine ebaõnnestub', async ({ page }) => {

    // Jälgime kõiki API vastuseid
    page.on('response', response => {
        if (response.url().includes('/api/login')) {
            console.log(
                'API RESPONSE:',
                response.status(),
                response.request().method(),
                response.url()
            );
        }
    });

    // 1. Avame sisselogimislehe
    await page.goto('/login-register');

    // 2. Sisestame testkasutaja nime
    await page.locator('#loginUsername').fill(
        process.env.E2E_USERNAME
    );

    // 3. Sisestame vale parooli
    await page.locator('#loginPassword').fill(
        'KindlastiValeParool123!'
    );

    // 4. Ootame sisselogimispäringu vastust
    const responsePromise = page.waitForResponse(
        response =>
            response.url().includes('/api/login') &&
            response.request().method() === 'POST'
    );

    await page.locator('button[type="submit"]').click();

    const response = await responsePromise;

    // 5. Kontrollime, et backend keeldus sisselogimisest
    expect(response.status()).toBe(401);

    // 6. Kontrollime, et kasutaja jäi sisselogimislehele
    await expect(page).toHaveURL(/\/login-register(?:[?#]|$)/);

    // 7. Kontrollime, et sisselogimisvorm on nähtav
    await expect(page.locator('#loginUsername')).toBeVisible();

    // 8. Kontrollime, et kasutajaandmeid ei salvestatud
    const storedUser = await page.evaluate(() => {
        return sessionStorage.getItem('loggedAppUser');
    });

    expect(storedUser).toBeNull();
});

test('PW-004: Kasutaja saab välja logida', async ({ page }) => {

    // 1. Avame sisselogimislehe
    await page.goto('/login-register');

    // 2. Sisestame kasutajaandmed
    await page.locator('#loginUsername').fill(
        process.env.E2E_USERNAME
    );

    await page.locator('#loginPassword').fill(
        process.env.E2E_PASSWORD
    );

    // 3. Logime sisse
    const loginResponsePromise = page.waitForResponse(
        response =>
            new URL(response.url()).pathname === '/api/login' &&
            response.request().method() === 'POST'
    );

    await page.locator('button[type="submit"]').click();

    const loginResponse = await loginResponsePromise;

    expect(loginResponse.status()).toBe(200);

    // 4. Kontrollime, et kasutaja suunati /home lehele
    await expect(page).toHaveURL(/\/home(?:[?#]|$)/);

    // 5. Ootame kasutajaandmete salvestamist
    await expect.poll(async () => {
        try {
            return await page.evaluate(() => {
                return Boolean(
                    sessionStorage.getItem('loggedAppUser') ||
                    localStorage.getItem('loggedAppUser')
                );
            });
        } catch (error) {
            if (error.message.includes('Execution context was destroyed')) {
                return false;
            }

            throw error;
        }
    }).toBe(true);

    // 6. Sulgeme teavituste modaali, kui see avaneb
    const modal = page.locator(
        '[role="dialog"][aria-modal="true"]'
    );

    if (await modal.isVisible()) {

        console.log('Teavituste modaal on avatud');

        const laterButton = modal.getByRole('button', {
            name: 'Myöhemmin',
            exact: true
        });

        await expect(laterButton).toBeVisible();

        await laterButton.click();

        // Ootame, kuni modaal on suletud
        await expect(modal).toBeHidden();

        console.log('Teavituste modaal suletud');
    }

    // 7. Avame desktopi kasutajamenüü
    const userMenu = page.getByTestId('desktop-user-menu');

    await expect(userMenu).toBeVisible();

    await userMenu.click();

    // Kontrollime, et kasutajamenüü on avatud
    await expect(userMenu).toHaveAttribute(
        'aria-expanded',
        'true'
    );

    // 8. Leiame nähtava väljalogimisnupu
    const logoutButton = page
        .getByTestId('logout-button')
        .filter({ visible: true });

    await expect(logoutButton).toBeVisible({
        timeout: 10000
    });

    // 9. Vajutame väljalogimisnuppu
    await logoutButton.click();

    // 10. Kontrollime, et kasutajaandmed on eemaldatud
    await expect.poll(async () => {
        try {
            return await page.evaluate(() => ({
                local: localStorage.getItem('loggedAppUser'),
                session: sessionStorage.getItem('loggedAppUser')
            }));
        } catch (error) {
            if (error.message.includes('Execution context was destroyed')) {
                return {
                    local: 'navigating',
                    session: 'navigating'
                };
            }

            throw error;
        }
    }, {
        timeout: 10000
    }).toEqual({
        local: null,
        session: null
    });

    // 11. Kontrollime, et kasutaja suunati /home lehele
    await expect(page).toHaveURL(/\/home(?:[?#]|$)/);

    // 12. Kontrollime, et kasutajamenüü pole enam nähtav
    await expect(
        page.getByTestId('desktop-user-menu')
    ).toHaveCount(0);

});

test('PW-005: Kasutaja saab mobiilivaates välja logida', async ({ page }) => {

    // 1. Seadistame mobiilivaate
    await page.setViewportSize({
        width: 390,
        height: 844
    });

    // 2. Seadistame PWA aimulatsiooni
    await initPwa(page);

    // 3. Logime sisse
    await loginAsClient(page);

    // 4. Kontrollime PWA olekut
    await checkPwaMode(page);

    // 5.Log out
    await logout(page, 'mobile-user-menu');
});