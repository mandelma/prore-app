<script setup>
import { ref } from "vue";

const count = ref(0);

const increment = () => {
    count.value++;
};
</script>

<template>
    <div>
        <p data-testid="counter-value">
            Count: {{ count }}
        </p>

        <button
            data-testid="increment-button"
            @click="increment"
        >
            Increment
        </button>
    </div>
</template>