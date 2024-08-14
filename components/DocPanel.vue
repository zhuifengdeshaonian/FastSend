<script lang="ts" setup>
const { locale } = useI18n()
const isDocPanelShow = ref(false)

const curIP = ref('')

function showDocPanel() {
  isDocPanelShow.value = true
}

onMounted(() => {
  fetch('/api/getIP', { method: 'post' })
    .then((res) => res.text())
    .then((ip) => (curIP.value = ip))
})
</script>

<template>
  <div class="fixed right-5 bottom-20 z-40">
    <Button text raised rounded size="large" aria-label="Install PWA" @click="showDocPanel">
      <Icon name="solar:notebook-bookmark-line-duotone" class="text-black/90 dark:text-white/90" />
    </Button>

    <Dialog
      v-model:visible="isDocPanelShow"
      dismissable-mask
      modal
      header="FastSend"
      class="w-[90vw] md:w-[60vw] max-h-[80vh]"
    >
      <article class="post" v-if="locale === 'zh'">
        <p>
          欢迎使用<b class="underline">FastSend</b
          >，这是一个使用浏览器<code>`点对点`</code>加密传输文件的网页工具
        </p>
        <p>
          你的文件数据不会经过第三方服务器，保证隐私安全，相应的，需要发送方在传输过程中保持在线
        </p>
        <h2>一、快速上手</h2>
        <h3>发送单个文件</h3>
        <p>1. 发送方点击<b>发送文件</b>，获取文件<b>取件码</b>（也可将文件拖放到发送区域）</p>
        <p>2. 接收方输入<b>取件码</b>开始点对点配对，配对成功后等待发送方确认</p>
        <p>3. 发送方点击<b>确认</b>继续传输（可点开头像设置自动确认）</p>
        <p>
          4.
          接收方点击<b>接收</b>，选择保存路径，然后开始传输（如果浏览器不支持直接访问文件系统，数据将暂存在内存中，传输完毕后触发下载）
        </p>
        <h3>发送目录</h3>
        <p>发送方点击<b>发送目录</b>，其他步骤同上（目录暂不支持直接拖放）</p>
        <h2>二、工作原理</h2>
        <p>
          本工具使用<b>WebRTC</b>提供点对点数据传输，使用<b>现代文件访问API</b>提供直接文件系统读写
        </p>
        <p>
          因此，请确保浏览器开启了<b>WebRTC</b>功能，<b>现代文件访问API</b>可选，这个不可用将导致传输<b>文件大小限制</b>以及<b
            >不可接收目录</b
          >
        </p>
        <p>
          <b>WebRTC</b
          >会遍历所有可行的网络，自动选择最优线路，如果收发双方在<b>同一局域网</b>，将自动走局域网传输，<b
            >不会消耗外部流量</b
          >
        </p>
        <h2>三、注意事项</h2>
        <p>
          1.
          由于<b>点对点连接</b>一般需要进行NAT网络穿透，对于复杂的网络环境如开启代理的情况下，可能导致<b>点对点连接</b>失败，请切换网络或关闭代理再重试
        </p>
        <p>
          2.
          点对点加密传输能保证文件数据的安全，但可能向对方泄漏你的<b>出口IP地址</b>，大部分情况下这是一个动态的<b>NAT出口地址</b>，因此不用担心，你可以在下方看到你当前相对于本站的出口IP地址。<b
            >如果您觉得这有风险，请勿使用本工具</b
          >
        </p>
      </article>
      <article class="post" v-else>
        <p>
          Welcome to <b class="underline">FastSend</b>, a web tool for securely transferring files
          using browser <code>`peer-to-peer`</code> encryption.
        </p>
        <p>
          Your file data will not pass through third-party servers, ensuring privacy and security.
          Accordingly, the sender needs to remain online during the transfer.
        </p>
        <h2>1. Quick Start</h2>
        <h3>Send a Single File</h3>
        <p>
          1. The sender clicks <b>Send File</b> to obtain the <b>Pickup Code</b> (files can also be
          dragged and dropped into the sending area).
        </p>
        <p>
          2. The receiver enters the <b>Pickup Code</b> to start peer-to-peer pairing, and waits for
          the sender to confirm after successful pairing.
        </p>
        <p>
          3. The sender clicks <b>Confirm</b> to continue the transfer (the sender can open their
          profile picture to set automatic confirmation).
        </p>
        <p>
          4. The receiver clicks <b>Receive</b>, selects the save path, and then starts the transfer
          (if the browser does not support direct access to the file system, data will temporarily
          reside in memory, triggering a download after the transfer is complete).
        </p>
        <h3>Send a Directory</h3>
        <p>
          The sender clicks <b>Send Directory</b>, and the other steps are the same (directories do
          not currently support direct drag and drop).
        </p>
        <h2>2. How It Works</h2>
        <p>
          This tool uses <b>WebRTC</b> to provide peer-to-peer data transfer and utilizes
          <b>Modern File Access API</b> for direct file system read and write.
        </p>
        <p>
          Therefore, please ensure that the browser has <b>WebRTC</b> enabled. The
          <b>Modern File Access API</b> is optional; if unavailable, it will result in
          <b>file size limitations</b> and <b>inability to receive directories</b>.
        </p>
        <p>
          <b>WebRTC</b> will traverse all available networks and automatically select the optimal
          route. If both the sender and receiver are on the <b>same local area network</b>, it will
          automatically use local network transfer,
          <b>which will not consume external bandwidth</b>.
        </p>
        <h2>3. Precautions</h2>
        <p>
          1. Since <b>peer-to-peer connections</b> generally require NAT traversal, in complex
          network environments such as when using a proxy, it may lead to
          <b>peer-to-peer connection</b> failures. Please switch networks or disable the proxy and
          try again.
        </p>
        <p>
          2. Peer-to-peer encrypted transfer ensures the security of file data, but it may leak your
          <b>outbound IP address</b> to the other party. In most cases, this is a dynamic
          <b>NAT outbound address</b>, so there is no need to worry. You can see your current
          outbound IP address relative to this site below.
          <b>If you feel this poses a risk, please do not use this tool.</b>
        </p>
      </article>
      <Divider />
      <div class="text-center tracking-wider" v-if="locale === 'zh'">
        <p class="text-xs">您当前的IP地址为</p>
        <p class="my-1">{{ curIP }}</p>
        <p class="text-xs">（相对于本站）</p>
      </div>
      <div class="text-center tracking-wider" v-else>
        <p class="text-xs">Your current IP address is</p>
        <p class="my-1">{{ curIP }}</p>
        <p class="text-xs">（relative to this site）</p>
      </div>
    </Dialog>
  </div>
</template>

<style>
.post {
  @apply tracking-wide;
}

.post p {
  @apply text-sm my-1;
}

.post h2 {
  @apply text-xl my-4 font-bold;
}

.post h3 {
  @apply text-lg my-2 font-semibold;
}
</style>
