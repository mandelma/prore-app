import { expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

import { fillRegisterForm } from './register.helper.js';
import { selectMockAddress } from './google-maps.helper.js';

export async function createTemporaryProvider(
    page,
    {
        profession = 'house_painter',
        onUserCreated = () => { },
        onProviderCreated = () => { }
    } = {}
) {

    const uniqueId = randomUUID().replaceAll('-', '');

    const user = {
        firstName: 'Playwright',
        lastName: 'Provider',
        username: `pw${uniqueId}`,
        email: `pw${uniqueId}@example.com`,
        password: 'TestPassword123!'
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

    onUserCreated(userId);

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

    // 3. Avame avalehe
    await page.goto('/');

    // Sulgeme teavituste modaali, kui see on avatud
    const notificationModal = page.locator(
        '.modal.show[role="dialog"]'
    );

    if (await notificationModal.isVisible()) {
        await notificationModal.getByRole(
            'button',
            { name: 'Myöhemmin' }
        ).click();

        await expect(notificationModal).toBeHidden();
    }

    // 4. Avame Provider-vormi
    await page.getByTestId('provider-account').click();

    await expect(page).toHaveURL(
        url => url.pathname === '/provider-form'
    );

    // 5. Täidame vormi
    const providerName = 'Playwright Test Provider';

    await page.locator('#yritys').fill(providerName);

    const address = await selectMockAddress(page);

    await page.getByTestId('provider-range').fill('30');

    await page.getByTestId('booking-profession').click();

    await page.getByTestId(
        `profession-option-${profession}`
    ).click();

    await page.getByTestId('select-hour-price').check();

    await page.getByTestId('hour-price').fill('45');

    await page.getByTestId('provider-description').fill(
        'Playwright E2E test provider'
    );

    // 6. Salvestame Provider-profiili
    const [providerResponse] = await Promise.all([
        page.waitForResponse(
            response =>
                new URL(response.url()).pathname ===
                '/api/providers' &&
                response.request().method() === 'POST',
            { timeout: 15000 }
        ),

        page.getByTestId('create-account').click()
    ]);

    expect(providerResponse.status()).toBe(200);

    const provider = await providerResponse.json();

    const providerId = provider.id ?? provider._id;

    expect(providerId).toBeTruthy();

    onProviderCreated(providerId);

    // 7. Kontrollime salvestatud andmeid
    expect(provider.pName).toBe(providerName);

    expect(provider.profession).toContain(
        profession
    );

    expect(provider.address).toBe(address.address);

    expect(provider.latitude).toBe(address.lat);
    expect(provider.longitude).toBe(address.lng);

    // 8. Kontrollime suunamist
    await expect(page).toHaveURL(
        url => url.pathname === '/admin/provider'
    );

    console.log(
        'Ajutine Provider loodud:',
        providerId
    );

    return {
        userId,
        providerId,
        user,
        provider,
        address
    };
}