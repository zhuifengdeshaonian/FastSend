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
  <div class="my-12">
    <p class="text-center text-sm text-neutral-500/80">fastsend.ing | v0.1.1</p>
  </div>
  <ScrollTop />
</template>
