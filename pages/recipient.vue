<script setup lang="ts">
import { PeerDataChannel } from '~/utils/PeerDataChannel'

const localePath = useLocalePath()
const router = useRouter()
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
  }
  pdc.onConnected = () => {
    status.value.isConnectPeer = true
  }
  pdc.onOpen = async () => {
    console.log(114)

    await pdc?.sendData('hello')

    for (let m = 0; m < 10; m++) {
      console.log(m)

      let u8a = new Uint8Array(10e6)
      for (let i = 0; i < u8a.length; i++) {
        u8a[i] = Math.floor(Math.random() * 256)
      }
      await pdc?.sendData(u8a.buffer)
    }
  }
  pdc.onRecive = (data) => {
    console.log('data', data)

    // todo
  }
}

onMounted(async () => {
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
        status.value.is404 = true
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
    recipient
    <p>{{ status }}</p>

    <p>{{ code }}</p>
  </div>
</template>
