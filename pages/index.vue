<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const toast = useToast()
const isModernFileAPISupport = ref(true)
const isDirSupport = ref(true)
const receiveCode = ref('')

const { data: transCount } = useFetch('/api/transCount', {
  method: 'post',
  onResponseError() {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: t('hint.serviceUnavailable')
    })
  }
})

useSeoMeta({
  title: t('home')
})

function syncDir() {
  // if (isModernFileAPISupport.value) {
  // showDirectoryPicker()
  //   .then((fh) => {
  //     useFullScreenLoader(true)
  //     return dealFilesFromHandler(fh)
  //   })
  //   .then((fileMap) => {
  //     if (Object.keys(fileMap).length === 0) {
  //       throw '目录为空'
  //     }
  //     useFilesInfo('syncDir', fileMap)
  //     router.push(localePath('/sender'))
  //     useFullScreenLoader(false)
  //   })
  //   .catch((e) => {
  //     console.warn(e)
  //     toast.add({ severity: 'error', summary: 'Error', detail: e, life: 3000 })
  //     useFullScreenLoader(false)
  //   })
  // } else {
  // 注意：移动端不支持选择目录
  selectDir()
    .then((files) => {
      useFullScreenLoader(true)
      return dealFilesFormList(files)
    })
    .then((fileMap) => {
      if (Object.keys(fileMap).length === 0) {
        throw 'The directory is empty'
      }
      // console.log(fileMap)
      useFilesInfo('syncDir', fileMap)
      router.push(localePath('/sender'))
    })
    .catch((e) => {
      console.warn(e)
      toast.add({ severity: 'error', summary: 'Error', detail: e, life: 5e3 })
      useFullScreenLoader(false)
    })
  // }
}

function sendDir() {
  // 注意：移动端不支持选择目录
  selectDir()
    .then((files) => {
      useFullScreenLoader(true)
      return dealFilesFormList(files)
    })
    .then((fileMap) => {
      if (Object.keys(fileMap).length === 0) {
        throw '目录为空'
      }
      useFilesInfo('transDir', fileMap)
      router.push(localePath('/sender'))
    })
    .catch((e) => {
      console.warn(e)
      toast.add({ severity: 'error', summary: 'Error', detail: e, life: 5e3 })
      useFullScreenLoader(false)
    })
}

function sendFile() {
  selectFile()
    .then((file) => {
      useFullScreenLoader(true)
      useFilesInfo('transFile', dealFilesFormFile(file))
      router.push(localePath('/sender'))
    })
    .catch((e) => {
      console.warn(e)
      toast.add({ severity: 'error', summary: 'Error', detail: e, life: 5e3 })
      useFullScreenLoader(false)
    })
}

watch(
  receiveCode,
  () => {
    if (receiveCode.value.length === 4) {
      if (/^\d{4}$/.test(receiveCode.value)) {
        useFullScreenLoader(true)
        router.push({ path: localePath('recipient'), query: { code: receiveCode.value } })
      } else {
        receiveCode.value = receiveCode.value.replaceAll(' ', '')
      }
    }
    // console.log(inputCode.value)
  },
  { flush: 'sync' }
)

onMounted(() => {
  isModernFileAPISupport.value = isModernFileAPIAvailable()
  isDirSupport.value = supportsDirectorySelection()
  useFilesInfo('', {})
})
</script>

<template>
  <div class="md:px-[10vw] pb-4">
    <div
      class="fixed top-0 left-0 right-0 bottom-0 inset-0 -z-50 h-full w-full bg-white dark:bg-zinc-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#25272b_1px,transparent_1px)] [background-size:16px_16px]"
    ></div>
    <div class="py-6 px-8 text-center">
      <h1 class="md:text-6xl text-5xl tracking-wider font-serif">Fast Send</h1>
      <p
        class="mt-6 leading-6 tracking-widest text-sm md:text-base text-gray-600 dark:text-gray-200"
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

    <div class="md:grid md:grid-cols-2 gap-4 my-10 px-4">
      <div class="flex flex-col items-center space-y-6">
        <h2 class="text-2xl tracking-wider flex flex-row items-center gap-2">
          <Icon name="solar:card-send-linear" />{{ $t('label.quickStart') }}
        </h2>

        <Button
          outlined
          rounded
          class="block w-full tracking-wider"
          severity="contrast"
          @click="sendFile"
          ><Icon name="solar:file-line-duotone" class="mr-2" />{{ $t('btn.sendFile') }}</Button
        >
        <Button
          outlined
          rounded
          class="block w-full tracking-wider"
          severity="contrast"
          :disabled="!isDirSupport"
          @click="sendDir"
          ><Icon name="solar:folder-with-files-line-duotone" class="mr-2" />{{
            $t('btn.sendDir')
          }}</Button
        >
        <!-- <Button
          rounded
          class="block w-full tracking-wider"
          severity="contrast"
          :disabled="!isModernFileAPISupport"
          @click="syncDir"
          ><Icon name="solar:refresh-square-broken" class="mr-2" />{{ $t('btn.syncDir') }}</Button
        > -->
      </div>

      <div class="flex flex-col items-center space-y-6 md:space-y-12 mt-8 md:mt-0">
        <h2 class="text-2xl tracking-wider flex flex-row items-center gap-2">
          <Icon name="solar:card-recive-linear" />{{ $t('label.receiveCode') }}
        </h2>

        <InputOtp integerOnly v-model:model-value="receiveCode" class="gap-4">
          <template #default="{ attrs, events, index }">
            <input
              :autofocus="index === 1"
              type="number"
              v-bind="attrs"
              v-on="events"
              class="border border-neutral-500/70 rounded bg-neutral-50 dark:bg-zinc-900 focus:outline-none size-14 text-2xl text-center no-arrows"
            />
          </template>
        </InputOtp>
      </div>
    </div>

    <div class="flex flex-row items-baseline justify-center pt-8 text-sm">
      <span>{{ $t('label.transmitted') }}</span>
      <span class="text-2xl m-2 tracking-wider">{{ transCount }}</span>
      <span>{{ $t('label.times') }}</span>
    </div>
  </div>
</template>
