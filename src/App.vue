<script setup>
import SellerDashboard from './components/SellerDashboard.vue'
</script>

<template>
  <div class="background-overlay"></div>
  <div id="app">
    <SellerDashboard />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #000000;
  min-height: 100vh;
  padding: 0;
  margin: 0;
  position: relative;
}

body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: url('/background-image.jpg') center center / cover no-repeat fixed;
  filter: brightness(0.6);
  z-index: 0;
}

.background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(2, 2, 2, 0.840);
  pointer-events: none;
  z-index: 1;
}

#app {
  min-height: 100vh;
  position: relative;
  z-index: 2;
}
</style>
