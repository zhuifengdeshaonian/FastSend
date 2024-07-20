<script setup>
useSeoMeta({
  ogImage: 'https://fastsend.ing/ogImg.webp',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Fast Send',
  twitterDescription: 'Fast peer-to-peer file and directory transfers',
  twitterImage: 'https://fastsend.ing/ogImg.webp',
  twitterSite: 'https://fastsend.ing',
  twitterCreator: '@ShouChen_'
})

onMounted(() => {
  useFullScreenLoader(false)
})
</script>

<template>
  <NuxtPwaManifest />
  <NuxtRouteAnnouncer />
  <FullScreenLoader />
  <Toast position="top-right" />
  <NavBar />
  <NuxtPage />
  <div class="my-12">
    <p class="text-center text-sm text-neutral-500/80">fastsend.ing | v0.1.3</p>
  </div>
  <ScrollTop />
</template>
