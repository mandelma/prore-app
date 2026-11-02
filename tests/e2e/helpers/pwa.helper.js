import { expect } from '@playwright/test';

export const initPwa = async (page) => {

    // Simuleerime PWA standalone-režiimi
    await page.addInitScript(() => {

        const originalMatchMedia = window.matchMedia.bind(window);

        window.matchMedia = (query) => {

            if (query === '(display-mode: standalone)') {

                return {
                    matches: true,
                    media: query,
                    onchange: null,
                    addListener: () => { },
                    removeListener: () => { },
                    addEventListener: () => { },
                    removeEventListener: () => { },
                    dispatchEvent: () => true
                };
            }

            return originalMatchMedia(query);
        };
    });
};


// Kontrollime PWA simulatsiooni
export const checkPwaMode = async (page) => {

    await expect.poll(async () => {

        try {

            return await page.evaluate(() => ({
                isPwa: window.matchMedia(
                    '(display-mode: standalone)'
                ).matches,

                isMobile: window.innerWidth <= 768
            }));

        } catch (error) {

            if (
                error.message?.includes(
                    'Execution context was destroyed'
                )
            ) {
                return {
                    isPwa: false,
                    isMobile: false
                };
            }

            throw error;
        }

    }, {
        timeout: 10000
    }).toEqual({
        isPwa: true,
        isMobile: true
    });

    console.log('PWA simulatsioon töötab');
};