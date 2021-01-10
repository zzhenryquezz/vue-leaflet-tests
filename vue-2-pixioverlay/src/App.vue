<template>
    <map-container></map-container>  
</template>

<script>
export default {
  name: 'App',
  components: {
    MapContainer: () => import('./components/MapContainer.vue')
  }
}
</script>
<style>
* { 
  margin: 0;
  padding: 0;
  box-sizing:border-box
}
</style>