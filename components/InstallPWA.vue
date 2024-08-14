<script lang="ts" setup>
const isPWA = ref(false)
const deferredPrompt = useState('deferredPrompt')

function installPWA() {
  deferredPrompt.value?.prompt()
}

onMounted(() => {
  isPWA.value = isStandalone()
})
</script>

<template>
  <div class="fixed right-5 bottom-36 z-40" v-if="!isPWA && deferredPrompt">
    <Button text raised rounded size="large" aria-label="Install PWA" @click="installPWA">
      <Icon name="ic:outline-install-mobile" class="text-black/90 dark:text-white/90" />
    </Button>
  </div>
</template>

<style></style>
