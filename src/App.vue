<script setup>
import SellerDashboard from './components/SellerDashboard.vue'
</script>

<template>
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 2rem 0;
}

#app {
  min-height: 100vh;
}
</style>
