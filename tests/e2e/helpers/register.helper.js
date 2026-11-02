import { expect } from '@playwright/test';

export const fillRegisterForm = async (page, user) => {

    // ==========================================
    // ETAPP 1: Registreerimisvormi avamine
    // ==========================================

    await page.goto('/login-register');

    await page.getByTestId('register-form-btn').click();

    const form = page.getByTestId('register-form');

    await expect(form).toBeVisible();

    // ==========================================
    // ETAPP 2: Kasutajaandmete sisestamine
    // ==========================================

    await form.locator('#registerFirstName').fill(
        user.firstName
    );

    await form.locator('#registerLastName').fill(
        user.lastName
    );

    await form.locator('#registerUsername').fill(
        user.username
    );

    await form.locator('#registerEmail').fill(
        user.email
    );

    // ==========================================
    // ETAPP 3: Parool
    // ==========================================

    await form.locator('#registerPassword').fill(
        user.password
    );

    await form.locator('#registerPasswordRepeat').fill(
        user.password
    );

    // ==========================================
    // ETAPP 4: Kasutustingimused
    // ==========================================

    await form.locator(
        '#registerTermsCheck'
    ).check();

    // ==========================================
    // ETAPP 5: Kontrollime vormi valmisolekut
    // ==========================================

    await expect(
        page.getByTestId('register-submit')
    ).toBeEnabled();

    console.log(
        'Registreerimisvorm täidetud:',
        user.username
    );
};