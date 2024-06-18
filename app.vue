<script setup>
onMounted(() => {
  useFullScreenLoader(false)
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <FullScreenLoader />
  <Toast position="top-right" />
  <NavBar />
  <NuxtPage />
</template>
