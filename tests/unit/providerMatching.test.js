import {
    describe,
    it,
    expect,
    vi
} from "vitest";

import {
    isProviderMatchingBooking
} from "../../src/utils/providerMatching";

describe("Provider matching", () => {

    const booking = {
        latitude: 60.3,
        longitude: 24.8,
        zone: 20
    };

    const provider = {
        latitude: 60.4,
        longitude: 24.9,
        range: 15
    };

    it("sobiv pakkuja jääb mõlema raadiuse sisse", async () => {

        const findDistance = vi.fn()
            .mockResolvedValue({
                distance: "10.0"
            });

        const result =
            await isProviderMatchingBooking(
                provider,
                booking,
                findDistance
            );

        expect(result).toBe(true);

        expect(findDistance).toHaveBeenCalledTimes(1);
    });

    it("kliendi raadiusest väljas olev pakkuja ei sobi", async () => {

        const findDistance = vi.fn()
            .mockResolvedValue({
                distance: "25.0"
            });

        const result =
            await isProviderMatchingBooking(
                provider,
                booking,
                findDistance
            );

        expect(result).toBe(false);
    });

    it("pakkuja raadiusest väljas olev tellimus ei sobi", async () => {

        const findDistance = vi.fn()
            .mockResolvedValue({
                distance: "18.0"
            });

        const result =
            await isProviderMatchingBooking(
                provider,
                booking,
                findDistance
            );

        expect(result).toBe(false);
    });

    it("vigase kauguse korral pakkuja ei sobi", async () => {

        const findDistance = vi.fn()
            .mockResolvedValue({
                distance: undefined
            });

        const result =
            await isProviderMatchingBooking(
                provider,
                booking,
                findDistance
            );

        expect(result).toBe(false);
    });

    it("saadab tellimuse ainult mõlema raadiuse tingimustele vastavale pakkujale", async () => {

        const booking = {
            latitude: 60.3,
            longitude: 24.8,
            zone: 100
        };

        const providerA = {
            latitude: 60.4,
            longitude: 24.9,
            range: 40
        };

        const providerB = {
            latitude: 60.5,
            longitude: 25.0,
            range: 80
        };

        // Simuleerime Google Mapsi kaugusi
        const findDistance = vi.fn()
            .mockResolvedValueOnce({ distance: "50.0" })
            .mockResolvedValueOnce({ distance: "70.0" });

        const matchingA = await isProviderMatchingBooking(
            providerA,
            booking,
            findDistance
        );

        const matchingB = await isProviderMatchingBooking(
            providerB,
            booking,
            findDistance
        );

        expect(matchingA).toBe(false);
        expect(matchingB).toBe(true);

        // Google Mapsi kaugust küsiti üks kord pakkuja kohta
        expect(findDistance).toHaveBeenCalledTimes(2);
    });

    it("puuduva kauguse korral pakkuja ei sobi", async () => {

        const findDistance = vi.fn()
            .mockResolvedValue({
                distance: null
            });

        const result = await isProviderMatchingBooking(
            provider,
            booking,
            findDistance
        );

        expect(result).toBe(false);
    });

});