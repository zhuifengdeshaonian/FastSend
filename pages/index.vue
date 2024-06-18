<script setup>
const localePath = useLocalePath()
const router = useRouter()
const toast = useToast()
const isModernFileAPISupport = ref(true)
const inputCode = ref('')

function syncDir() {
  if (isModernFileAPISupport.value) {
    showDirectoryPicker()
      .then((fh) => {
        useFullScreenLoader(true)
        return dealFilesFromHandler(fh)
      })
      .then((fileMap) => {
        if (Object.keys(fileMap).length === 0) {
          throw '目录为空'
        }
        useFilesInfo('syncDir', fileMap)
      })
      .then(() => {
        router.push(localePath('/sender'))
        useFullScreenLoader(false)
      })
      .catch((e) => {
        console.warn(e)
        toast.add({ severity: 'error', summary: 'Error', detail: e, life: 3000 })
        useFullScreenLoader(false)
      })
  } else {
    // 注意：移动端不支持选择目录
    selectDir((files) => {
      useFilesInfo('syncDir', dealFilesFormList(files))
      router.push(localePath('/sender'))
    })
  }
}

function sendDir() {
  if (isModernFileAPISupport.value) {
    showDirectoryPicker()
      .then((fh) => {
        useFullScreenLoader(true)
        return dealFilesFromHandler(fh)
      })
      .then((fileMap) => {
        if (Object.keys(fileMap).length === 0) {
          throw '目录为空'
        }
        useFilesInfo('transDir', fileMap)
      })
      .then(() => {
        router.push(localePath('/sender'))
        useFullScreenLoader(false)
      })
      .catch((e) => {
        console.warn(e)
        toast.add({ severity: 'error', summary: 'Error', detail: e, life: 3000 })
        useFullScreenLoader(false)
      })
  } else {
    // 注意：移动端不支持选择目录
    selectDir((files) => {
      useFilesInfo('transDir', dealFilesFormList(files))
      router.push(localePath('/sender'))
    })
  }
}

function sendFile() {
  selectFile((file) => {
    useFilesInfo('transFile', dealFilesFormFile(file))
    router.push(localePath('/sender'))
  })
}

watch(
  inputCode,
  () => {
    if (inputCode.value.length === 4) {
      if (/^\d{4}$/.test(inputCode.value)) {
        console.log(114)
        // do
      } else {
        inputCode.value = inputCode.value.replaceAll(' ', '')
      }
    }
    // console.log(inputCode.value)
  },
  { flush: 'sync' }
)

onMounted(() => {
  isModernFileAPISupport.value = isModernFileAPIAvailable()
  useFilesInfo('', {})
})
</script>

<template>
  <div class="md:px-[10vw] pb-8">
    <div
      class="fixed top-0 left-0 right-0 bottom-0 inset-0 -z-50 h-full w-full bg-white dark:bg-zinc-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#25272b_1px,transparent_1px)] [background-size:16px_16px]"
    ></div>
    <div class="py-6 px-8 text-center">
      <h1 class="md:text-6xl text-5xl tracking-wider font-serif">Fast Sync</h1>
      <p
        class="mt-6 leading-6 tracking-wider text-sm md:text-base text-gray-600 dark:text-gray-200"
      >
        {{ $t('description') }}
      </p>
    </div>

    <p
      class="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 p-4"
      v-show="!isModernFileAPISupport"
    >
      <span class="text-red-500">*</span>{{ $t('hint.noModernFileAPIWarn') }}
    </p>

    <div class="md:grid md:grid-cols-2 md:gap-4 mt-10 px-4">
      <div class="flex flex-col items-center space-y-6">
        <h2 class="text-2xl tracking-wider flex flex-row items-center gap-2">
          <Icon name="solar:card-send-linear" />{{ $t('label.quickStart') }}
        </h2>

        <Button
          rounded
          class="block w-full tracking-wider"
          severity="contrast"
          :disabled="!isModernFileAPISupport"
          @click="syncDir"
          ><Icon name="solar:refresh-square-broken" class="mr-2" />目录同步</Button
        >
        <Button
          outlined
          rounded
          class="block w-full tracking-wider"
          severity="contrast"
          :disabled="!isModernFileAPISupport"
          @click="sendDir"
          ><Icon name="solar:folder-with-files-line-duotone" class="mr-2" />发送目录</Button
        >
        <Button
          outlined
          rounded
          class="block w-full tracking-wider"
          severity="contrast"
          @click="sendFile"
          ><Icon name="solar:file-line-duotone" class="mr-2" />发送文件</Button
        >
      </div>

      <div class="flex flex-col items-center space-y-6 mt-8 md:mt-0">
        <h2 class="text-2xl tracking-wider flex flex-row items-center gap-2">
          <Icon name="solar:card-recive-linear" />{{ $t('label.recive') }}
        </h2>

        <InputOtp integerOnly v-model:model-value="inputCode" class="gap-4">
          <template #default="{ attrs, events, index }">
            <input
              :autofocus="index === 1"
              type="number"
              v-bind="attrs"
              v-on="events"
              class="border border-neutral-500/70 rounded bg-neutral-50 dark:bg-zinc-900 focus:outline-none size-12 text-xl text-center no-arrows"
            />
          </template>
        </InputOtp>
      </div>
    </div>
  </div>
</template>
