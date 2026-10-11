// @vitest-environment jsdom

import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";

import TestCounter from "../../src/components/TestCounter.vue";

describe("TestCounter.vue", () => {

    it("kuvab algväärtuse 0", () => {
        const wrapper = mount(TestCounter);

        expect(
            wrapper.find('[data-testid="counter-value"]').text()
        ).toBe("Count: 0");
    });

    it("suurendab väärtust nupule vajutamisel", async () => {
        const wrapper = mount(TestCounter);

        await wrapper
            .find('[data-testid="increment-button"]')
            .trigger("click");

        expect(
            wrapper.find('[data-testid="counter-value"]').text()
        ).toBe("Count: 1");
    });

});