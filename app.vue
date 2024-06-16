<script setup>
onMounted(() => {
  useFullScreenLoader(false)
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <FullScreenLoader />
  <NavBar />
  <NuxtPage />
</template>
