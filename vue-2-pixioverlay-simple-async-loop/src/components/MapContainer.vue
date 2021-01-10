<template>
  <div class="map-container">
    <div class="map">
      <l-map
        :zoom="zoom"
        :center="center"
      >
        
        <l-tile-layer :url="url" />
        
        <l-pixi-overlay
          v-if="ready"
          :markers-length='markersLength'
          :render-marker-per-second='renderMarkerPerSecond'
          @markers-rendered='endCounter'
        />

      </l-map>
    </div>

    <div class="counter">
      <performance-counter v-model="count" ref="counter" />

      <label for="markersLength">Number of Markers</label>
      <input v-model.number="markersLength" name="markersLength" type="number" />      
      
      <label for="renderMarkerPerSecond">Milisecs to render each Marker</label>
      <input v-model.number="renderMarkerPerSecond" name="renderMarkerPerSecond" type="number" />
      
      <button :disabled='count === 0' @click="resetCounter">reset</button>
      
      <button :disabled='count === 0' @click="restartCounter">restart</button>
      
      <button :disabled='count !== 0' @click="startCounter">start</button>
    </div>
  </div>
</template>

<script>
import { latLng } from 'leaflet'
import { LMap, LTileLayer } from 'vue2-leaflet';

export default {
  components: {
    LMap,
    LTileLayer,
    LPixiOverlay: () => import('./LPixiOverlay'),
    PerformanceCounter: () => import('./PerformanceCounter')
  },
  data(){
    return {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      center: latLng([48.838565,  2.449264526367]),
      zoom: 10,
      ready: false,
      count: 0,
      markersLength: 1000,
      renderMarkerPerSecond: 1,
    }
  },
  methods: {
    async restartCounter(){
      this.resetCounter();
      
      await this.$nextTick();

      this.startCounter();
    },
    resetCounter(){
      this.ready = false;
      if (this.$refs.counter) {
        this.$refs.counter.reset();
      }
    },
    startCounter(){
      this.ready = true;

      if (this.$refs.counter) {
        this.$refs.counter.start();
      }
    },
    endCounter(){
      if (this.$refs.counter) {
        this.$refs.counter.stop();
      }
    },
  }
}
</script>

<style>
@import '~leaflet/dist/leaflet.css';

.map-container {
  display: flex;
  margin: 0 auto;
  max-width: 1200px;
  height: 100vh;
  width: 100%;
  align-items: center;
  justify-content: center;
}
.map {
  width: 100%;
  height: 500px;
}
.counter {
  width: 30%;
  padding: 15px;
}

.counter button {
    padding: 5px 10px;
    display: block;
    width: 100%;
    margin-bottom: 15px;
    text-transform: uppercase;
    font-weight: bold;
}

.counter label {
    font-weight: bold;
    margin-bottom: 5px;
    display: block;
}

.counter input {
    padding: 5px 10px;
    display: block;
    width: 100%;
    margin-bottom: 15px;
}

</style>