import { defineStore } from "pinia";
import { ref } from "vue";

export const useDebugStore =
    defineStore("debug", () => {

        const logs = ref([]);

        const log = (message, data = null) => {
            const time =
                new Date().toLocaleTimeString();

            let line = `[${time}] ${message}`;

            if (data !== null) {
                try {
                    line += ` ${JSON.stringify(data)}`;
                } catch {
                    line += " [unserializable]";
                }
            }

            logs.value.push(line);

            // Ei lase debug-logil lõputult kasvada
            if (logs.value.length > 100) {
                logs.value.shift();
            }

            console.log(
                `[PWA DEBUG] ${message}`,
                data ?? ""
            );
        };

        const clear = () => {
            logs.value = [];
        };

        return {
            logs,
            log,
            clear
        };
    });