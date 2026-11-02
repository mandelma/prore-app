import { expect } from '@playwright/test';

/**
 * Saadab täidetud tellimisvormi ja kontrollib
 * serveri tagastatud tellimust.
 */
export const createBookingAndVerify = async (
    page,
    expectedProfession = 'house_painter'
) => {

    const responsePromise = page.waitForResponse(
        response =>
            new URL(response.url()).pathname === '/api/recipients' &&
            response.request().method() === 'POST'
    );

    // Saadame vormi
    await page.getByTestId('booking-submit').click();

    // Ootame serveri vastust
    const response = await responsePromise;

    console.log(
        'PW-019: API response status:',
        response.status()
    );

    // Server peab tellimuse edukalt looma
    expect([200, 201]).toContain(response.status());

    const booking = await response.json();

    // Kontrollime salvestatud tellimust
    expect(booking.id || booking._id).toBeTruthy();

    expect(booking.professionCode).toBe(
        expectedProfession
    );

    expect(booking.status).toBe('active');

    expect(booking.header).toBeTruthy();

    expect(booking.description).toBeTruthy();

    // Kontrollime ametipõhiseid väärtusi
    expect(booking.customFieldValues).toBeTruthy();

    expect(
        booking.customFieldValues.propertyType
    ).toBeTruthy();

    expect(
        booking.customFieldValues.workLocation
    ).toEqual(
        expect.arrayContaining([expect.anything()])
    );

    expect(
        booking.customFieldValues.serviceType
    ).toBeTruthy();

    expect(
        booking.customFieldValues.surfaceType
    ).toBeTruthy();

    expect(
        booking.customFieldValues.surfaceCondition
    ).toBeTruthy();

    console.log(
        'PW-019: Tellimus edukalt salvestatud:',
        booking.id || booking._id
    );

    return booking;
};

/**
 * Kustutab PW-019 testis loodud tellimuse.
 *
 * Kasutab brauseri autentimisandmeid.
 */
export const deleteTestBooking = async (page, bookingId) => {
    if (!bookingId) {
        throw new Error(
            'Test booking ID is missing'
        );
    }

    const result = await page.evaluate(async id => {
        const savedUser =
            localStorage.getItem('loggedAppUser') ||
            sessionStorage.getItem('loggedAppUser');

        if (!savedUser) {
            throw new Error('Logged-in user not found');
        }

        const user = JSON.parse(savedUser);

        if (!user.token) {
            throw new Error('Authentication token not found');
        }

        const response = await fetch(
            `/api/recipients/${id}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
        );

        return {
            status: response.status,
            data: await response.json()
        };
    }, bookingId);

    expect(result.status).toBe(200);
    expect(result.data.ok).toBe(true);
    expect(result.data.deleted).toBe(true);
    expect(result.data.bookingId).toBe(bookingId);

    console.log(
        'PW-019: Testtellimus kustutatud:',
        bookingId
    );

    return result.data;
};

export const findBookingCard = (page, header) => {
    return page
        .locator('.order-card')
        .filter({
            has: page.locator(
                '.order-card__title',
                { hasText: header }
            )
        });
};

export const deleteTestBookingByApi = async (
    request,
    bookingId,
    token
) => {
    if (!bookingId) {
        throw new Error('Test booking ID is missing');
    }

    if (!token) {
        throw new Error('Authentication token is missing');
    }

    const response = await request.delete(
        `http://localhost:3008/api/recipients/${bookingId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    expect(response.status()).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.deleted).toBe(true);
    expect(data.bookingId).toBe(bookingId);

    console.log(
        '[PW-029 CLEANUP] Test booking deleted:',
        bookingId
    );

    return data;
};