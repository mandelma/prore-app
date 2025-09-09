import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCounterStore = defineStore('counter', () => {
    // state: () => (
    //     {count: 0}
    // ),
    // actions: {
    //     increment() {
    //         this.count++;
    //     }
    // }
    const count = ref(0);

    const increment = () => {
        count.value++;
    }
    return { count, increment };
})