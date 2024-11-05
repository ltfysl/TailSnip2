<template>
  <div class="flex h-screen overflow-hidden">
    <Notification />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import Notification from './components/Notification.vue';
</script>