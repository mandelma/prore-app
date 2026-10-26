import { test, expect } from '@playwright/test';

test('PW-001: DuunHubi avaleht avaneb', async ({ page }) => {

    // Avame DuunHubi
    await page.goto('/');

    // Kontrollime, et leht on nähtav
    await expect(page.locator('body')).toBeVisible();

    // Kontrollime lehe pealkirja
    await expect(page).toHaveTitle(/DuunHub/i);

});