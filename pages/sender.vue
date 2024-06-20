<script setup lang="ts">
import { PeerDataChannel } from '~/utils/PeerDataChannel'

const localePath = useLocalePath()
const router = useRouter()
const toast = useToast()
const filesInfo = useFilesInfo()
const code = ref('')
const status = ref({
  isConnectServer: false,
  isConnectPeer: false,
  is404: false
})

let ws: WebSocket | null
let pdc: PeerDataChannel | null

function dispose() {
  ws?.close()
  pdc?.dispose()
}

function initPDC() {
  pdc = new PeerDataChannel()
  pdc.onSDP = (sdp) => ws?.send(JSON.stringify({ type: 'sdp', data: sdp }))
  pdc.onICECandidate = (candidate) =>
    ws?.send(JSON.stringify({ type: 'candidate', data: candidate }))
  pdc.onDispose = () => {
    status.value.isConnectPeer = false
  }
  pdc.onError = (err) => {
    console.error(err)
    status.value.isConnectPeer = false
  }
  pdc.onConnected = () => {
    console.log('onConnected')
    status.value.isConnectPeer = true
  }
  pdc.onRecive = (data, info) => {
    console.log('data', data)
    console.log(info.size, info.duration, info.size / (info.duration / 1e3))

    // todo
  }
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

  ws = new WebSocket('/api/connect')
  ws.onopen = () => {
    status.value.isConnectServer = true
    ws?.send(JSON.stringify({ type: 'send' }))
  }
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data)
    if (data.type === 'code') {
      code.value = data.code
      initPDC()
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
    sender
    <p>{{ status }}</p>

    <p>{{ code }}</p>
  </div>
</template>
