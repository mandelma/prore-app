import {
    describe,
    it,
    expect,
    vi
} from "vitest";

import {
    distributeBooking
} from "../../src/utils/bookingDistribution";

describe("Booking distribution", () => {

    it("saadab tellimuse ainult sobivale pakkujale", async () => {

        // Kliendi loodud tellimus
        const booking = {
            id: "booking123",
            latitude: 60.3,
            longitude: 24.8,
            zone: 100
        };

        const providers = [
            {
                id: "providerA",
                user: { id: "userA" },
                latitude: 60.4,
                longitude: 24.9,
                range: 40
            },
            {
                id: "providerB",
                user: { id: "userB" },
                latitude: 60.5,
                longitude: 25.0,
                range: 80
            },
            {
                id: "providerC",
                user: { id: "currentUser" },
                latitude: 60.6,
                longitude: 25.1,
                range: 100
            }
        ];

        // Simuleerime Google Mapsi kaugusi.
        // Pakkuja C jäetakse vahele, sest see on klient ise.
        const findDistance = vi.fn()
            .mockResolvedValueOnce({ distance: "50.0" })
            .mockResolvedValueOnce({ distance: "70.0" });

        // Simuleerime backend API päringut
        const addProviderData = vi.fn()
            .mockResolvedValue({
                success: true
            });

        const result = await distributeBooking({
            booking,
            providers,
            currentUserId: "currentUser",
            findDistance,
            addProviderData
        });

        // Ainult providerB sobib
        expect(result).toEqual(["userB"]);

        // Google Mapsi poole pöörduti kaks korda
        expect(findDistance).toHaveBeenCalledTimes(2);

        // Backend API kutsuti välja ainult üks kord
        expect(addProviderData).toHaveBeenCalledTimes(1);

        // Kontrollime täpselt, millised andmed saadeti
        expect(addProviderData).toHaveBeenCalledWith(
            "booking123",
            {
                providerId: "providerB"
            }
        );
    });

});