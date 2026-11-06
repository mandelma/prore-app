import { expect } from '@playwright/test';
import { fillRegisterForm } from './register.helper.js';

export async function loginAsClient(page) {
    page.on('framenavigated', frame => {
        if (frame === page.mainFrame()) {
            console.log(
                'DOCUMENT NAVIGATION:',
                frame.url()
            );
        }
    });

    page.on('pageerror', error => {
        console.error(
            'BROWSER PAGE ERROR:',
            error.message
        );
    });

    page.on('framenavigated', frame => {
        if (frame === page.mainFrame()) {
            console.log(
                'DOCUMENT NAVIGATION:',
                frame.url()
            );
        }
    });

    // 1. Avame sisselogimislehe
    await page.goto('/login-register');

    // 2. Sisestame kasutajaandmed
    await page.locator('#loginUsername').fill(
        process.env.E2E_USERNAME
    );

    await page.locator('#loginPassword').fill(
        process.env.E2E_PASSWORD
    );

    // 3. Valmistume API vastuse ootamiseks
    const loginResponsePromise = page.waitForResponse(
        response =>
            new URL(response.url()).pathname === '/api/login' &&
            response.request().method() === 'POST'
    );

    // 4. Logime sisse
    await page.locator('button[type="submit"]').click();

    // 5. Kontrollime serveri vastust
    const loginResponse = await loginResponsePromise;

    expect(loginResponse.status()).toBe(200);

    console.log(
        'LOGIN API STATUS:',
        loginResponse.status()
    );


    console.log(
        'STORAGE:',
        await page.evaluate(() => {

            const localUser =
                localStorage.getItem('loggedAppUser');

            const sessionUser =
                sessionStorage.getItem('loggedAppUser');

            const parseUser = value => {
                if (!value) return null;

                try {
                    const user = JSON.parse(value);

                    return {
                        id: user.id,
                        role: user.role,
                        isProvider: user.isProvider
                    };
                } catch {
                    return { invalidJSON: true };
                }
            };

            return {
                local: parseUser(localUser),
                session: parseUser(sessionUser)
            };
        })
    );

    // 6. Ootame kasutajaandmete salvestamist
    await expect.poll(async () => {

        try {

            return await page.evaluate(() => {
                return Boolean(
                    localStorage.getItem('loggedAppUser') ||
                    sessionStorage.getItem('loggedAppUser')
                );
            });

        } catch (error) {

            // Lehe ümbersuunamisel võib JS kontekst hävida
            if (
                error.message?.includes(
                    'Execution context was destroyed'
                )
            ) {
                return false;
            }

            throw error;
        }

    }, {
        timeout: 15000
    }).toBe(true);

    console.log(
        'LOGIN: Kasutajaandmed salvestatud'
    );

    // 7. Ootame avalehele suunamist
    await expect(page).toHaveURL(
        url => url.pathname === '/home',
        { timeout: 15000 }
    );

    console.log(
        'LOGIN: Suunamine õnnestus:',
        page.url()
    );
}

export const loginExistingUser = async (
    page,
    username,
    password,
    { expectedPath = '/home'} = {}
) => {

    // 1. Avame sisselogimislehe
    await page.goto('/login-register');

    // 2. Täidame sisselogimisvormi
    await page.locator('#loginUsername').fill(username);

    await page.locator('#loginPassword').fill(password);

    // 3. Ootame sisselogimise API vastust
    const loginResponsePromise = page.waitForResponse(
        response =>
            new URL(response.url()).pathname === '/api/login' &&
            response.request().method() === 'POST'
    );

    // 4. Logime sisse
    await page.locator('button[type="submit"]').click();

    const response = await loginResponsePromise;

    expect(response.status()).toBe(200);

    // 5. Kontrollime sisselogimist
    await expect(page).toHaveURL(
        url => url.pathname === expectedPath
    );

    // 6. Kontrollime kasutajaandmete salvestamist
    await expect.poll(async () => {

        try {
            return await page.evaluate(() => {

                const stored =
                    sessionStorage.getItem('loggedAppUser') ||
                    localStorage.getItem('loggedAppUser');

                if (!stored) return null;

                const user = JSON.parse(stored);

                return user.token ? user.username : null;
            });

        } catch (error) {

            if (
                error.message.includes(
                    'Execution context was destroyed'
                )
            ) {
                return null;
            }

            throw error;
        }

    }, {
        timeout: 10000,
        intervals: [250, 500, 1000]
    }).toBe(username);

    console.log('[LOGIN] Existing user logged in');
};

import { randomUUID } from 'node:crypto';


export const registerAndLoginAsClient = async (page) => {

    const uniqueId = randomUUID().replaceAll('-', '');

    const user = {
        firstName: 'Playwright',
        lastName: 'Client',
        username: `pw${uniqueId}`,
        email: `pw${uniqueId}@example.com`,
        password: 'ClientPassword123!'
    };

    // 1. Registreerime ajutise kasutaja
    await fillRegisterForm(page, user);

    const [registrationResponse] = await Promise.all([
        page.waitForResponse(
            response =>
                new URL(response.url()).pathname === '/api/users' &&
                response.request().method() === 'POST'
        ),

        page.getByTestId('register-submit').click()
    ]);

    expect(registrationResponse.status()).toBe(201);

    const registeredUser = await registrationResponse.json();

    const userId =
        registeredUser.id ??
        registeredUser._id;

    expect(userId).toBeTruthy();

    console.log("Registered user id - " + userId);

    await expect.poll(async () => {
        return page.evaluate(() => {
            const savedUser =
                localStorage.getItem('loggedAppUser') ||
                sessionStorage.getItem('loggedAppUser');

            return savedUser
                ? JSON.parse(savedUser).username
                : null;
        });
    }).toBe(user.username);

    return { userId, user };
}

export const logout = async (page, menuId) => {

    // 1. Leiame kasutajamenüü
    const userMenu = page.getByTestId(menuId);

    // 2. Kontrollime nähtavust
    await expect(userMenu).toBeVisible();

    // 3. Kontrollime, et menüü on suletud
    await expect(userMenu).toHaveAttribute(
        'aria-expanded',
        'false'
    );

    // 4. Avame menüü
    await userMenu.click();

    // 5. Kontrollime, et menüü avanes
    await expect(userMenu).toHaveAttribute(
        'aria-expanded',
        'true'
    );

    // 6. Leiame väljalogimisnupu
    const logoutButton = page
        .getByTestId('logout-button')
        .filter({ visible: true });

    await expect(logoutButton).toBeVisible();

    // 7. Logime välja
    await logoutButton.click();

    // 8. Kontrollime kasutajaandmete eemaldamist
    await expect.poll(async () => {

        return await page.evaluate(() => ({
            local: localStorage.getItem('loggedAppUser'),
            session: sessionStorage.getItem('loggedAppUser')
        }));

    }, {
        timeout: 10000
    }).toEqual({
        local: null,
        session: null
    });

    // 9. Kontrollime avalehele suunamist
    await expect(page).toHaveURL(
        url => url.pathname === '/home'
    );

    // 10. Kontrollime, et kasutajamenüü kadus
    await expect(userMenu).toHaveCount(0);

    console.log('LOGGED OUT');
}; 