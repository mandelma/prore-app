<template>
    <div>
        
        <div>
            <MDBLightbox v-if="!isReferenceOverlay"> 
              <div class="lb-row">
                  <div
                    v-for="(image, idx) in imagesToShow.slice(0, 3)"
                    :key="idx"
                    class="lb-col"
                  >
                    <div class="lightbox-thumb">
                        <MDBLightboxItem
                        :src="image.imageId?.imageUrl || image.previewUrl"
                        :fullScreenSrc="image.imageId?.imageUrl || image.previewUrl"
                        :caption="image.text || 'Kuva'"
                        alt="Pro reference"
                        />
                        <div
                        v-if="idx === 2 && imagesToShow.length > 3"
                        class="more-overlay"
                        @click.stop="openReferenceOverlay()"
                        >
                          +{{ imagesToShow.length - 3 }} more
                        </div>
                        <!-- <div v-if="image.text !== ''" class="photo-overlay">
                          <p>{{image.text}}</p>
                        </div> -->
                    </div>
                  </div>
                </div>
                
            </MDBLightbox>
            <MDBLightbox v-else> 
                <div class="lb-row">
                    <div
                    v-for="(image, idx) in imagesToShow"
                    :key="idx"
                    class="lb-col"
                    >
                    <div class="lightbox-thumb">
                        <MDBLightboxItem
                        :src="image.imageUrl || image.previewUrl"
                        :fullScreenSrc="image.imageUrl || image.previewUrl"
                        alt="Pro reference"
                        />
                        
                    </div>
                    </div>
                </div>
                
            </MDBLightbox>
            <div v-if="isReferenceOverlay" style="display: flex; justify-content: right; padding: 7px 0 0 0;"><span style="cursor: pointer;" @click="isReferenceOverlay = false">piilota</span></div>
        </div>
        
    </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import { MDBLightbox, MDBLightboxItem, MDBRow, MDBCol } from 'mdb-vue-ui-kit';

const props = defineProps({
    references: {type: Array, default: () => []}
})

const imagesToShow = computed(() => props.references);

const isReferenceOverlay = ref(false);
const openReferenceOverlay = () => {
    console.log("Overlay opened ");
    isReferenceOverlay.value = true;
}
</script>
<style scoped>

.lb-row{
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.lb-col{
  flex: 0 0 calc(33.333% - 6px); /* 3 per row */
  max-width: calc(33.333% - 6px);
}



.lightbox-thumb{
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 8px;
}

.lightbox-thumb img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}


.thumbs{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.thumb{
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  cursor: pointer;
}

.thumb-img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  background: rgba(0, 0, 0, 0.5);
  /* background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8),
    rgba(0, 0, 0, 0.2),
    transparent
  ); */
  padding: 6px;
  border-radius: 0 0 8px 8px;
  font-size: 13px;
}

.photo-overlay p {
  display: -webkit-box;
  -webkit-line-clamp: 3;   /* max 3 lines */
  -webkit-box-orient: vertical;
  overflow: hidden  ;
  
}


.more-overlay{
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 16px;
  color: white;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(2px);
}
</style>