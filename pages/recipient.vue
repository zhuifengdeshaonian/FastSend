<script setup lang="ts">
import CryptoJs from 'crypto-js'
import { PeerDataChannel } from '~/utils/PeerDataChannel'

const localePath = useLocalePath()
const router = useRouter()
const userInfo = useUserInfo()
const peerUserInfo = ref({ nickname: '', avatarURL: '' })
const peerFilesInfo = ref({ type: '', fileMap: {} })
const code = ref('')
const status = ref({
  isConnectServer: false,
  isConnectPeer: false,
  isPeerConnecting: false,
  isIniting: true,
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
  }
  pdc.onConnected = () => {
    status.value.isConnectPeer = true
    status.value.isPeerConnecting = false
  }
  pdc.onOpen = () => {
    pdc?.sendData(JSON.stringify({ type: 'user', data: userInfo.value }))
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
    <div class="" v-if="status.error.code !== 0"></div>

    <div v-else-if="status.isIniting">a</div>

    <div v-else></div>

    recipient
    <p>{{ status }}</p>

    <p>{{ code }}</p>

    <p>{{ peerUserInfo }}</p>

    <p>{{ peerFilesInfo }}</p>
  </div>
</template>
