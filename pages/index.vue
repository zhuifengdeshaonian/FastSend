<script setup>
const localePath = useLocalePath()
const router = useRouter()
const isModernFileAPISupport = ref(true)
const inputCode = ref('')

async function syncDir() {
  const fh = await showDirectoryPicker()
  // console.log(fh)

  useFileHandler(fh)

  router.push({ path: localePath('/sender'), query: { type: 'syncDir' } })
}

function sendDir() {}

function sendFile() {}

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
})
</script>

<template>
  <div class="md:px-[10vw] pb-8">
    <div
      class="absolute inset-0 -z-50 h-full w-full bg-white dark:bg-zinc-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#25272b_1px,transparent_1px)] [background-size:16px_16px]"
    ></div>
    <div class="py-6 px-8 text-center">
      <h1 class="md:text-6xl text-5xl tracking-wider font-serif">Fast Sync</h1>
      <p class="mt-6 leading-6 tracking-wider text-gray-600 dark:text-gray-200">
        {{ $t('description') }}
      </p>
    </div>

    <p class="text-sm text-neutral-600 dark:text-neutral-400 p-4" v-show="!isModernFileAPISupport">
      <span class="text-red-500">*</span
      >警告：您的浏览器不支持现代文件访问API，无法使用接收`目录同步`以及`接收目录`功能，同时接收文件限制1GB。
    </p>

    <div class="md:grid md:grid-cols-2 md:gap-4 mt-10 px-4">
      <div class="flex flex-col items-center space-y-6">
        <h2 class="text-2xl tracking-wider flex flex-row items-center gap-2">
          <Icon name="solar:card-send-linear" />{{ $t('label.quickStart') }}
        </h2>

        <Button rounded class="block w-full tracking-wider" severity="contrast" @click="syncDir"
          ><Icon name="solar:refresh-square-broken" class="mr-2" />目录同步</Button
        >
        <Button outlined rounded class="block w-full tracking-wider" severity="contrast"
          ><Icon name="solar:folder-with-files-line-duotone" class="mr-2" />发送目录</Button
        >
        <Button outlined rounded class="block w-full tracking-wider" severity="contrast"
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
