<template>
  <MDBContainer>
    <div >
      <span
          v-for="(star, index) in stars"
          :key="index"
          class="starGap"
          :class="['star', { full: star === 'full', half: star === 'half' }]"
      >
        <span v-if="star === 'full'" class="full-star">★</span>
        <span v-else-if="star === 'half'" class="half-star  ">★</span>
        <span v-else class="star">★</span>


      </span>
    </div>
  </MDBContainer>
</template>

<script>
import { MDBContainer } from 'mdb-vue-ui-kit';
export default {
  name: "RatingStars",
  props: {
    rating: Number
  },
  components: {
    MDBContainer
  },
  data () {
    return {
      //rating: 1.2
    }
  },
  computed: {
    stars() {
      let starsArray = [];
      let fullStars = Math.floor(this.rating);
      let hasHalfStar = this.rating % 1 >= 0.1;

      for (let i = 0; i < fullStars; i++) {
        starsArray.push("full");
      }
      if (hasHalfStar) {
        starsArray.push("half");
      }
      while (starsArray.length < 5) {
        starsArray.push("empty");
      }

      return starsArray;
    }
  }

}
</script>

<style scoped>
.full-star {
  font-size: 37px;
  color: yellow;

}
.half-star {
  font-size: 37px;
  background: linear-gradient(to right, yellow 50%, darkgrey 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}
.star {
  font-size: 37px;
  color: darkgrey;
  display: inline-block;
}
.starGap {
  display: inline-block;
  margin-right: 10px;
}

@media (max-width: 530px) {
  .full-star {
    font-size: 24px;
    color: yellow;
    display: inline-block;
  }
  .half-star {
    font-size: 24px;
    background: linear-gradient(to right, yellow 50%, darkgrey 50%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }
  .star {
    font-size: 24px;
    color: darkgrey;
    display: inline-block;
  }
  .starGap {
    display: inline-block;
    margin-right: 7px;
  }
}
@media(max-width: 440px) {
  .starGap {
    display: inline-block;
    margin-right: 3px;
  }
}
@media(max-width: 330px) {
  .full-star {
    font-size: 17px;
    color: yellow;
    display: inline-block;
  }
  .half-star {
    font-size: 17px;
    background: linear-gradient(to right, yellow 50%, darkgrey 50%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }
  .star {
    font-size: 17px;
    color: darkgrey;
    display: inline-block;
  }
}



/*.stars {*/
/*  text-align: center;*/
/*  display: flex;*/
/*  gap: 10px;*/
/*}*/


.stars {
  font-size: 40px;
  display: flex;
  gap: 5px;
}
</style>