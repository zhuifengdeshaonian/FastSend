<script setup lang="ts">
const isNavFixed = useIsNavFixed(undefined)
const primeVue = usePrimeVue()
const colorMode = useColorMode()

function switchColorMode() {
  if (colorMode.preference === 'light') {
    colorMode.preference = 'dark'
  } else {
    colorMode.preference = 'light'
  }
  //   console.log(colorMode)
}
</script>

<template>
  <nav
    class="flex flex-row items-center py-3 px-4 md:py-4 md:px-20 left-0 right-0 top-0 z-50"
    :class="{ 'sticky backdrop-blur': !isNavFixed, fixed: isNavFixed }"
  >
    <div>FastSync</div>

    <div class="flex-1"></div>

    <div class="contents">
      <Button severity="secondary" text @click="switchColorMode" size="small" class="py-3">
        <Icon
          name="solar:moon-linear"
          class="text-yellow-500/90"
          v-if="colorMode.preference === 'dark'"
        />
        <Icon name="solar:sun-broken" class="text-black" v-else />
      </Button>
    </div>
  </nav>
</template>
