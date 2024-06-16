<script setup>
const localePath = useLocalePath()
const router = useRouter()

const fileHandler = useFileHandler()

onMounted(async () => {
  const query = router.currentRoute.value.query
  if (!fileHandler.value) {
    router.replace(localePath('/'))
    return
  }

  for await (let e of fileHandler.value.entries()) {
    console.log(e)
  }
})
</script>

<template>
  <div>sender</div>
</template>
