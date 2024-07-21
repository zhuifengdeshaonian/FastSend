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
  <AppFooter />
  <ScrollTop />
</template>
