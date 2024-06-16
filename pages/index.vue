<script setup>
onMounted(() => {
  useIsNavFixed(true)
})
</script>

<template>
  <div>
    <div
      class="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-zinc-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#25272b_1px,transparent_1px)] [background-size:16px_16px]"
    ></div>
    <div class="py-20 px-8 text-center">
      <h1 class="md:text-6xl text-5xl">Fast Sync</h1>
    </div>
    hello
    <Button label="aaa" />
  </div>
</template>
