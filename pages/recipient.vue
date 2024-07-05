<script setup lang="ts">
import CryptoJs from 'crypto-js'
import { PeerDataChannel } from '~/utils/PeerDataChannel'

const localePath = useLocalePath()
const isModernFileAPISupport = ref(true)
const toast = useToast()
const router = useRouter()
const userInfo = useUserInfo()
const peerUserInfo = ref({ nickname: 'unknown', avatarURL: '' })
const peerFilesInfo = ref<any>({ type: '', fileMap: {} })
const selectedKeys = ref({})
const code = ref('')
const waitReciveFileList = ref<string[]>([])
const reciveFileIndex = ref(0)
const totalFileSize = ref(0)
const totalTransmittedBytes = ref(0)
const startTime = ref(0)
const totalSpeed = ref(0)
const curFile = ref<any>({
  name: '',
  size: 0,
  transmittedBytes: 0,
  lastBytes: 0,
  speed: 0,
  chunks: []
})
const status = ref({
  isConnectServer: false,
  isConnectPeer: false,
  isPeerConnecting: false,
  isIniting: true,
  isWaitingPeerConfirm: true,
  isLock: false,
  isReceiving: false,
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

let calcSpeedJobId: any
let ws: WebSocket | null
let pdc: PeerDataChannel | null
let saveFileFH: FileSystemFileHandle | null
let curFileWriter: FileSystemWritableFileStream | undefined
let rootDirDH: FileSystemDirectoryHandle | null
let reqFileResolveFn: () => void | undefined
let reqFileRejecteFn: () => void | undefined

// 关闭连接并清理资源
function dispose() {
  console.log('dispose')

  if (reqFileRejecteFn) {
    reqFileRejecteFn()
  }
  ws?.close()
  pdc?.dispose()
  clearInterval(calcSpeedJobId)
}

// 计算传输速度
function calcSpeedFn() {
  const curBytes = curFile.value.transmittedBytes + pdc?.getReciviedBufferSize()
  curFile.value.speed = curBytes - curFile.value.lastSize
  curFile.value.lastSize = curBytes
  totalSpeed.value = totalTransmittedBytes.value / ((new Date().getTime() - startTime.value) / 1e3)
}

// 对于不支持现代文件访问API的备用下载方法
function downloadFile() {
  doDownloadFromBlob(new Blob(curFile.value.chunks), curFile.value.name)
}

// 处理文件数据块
function handleBufferData(buf: ArrayBuffer) {
  curFile.value.transmittedBytes += buf.byteLength
  totalTransmittedBytes.value += buf.byteLength
  if (isModernFileAPISupport.value) {
    // 支持现代文件访问API，直接写到文件
    curFileWriter?.write(buf)
    if (curFile.value.transmittedBytes === curFile.value.size) {
      // 该文件传输完毕
      curFileWriter?.close()
      if (reqFileResolveFn) {
        reqFileResolveFn()
      }
    }
  } else {
    // 不支持现代文件访问，放到内存中
    curFile.value.chunks.push(buf)
    if (curFile.value.transmittedBytes === curFile.value.size) {
      // 文件传输完毕
      if (reqFileResolveFn) {
        reqFileResolveFn()
      }
      // 触发下载
      downloadFile()
    }
  }
}

// 处理JSON数据对象
async function handleObjData(obj: any) {
  console.log(obj)
  if (obj.type === 'user') {
    // 用户信息
    peerUserInfo.value = obj.data
  } else if (obj.type === 'files') {
    // 文件信息
    peerFilesInfo.value = obj.data
    if (peerFilesInfo.value.type === 'transFile') {
      // 传输单个文件
      const fm = peerFilesInfo.value.fileMap
      const fileNames = Object.keys(fm)
      if (fileNames.length === 0) {
        throw new Error('File not found')
      }
      const fileName = fileNames[0]
      curFile.value = {
        name: fileName,
        size: fm[fileName]?.size || 0,
        transmittedBytes: 0,
        lastSize: 0,
        speed: 0,
        chunks: []
      }
      totalFileSize.value = curFile.value.size
    } else if (!isModernFileAPISupport.value) {
      // 传输目录，但是不支持现代文件访问API，直接报错
      status.value.warn.code = -1
      status.value.warn.msg = '不支持目录传输'
      // 告知对方情况
      await pdc?.sendData(JSON.stringify({ type: 'err', data: -1 }))
      dispose()
    }
    status.value.isWaitingPeerConfirm = false
  } else if (obj.type === 'err') {
    console.warn(obj.data)
    if (obj.data === 403) {
      // 用户拒绝传输
      status.value.error.code = 403
      status.value.error.msg = '用户拒绝传输'
      toast.add({ severity: 'error', summary: 'Error', detail: '用户拒绝传输', life: 5e3 })
    } else if (obj.data === 404) {
      // 找不到对应的文件
      toast.add({ severity: 'warn', summary: 'Warn', detail: '文件找不到', life: 3e3 })
    }
    // toast.add({ severity: 'warn', summary: 'Warn', detail: obj.data, life: 3e3 })
  }
}

// 初始化对等数据通道
function initPDC() {
  status.value.isPeerConnecting = true
  pdc = new PeerDataChannel(undefined, true)
  pdc.onSDP = (sdp) => ws?.send(JSON.stringify({ type: 'sdp', data: sdp }))
  pdc.onICECandidate = (candidate) =>
    ws?.send(JSON.stringify({ type: 'candidate', data: candidate }))
  pdc.onDispose = () => {
    console.log('onDispose')

    status.value.isConnectPeer = false
    if (status.value.isReceiving) {
      status.value.warn.code = -2
      status.value.warn.msg = '连接断开，传输失败'
    }
    dispose()
    toast.add({ severity: 'warn', summary: 'Warn', detail: 'Disconnected', life: 5000 })
  }
  pdc.onError = (err) => {
    console.error(err)
    status.value.isConnectPeer = false
    status.value.isPeerConnecting = false
    if (status.value.isIniting) {
      status.value.error.code = 500
      status.value.error.msg = err + ''
    }
    dispose()
    toast.add({ severity: 'error', summary: 'Error', detail: err + '', life: 5000 })
  }
  pdc.onConnected = () => {
    status.value.isConnectPeer = true
    status.value.isPeerConnecting = false
    status.value.isIniting = false
  }
  pdc.onOpen = () => pdc?.sendData(JSON.stringify({ type: 'user', data: userInfo.value }))
  pdc.onRecive = (data) => {
    // console.log('data', data)
    if (typeof data === 'string') {
      handleObjData(JSON.parse(data))
    } else {
      handleBufferData(data)
    }
  }
}

// 请求文件
async function requestFile(key: string) {
  return new Promise<void>((resolve, reject) => {
    reqFileResolveFn = resolve
    reqFileRejecteFn = reject
    pdc?.sendData(JSON.stringify({ type: 'reqFile', data: key }))
  })
}

// 开始接收
async function doRecive() {
  if (status.value.isReceiving) {
    return
  }
  status.value.isReceiving = true

  if (peerFilesInfo.value.type !== 'transFile') {
    // 如果传输目录，则至少要选择一个文件
    waitReciveFileList.value = Object.keys(selectedKeys.value).filter((n) => !/\/$/.test(n))
    if (waitReciveFileList.value.length === 0) {
      toast.add({ severity: 'warn', summary: 'Warn', detail: '请至少选择一个文件', life: 3e3 })
      status.value.isReceiving = false
      return
    }
  }
  status.value.isLock = true

  // 初始化参数
  reciveFileIndex.value = 0
  waitReciveFileList.value.forEach((name) => {
    totalFileSize.value += peerFilesInfo.value.fileMap[name]?.size
  })
  totalTransmittedBytes.value = 0
  startTime.value = new Date().getTime()
  // 启动传输速度计算定时器
  calcSpeedJobId = setInterval(calcSpeedFn, 1e3)

  try {
    if (peerFilesInfo.value.type === 'transFile') {
      // 传输单个文件
      if (isModernFileAPISupport.value) {
        saveFileFH = await showSaveFilePicker({
          startIn: 'downloads',
          suggestedName: curFile.value.name
        })
        curFileWriter = await saveFileFH?.createWritable()
      }
      await requestFile(curFile.value.name)
      status.value.isReceiving = false
      status.value.isDone = true
      calcSpeedFn()
      dispose()
    } else {
      rootDirDH = await showDirectoryPicker()
      // todo
    }
  } catch (e) {
    console.warn(e)
    toast.add({ severity: 'error', summary: 'Error', detail: e })
    status.value.isLock = status.value.isReceiving = false
  }
}

onMounted(() => {
  isModernFileAPISupport.value = isModernFileAPIAvailable()
  const query = router.currentRoute.value.query
  if (!query.code) {
    router.replace(localePath('/'))
    return
  }
  code.value = query.code + ''

  // 初始化信令服务器连接WebSocker
  ws = new WebSocket('/api/connect')
  ws.onopen = () => {
    status.value.isConnectServer = true
    ws?.send(JSON.stringify({ type: 'recive', code: code.value }))
  }
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data)
    if (data.type === 'status') {
      if (data.code === 404) {
        status.value.error.code = 404
        status.value.error.msg = '404'
        dispose()
      } else if (data.code === 0) {
        initPDC()
      }
    } else if (data.type === 'sdp') {
      pdc?.setRemoteSDP(data.data)
    } else if (data.type === 'candidate') {
      pdc?.addICECandidate(data.data)
    }
  }
  ws.onclose = () => {
    status.value.isConnectServer = false
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
    <!-- 错误界面 -->
    <div v-if="status.error.code !== 0">
      <!-- 取件码无效 -->
      <div v-if="status.error.code === 404">404</div>
      <!-- 用户拒绝传输 -->
      <div
        v-if="status.error.code === 403"
        class="py-16 flex flex-col justify-center items-center gap-4"
      >
        <Icon name="solar:close-square-linear" size="64" class="text-rose-500 dark:text-rose-600" />
        <p class="text-xl tracking-wider">用户拒绝传输</p>
      </div>
      <!-- 其他错误 -->
      <div v-else>{{ status.error }}</div>

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

    <!-- 等待对方确认 -->
    <div
      v-else-if="status.isWaitingPeerConfirm"
      class="flex flex-col gap-4 items-center justify-center py-20"
    >
      <div class="loader"></div>
      <p class="text-xs">等待对方确认</p>
    </div>

    <!-- 连接成功页面 -->
    <div v-else class="md:grid md:grid-cols-2 md:gap-8 px-4 md:px-[10vw]">
      <!-- 用户和文件展示 -->
      <div>
        <!-- 发送方用户 -->
        <div
          class="p-2 pr-3 md:p-3 md:pr-5 shadow shadow-black/20 dark:bg-neutral-900 rounded-full flex flex-row items-center"
        >
          <Avatar
            :image="peerUserInfo.avatarURL"
            shape="circle"
            size="large"
            class="shadow shadow-black/15"
          />
          <span class="ml-3 text-base flex-1">{{ peerUserInfo.nickname }}</span>

          <Icon
            v-if="status.isConnectPeer"
            name="solar:link-round-angle-bold"
            class="text-green-500"
            size="20"
          />
          <Icon
            v-else
            name="solar:link-broken-minimalistic-broken"
            class="text-red-500"
            size="20"
          />
        </div>

        <!-- 文件列表 -->
        <div class="mt-4 md:mt-6">
          <!-- 单个文件 -->
          <div v-if="peerFilesInfo.type === 'transFile'" class="flex flex-col items-center mt-8">
            <Icon name="material-symbols-light:unknown-document-outline-rounded" size="64" />
            <p class="text-lg">{{ curFile.name }}</p>
            <p class="text-xs mt-1 text-gray-600 dark:text-gray-500">
              {{ humanFileSize(curFile.size) }}
            </p>
          </div>
          <!-- 目录 -->
          <FilesTree
            v-else
            :file-map="peerFilesInfo.fileMap"
            :disabled="status.isLock"
            v-model:selected-key="selectedKeys"
          />
        </div>
      </div>

      <!-- 进度和操作按钮 -->
      <div class="mt-6 md:mt-0">
        <!-- 进度 -->
        <div>
          <p class="text-sm mt-2">{{ curFile.name }}</p>
          <ProgressBar
            :value="
              Math.round(curFile.size === 0 ? 0 : (curFile.transmittedBytes / curFile.size) * 100)
            "
          />
          <p class="text-right text-sm">
            <span>{{ humanFileSize(curFile.speed) }}/s</span
            ><span class="ml-4">{{ humanFileSize(curFile.transmittedBytes) }}</span
            ><span class="mx-1">/</span><span>{{ humanFileSize(curFile.size) }}</span>
          </p>

          <p class="text-sm mt-4">总进度</p>
          <ProgressBar
            :value="
              Math.round(totalFileSize === 0 ? 0 : (totalTransmittedBytes / totalFileSize) * 100)
            "
          />
          <p class="text-right text-sm">
            <span>{{ humanFileSize(totalSpeed) }}/s</span
            ><span class="ml-4">{{ humanFileSize(totalTransmittedBytes) }}</span
            ><span class="mx-1">/</span><span>{{ humanFileSize(totalFileSize) }}</span>
          </p>
        </div>

        <!-- 操作按钮 -->
        <div v-if="status.warn.code === 0" class="my-16">
          <!-- 接收和终止 -->
          <Button
            v-if="!status.isLock"
            rounded
            severity="contrast"
            class="w-full tracking-wider"
            :disabled="!status.isConnectPeer || status.isReceiving"
            @click="doRecive"
            ><Icon name="solar:archive-down-minimlistic-line-duotone" class="mr-2" />接收</Button
          >
          <Button
            v-if="status.isReceiving"
            rounded
            outlined
            severity="danger"
            class="w-full tracking-wider"
            >终止</Button
          >

          <!-- 传输完成 -->
          <Button
            v-if="status.isDone && !isModernFileAPISupport"
            rounded
            outlined
            severity="contrast"
            class="w-full tracking-wider"
            @click="downloadFile"
            ><Icon name="solar:download-minimalistic-linear" class="mr-2" />下载</Button
          >

          <div v-if="status.isDone" class="py-6">
            <NuxtLink to="https://www.buymeacoffee.com/shouchen" target="_blank">
              <Button rounded outlined severity="contrast" class="w-full tracking-wider"
                ><IconCoffee class="size-[1.125rem] mr-2" />请我喝咖啡</Button
              >
            </NuxtLink>

            <NuxtLink :to="localePath('/')">
              <Button rounded severity="contrast" class="w-full tracking-wider block mt-6"
                ><Icon name="solar:home-2-linear" class="mr-2" />回首页</Button
              ></NuxtLink
            >
          </div>
        </div>

        <!-- 业务异常 -->
        <div v-else class="mt-16">
          <!-- 不支持目录传输 -->
          <div v-if="status.warn.code === -1">
            <p>不支持目录传输</p>
          </div>
          <!-- 连接异常中断 -->
          <div v-else-if="status.warn.code === -2">连接断开，传输失败</div>

          {{ status.warn }}
        </div>

        <!-- <p>{{ totalFileSize }}</p>
          <p>{{ totalTransmittedBytes }}</p>
          <p>{{ waitReciveFileList }}</p> -->
      </div>
    </div>
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
