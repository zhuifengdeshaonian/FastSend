<script setup>
const localePath = useLocalePath()
const router = useRouter()

onMounted(async () => {
  const query = router.currentRoute.value.query
  if (!query.code) {
    router.replace(localePath('/'))
    return
  }
})
</script>

<template>
  <div>recipient</div>
</template>
