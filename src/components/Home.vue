<template>
 <div>
   <h2>Homepage</h2>
   <h3>Current count</h3>
   <MDBBtn color="success" @click="counter.increment">Suurenda +</MDBBtn>
   {{counter.count}}
 </div>
</template>

<script>
import { MDBBtn } from 'mdb-vue-ui-kit'
import { ref } from 'vue'
import { useCounterStore } from '@/stores/counter'
export default {
  name: "Home",
  components: {
    MDBBtn
  },
  setup () {
    const counter = ref(useCounterStore())
    return {
      counter
    }
  }
}
</script>

<style scoped>

</style>