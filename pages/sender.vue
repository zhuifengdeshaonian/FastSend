<script setup lang="ts">
import CryptoJs from 'crypto-js'
import { PeerDataChannel } from '~/utils/PeerDataChannel'

const localePath = useLocalePath()
const router = useRouter()
const toast = useToast()
const userInfo = useUserInfo()
const peerUserInfo = ref({ nickname: 'unknown', avatarURL: '' })
const filesInfo = useFilesInfo()
const code = ref('')
const status = ref({
  isIniting: true,
  isConnectServer: false,
  isConnectPeer: false,
  isWaitingConnect: true,
  isWaitingConfirm: true,
  isDone: false,
  error: {
    code: 0,
    msg: ''
  },
  warn: {
    code: 0,
    msg: ''
  }
})

let ws: WebSocket | null
let pdc: PeerDataChannel | null

function dispose() {
  ws?.close()
  pdc?.dispose()
}

async function confirmUser(isTrust: boolean) {
  if (!isTrust) {
    // 用户拒绝传输
    await pdc?.sendData(JSON.stringify({ type: 'err', data: 403 }))
    router.replace(localePath('/'))
    return
  }
  status.value.isWaitingConfirm = false
  await pdc?.sendData(JSON.stringify({ type: 'user', data: userInfo.value }))
  await pdc?.sendData(JSON.stringify({ type: 'files', data: filesInfo.value }))
}

async function handleObjData(obj: any) {
  console.log(obj)
  if (obj.type === 'user') {
    peerUserInfo.value = obj.data
    status.value.isWaitingConnect = false
  } else if (obj.type === 'reqFile') {
    const file = filesInfo.value.fileMap[obj.data]?.file
    // console.log(file)

    if (!file) {
      // 找不到对应的文件
      await pdc?.sendData(JSON.stringify({ type: 'err', data: 404 }))
      return
    }
    // 计算分片数量
    const sliceSize = 1024 * 1024
    const count = file.size / sliceSize + 1
    for (let i = 0; i < count; i++) {
      // console.log('i', i)
      const ab = await file.slice(i * sliceSize, (i + 1) * sliceSize).arrayBuffer()

      if (ab.byteLength > 0) {
        // todo 计算哈希
        await pdc?.sendData(ab)
      }
    }
  } else if (obj.type === 'err') {
    if (obj.data) {
      // -1，不支持现代文件访问API，不能传输目录
      status.value.warn.code = obj.data
    }
  }
}

function initPDC() {
  pdc = new PeerDataChannel()
  pdc.onSDP = (sdp) => ws?.send(JSON.stringify({ type: 'sdp', data: sdp }))
  pdc.onICECandidate = (candidate) =>
    ws?.send(JSON.stringify({ type: 'candidate', data: candidate }))
  pdc.onDispose = () => {
    status.value.isConnectPeer = false
    dispose()
    toast.add({ severity: 'warn', summary: 'Warn', detail: 'Disconnected', life: 5000 })
  }
  pdc.onError = (err) => {
    console.error(err)
    status.value.isConnectPeer = false
    dispose()
  }
  pdc.onConnected = () => {
    console.log('onConnected')
    status.value.isConnectPeer = true
    status.value.isWaitingConfirm = true
  }
  pdc.onRecive = (data, info) => {
    // console.log('data', data)
    // console.log(info.size, info.duration, info.size / (info.duration / 1e3))

    if (typeof data === 'string') {
      handleObjData(JSON.parse(data))
    }
  }
}

async function copyLink() {
  await copyToClipboard(location.origin + localePath('recipient') + '?code=' + code.value)
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Code copied successfully',
    life: 2e3
  })
}

onMounted(() => {
  if (!filesInfo.value.type) {
    router.replace(localePath('/'))
    return
  }
  if (Object.keys(filesInfo.value.fileMap).length === 0) {
    toast.add({ severity: 'warn', summary: 'Warn', detail: '目录为空', life: 3000 })
    router.replace(localePath('/'))
    return
  }

  try {
    ws = new WebSocket('/api/connect')
  } catch (e) {
    console.error(e)
    // 连接信令服务器失败
    status.value.error.code = -5
    status.value.error.msg = e + ''
    return
  }
  ws.onopen = () => {
    status.value.isConnectServer = true
    ws?.send(JSON.stringify({ type: 'send' }))
  }
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data)
    if (data.type === 'code') {
      code.value = data.code
      initPDC()
      status.value.isIniting = false
    } else if (data.type === 'sdp') {
      pdc?.setRemoteSDP(data.data)
    } else if (data.type === 'candidate') {
      pdc?.addICECandidate(data.data)
    } else if (data.type === 'err') {
      // -1 初始化连接码失败，稍后再试
      status.value.error.code = data.data
      status.value.isWaitingConnect = false
      toast.add({ severity: 'error', summary: 'Error', detail: data.msg })
      console.warn(data.msg)
    }
  }
  ws.onclose = () => {
    status.value.isConnectServer = false
    if (status.value.isIniting) {
      // 连接信令服务器失败
      status.value.error.code = -5
      status.value.error.msg = 'Connect sign server error'
      toast.add({ severity: 'error', summary: 'Error', detail: 'Connect sign server error' })
    } else if (status.value.isWaitingConnect) {
      // 等待接收端连接超时
      status.value.error.code = -10
      status.value.error.msg = 'Timeout'
      toast.add({ severity: 'error', summary: 'Error', detail: 'Waiting for timeout' })
    }
  }
  ws.onerror = (err) => {
    console.error(err)
    status.value.isConnectServer = false
  }
})

onUnmounted(() => {
  dispose()
})
</script>

<template>
  <div>
    <!-- 错误页面 -->
    <div v-if="status.error.code !== 0">
      <div v-if="status.error.code === -1" class="text-center">
        <Icon name="material-symbols-light:account-circle-off-outline-rounded" size="100" />
        <p class="text-xl tracking-wider py-8">当前连接人数太多，请稍后再试</p>
      </div>

      <div v-else class="text-center">
        <Icon name="solar:sad-square-line-duotone" size="100" />
        <p class="text-xl tracking-wider py-8">服务异常，请稍后再试</p>
      </div>

      <div class="text-center py-4">
        <NuxtLink :to="localePath('/')">
          <Button severity="contrast" class="tracking-wider"
            ><Icon name="solar:home-2-linear" class="mr-2" />回首页</Button
          ></NuxtLink
        >
      </div>
    </div>

    <!-- 加载页面 -->
    <div v-else-if="status.isIniting" class="flex flex-col gap-4 items-center justify-center py-20">
      <div class="loader"></div>
      <p class="text-xs">连接中</p>
    </div>

    <!-- 等待链接 -->
    <div v-else-if="status.isWaitingConnect" class="mt-4">
      <div class="md:mx-[10vw] p-4 text-center">
        <p>取件码</p>
        <p
          class="mt-4 inline-block text-6xl md:text-7xl tracking-widest border py-4 px-8 border-dashed border-neutral-400 dark:border-neutral-500"
        >
          {{ code }}
        </p>
      </div>

      <div class="flex flex-row items-center justify-center mt-2">
        <Button size="small" severity="contrast" @click="copyLink" class="tracking-wider"
          ><Icon name="solar:link-minimalistic-2-linear" class="mr-2" />复制链接</Button
        >
      </div>
    </div>

    <!-- 连接成功 -->
    <div v-else>
      <!-- 接入的用户 -->
      <div class="flex flex-col items-center mt-4">
        <div class="flex-col items-center py-4 px-8 rounded-lg shadow flex">
          <Avatar shape="circle" size="xlarge" :image="peerUserInfo.avatarURL" class="shadow" />
          <p class="text-center mt-2">{{ peerUserInfo.nickname }}</p>
        </div>
      </div>

      <!-- 业务异常 -->
      <div
        v-if="status.warn.code !== 0"
        class="flex flex-col items-center justify-center py-10 gap-4"
      >
        <Icon
          name="material-symbols-light:warning-outline-rounded"
          size="96"
          class="text-amber-500 dark:text-amber-600"
        />
        <p v-if="status.warn.code === -1">对方不支持现代文件访问API</p>

        <div class="text-center py-4">
          <NuxtLink :to="localePath('/')">
            <Button severity="contrast" class="tracking-wider"
              ><Icon name="solar:home-2-linear" class="mr-2" />回首页</Button
            ></NuxtLink
          >
        </div>
      </div>

      <!-- 传输确认 -->
      <div v-else-if="status.isWaitingConfirm" class="p-4 md:mx-[10vw]">
        <p class="text-center text-2xl tracking-wider">确定继续传输吗</p>
        <div class="flex flex-row items-center justify-center gap-6 mt-8">
          <Button outlined severity="danger" @click="confirmUser(false)" class="tracking-wider"
            ><Icon name="solar:close-square-linear" class="mr-2" />取消</Button
          >

          <Button severity="contrast" @click="confirmUser(true)" class="tracking-wider"
            ><Icon name="solar:check-square-linear" class="mr-2" />确定</Button
          >
        </div>
      </div>

      <!-- 发送端主界面 -->
      <div v-else-if="!status.isDone" class="p-4 md:mx-[10vw]">发送中</div>

      <!-- 发送完毕 -->
      <div v-else class="flex flex-col items-center justify-center py-10 gap-4">
        <Icon
          name="material-symbols-light:warning-outline-rounded"
          size="96"
          class="text-amber-500 dark:text-amber-600"
        />
        <p>发送完毕</p>
        <div class="text-center py-4">
          <NuxtLink :to="localePath('/')">
            <Button severity="contrast" class="tracking-wider"
              ><Icon name="solar:home-2-linear" class="mr-2" />回首页</Button
            ></NuxtLink
          >
        </div>
      </div>
    </div>
    sender
    <p>{{ status }}</p>

    <p>{{ code }}</p>

    <p>{{ peerUserInfo }}</p>
  </div>
</template>

<style scoped>
.loader {
  width: 100px;
  height: 40px;
  --g: radial-gradient(
      farthest-side,
      transparent calc(95% - 3px),
      currentColor calc(100% - 3px) 98%,
      transparent 101%
    )
    no-repeat;
  background: var(--g), var(--g), var(--g);
  background-size: 30px 30px;
  animation: l9 1s infinite alternate;
}
@keyframes l9 {
  0% {
    background-position:
      0 50%,
      50% 50%,
      100% 50%;
  }
  20% {
    background-position:
      0 0,
      50% 50%,
      100% 50%;
  }
  40% {
    background-position:
      0 100%,
      50% 0,
      100% 50%;
  }
  60% {
    background-position:
      0 50%,
      50% 100%,
      100% 0;
  }
  80% {
    background-position:
      0 50%,
      50% 50%,
      100% 100%;
  }
  100% {
    background-position:
      0 50%,
      50% 50%,
      100% 50%;
  }
}
</style>
