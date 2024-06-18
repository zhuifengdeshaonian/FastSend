<script setup>
const localePath = useLocalePath()
const router = useRouter()
const toast = useToast()

const filesInfo = useFilesInfo()

onMounted(async () => {
  if (!filesInfo.value.type) {
    router.replace(localePath('/'))
    return
  }
  if (Object.keys(filesInfo.value.fileMap).length === 0) {
    toast.add({ severity: 'warn', summary: 'Warn', detail: '目录为空', life: 3000 })
    router.replace(localePath('/'))
    return
  }

  // for await (let e of fileHandler.value.entries()) {
  //   console.log(e)
  // }
})
</script>

<template>
  <div>
    sender
    {{ filesInfo }}
  </div>
</template>
