<script setup lang="ts">
import CryptoJs from 'crypto-js'
import { PeerDataChannel } from '~/utils/PeerDataChannel'

const localePath = useLocalePath()
const router = useRouter()
const userInfo = useUserInfo()
const peerUserInfo = ref({ nickname: 'unknown', avatarURL: '' })
const peerFilesInfo = ref({ type: '', fileMap: {} })
const code = ref('')
const status = ref({
  isConnectServer: false,
  isConnectPeer: false,
  isPeerConnecting: false,
  isIniting: true,
  isLock: false,
  error: {
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

async function handleObjData(obj: any) {
  console.log(obj)
  if (obj.type === 'user') {
    peerUserInfo.value = obj.data
  } else if (obj.type === 'files') {
    peerFilesInfo.value = obj.data
    status.value.isIniting = false
  }
}

function initPDC() {
  status.value.isPeerConnecting = true
  pdc = new PeerDataChannel(undefined, true)
  pdc.onSDP = (sdp) => ws?.send(JSON.stringify({ type: 'sdp', data: sdp }))
  pdc.onICECandidate = (candidate) =>
    ws?.send(JSON.stringify({ type: 'candidate', data: candidate }))
  pdc.onDispose = () => {
    status.value.isConnectPeer = false
  }
  pdc.onError = (err) => {
    console.error(err)
    status.value.isConnectPeer = false
    status.value.isPeerConnecting = false
    if (status.value.isIniting) {
      status.value.error.code = 500
      status.value.error.msg = err + ''
    }
  }
  pdc.onConnected = () => {
    status.value.isConnectPeer = true
    status.value.isPeerConnecting = false
  }
  pdc.onOpen = async () => {
    await pdc?.sendData(JSON.stringify({ type: 'user', data: userInfo.value }))

    // let u8a = new Uint8Array(10e6)
    // for (let i = 0; i < 10; i++) {
    //   await pdc?.sendData(u8a.buffer)
    // }
  }
  pdc.onRecive = (data) => {
    // console.log('data', data)
    if (typeof data === 'string') {
      handleObjData(JSON.parse(data))
    }
  }
}

onMounted(() => {
  const query = router.currentRoute.value.query
  if (!query.code) {
    router.replace(localePath('/'))
    return
  }
  code.value = query.code + ''
  ws = new WebSocket('/api/connect')
  ws.onopen = () => {
    status.value.isConnectServer = true
    ws?.send(JSON.stringify({ type: 'recive', code: code.value }))
  }
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data)
    if (data.type === 'status') {
      if (data.code === '404') {
        status.value.error.code = 404
        status.value.error.msg = '404'
        dispose()
      } else if (data.code === '0') {
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
    <div v-if="status.error.code !== 0">
      <div v-if="status.error.code === 404">404</div>
    </div>

    <div v-else-if="status.isIniting" class="flex flex-col gap-4 items-center justify-center py-20">
      <div class="loader"></div>
      <p class="text-xs">连接中</p>
    </div>

    <div class="md:grid md:grid-cols-2 md:gap-8 px-4 md:px-[10vw]">
      <!-- left top panel -->
      <div>
        <!-- peer user -->
        <div
          class="p-3 shadow shadow-black/20 dark:bg-neutral-900 rounded-full flex flex-row items-center"
        >
          <Avatar
            :image="peerUserInfo.avatarURL"
            shape="circle"
            size="large"
            class="shadow shadow-black/15"
          />
          <span class="ml-2 text-base flex-1">{{ peerUserInfo.nickname }}</span>

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

        <!-- file tree -->
        <FilesTree class="mt-4" />
      </div>

      <!-- right bottom panel -->
      <div>
        <div>你收到了来自 ？ 的文件</div>
      </div>
    </div>

    recipient
    <p>{{ status }}</p>

    <p>{{ code }}</p>

    <p>{{ peerUserInfo }}</p>

    <p>{{ peerFilesInfo }}</p>
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
