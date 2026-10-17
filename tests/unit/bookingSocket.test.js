import {
    describe,
    it,
    expect,
    vi
} from "vitest";

import {
    distributeBooking
} from "../../src/utils/bookingDistribution";

import {
    notifyBookingProviders
} from "../../src/utils/bookingSocket";

describe("Booking Socket.io notifications", () => {

    it("saadab Socket.io sündmuse õigetele pakkujatele", () => {

        const socket = {
            emit: vi.fn()
        };

        const providerUserIds = [
            "userA",
            "userB"
        ];

        const result = notifyBookingProviders({
            socket,
            providerUserIds,
            bookingId: "booking123"
        });

        expect(result).toBe(true);

        expect(socket.emit).toHaveBeenCalledTimes(1);

        expect(socket.emit).toHaveBeenCalledWith(
            "create-booking-multiple",
            ["userA", "userB"],
            "booking123"
        );
    });

    it("ei saada Socket.io sündmust, kui sobivaid pakkujaid pole", () => {

        const socket = {
            emit: vi.fn()
        };

        const result = notifyBookingProviders({
            socket,
            providerUserIds: [],
            bookingId: "booking123"
        });

        expect(result).toBe(false);

        expect(socket.emit).not.toHaveBeenCalled();
    });

    it("teavitab ainult pakkujat, kelle tellimuse sidumine õnnestus", async () => {

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
                range: 80
            },
            {
                id: "providerB",
                user: { id: "userB" },
                latitude: 60.5,
                longitude: 25.0,
                range: 80
            }
        ];

        // Mõlemad pakkujad vastavad kaugustingimustele
        const findDistance = vi.fn()
            .mockResolvedValueOnce({ distance: "30.0" })
            .mockResolvedValueOnce({ distance: "40.0" });

        // Esimese pakkuja API-päring ebaõnnestub
        const addProviderData = vi.fn()
            .mockRejectedValueOnce(new Error("Server error"))
            .mockResolvedValueOnce({ success: true });

        const socket = {
            emit: vi.fn()
        };

        // 1. Jagame tellimuse pakkujatele
        const providerUserIds = await distributeBooking({
            booking,
            providers,
            currentUserId: "currentUser",
            findDistance,
            addProviderData
        });

        // 2. Saadame Socket.io teavituse
        notifyBookingProviders({
            socket,
            providerUserIds,
            bookingId: booking.id
        });

        // 3. Ainult teine pakkuja sai tellimuse
        expect(providerUserIds).toEqual(["userB"]);

        // 4. Socket.io teavitus saadetakse ainult teisele pakkujale
        expect(socket.emit).toHaveBeenCalledTimes(1);

        expect(socket.emit).toHaveBeenCalledWith(
            "create-booking-multiple",
            ["userB"],
            "booking123"
        );
    });

});

