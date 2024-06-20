export class PeerDataChannel {
  private static BLOCK_SIZE = 65536
  private pc: RTCPeerConnection
  private dc: RTCDataChannel | null = null
  private reciveData: {
    startTime: number
    offset: number
    count: number
    type: string
    chunks: (string | ArrayBuffer)[]
  } = { startTime: 0, offset: 0, count: 0, type: '', chunks: [] }
  private sendPromiseReject: (reason?: any) => void = () => {}
  public onRecive: (data: ArrayBuffer | string, info: { size: number; duration: number }) => void =
    () => {}
  public onSDP: (sdp: RTCSessionDescriptionInit) => void = () => {}
  public onICECandidate: (candidate: RTCIceCandidate) => void = () => {}
  public onError: (e: any) => void = () => {}
  public onConnected: () => void = () => {}
  public onDispose: () => void = () => {}
  public onOpen: () => void = () => {}

  constructor(iceServers?: RTCIceServer[], init?: boolean) {
    this.pc = new RTCPeerConnection({ iceServers: iceServers })
    this.pc.ondatachannel = (e) => {
      this.dc = e.channel
      this.dc.bufferedAmountLowThreshold = 0
      this.dc.onmessage = (e) => this.onData(e.data)
      this.dc.onopen = () => this.onOpen()
    }
    this.pc.onnegotiationneeded = () => this.reNegotition()
    this.pc.onicecandidate = (e) => (e.candidate ? this.onICECandidate(e.candidate) : undefined)
    this.pc.onicecandidateerror = this.onError
    this.pc.onconnectionstatechange = () => {
      if (['closed', 'disconnected', 'failed'].includes(this.pc.connectionState)) {
        this.dispose()
        this.onDispose()
      } else if (this.pc.connectionState === 'connected') {
        this.onConnected()
      }
    }
    if (init) {
      this.dc = this.pc.createDataChannel('dc')
      this.dc.bufferedAmountLowThreshold = 0
      this.dc.onmessage = (e) => this.onData(e.data)
      this.dc.onopen = () => this.onOpen()
    }
  }

  private async onData(data: any) {
    const reciveData = this.reciveData
    if (reciveData.offset === reciveData.count) {
      const dat = JSON.parse(data)
      this.reciveData = {
        startTime: new Date().getTime(),
        offset: 0,
        count: dat.count,
        type: dat.type,
        chunks: []
      }
    } else {
      reciveData.chunks.push(data)
      reciveData.offset++
      if (reciveData.offset === reciveData.count) {
        const endTime = new Date().getTime()
        const b = new Blob(reciveData.chunks)
        if (reciveData.type === 'string') {
          this.onRecive(await b.text(), {
            size: b.size,
            duration: endTime - reciveData.startTime
          })
        } else {
          this.onRecive(await b.arrayBuffer(), {
            size: b.size,
            duration: endTime - reciveData.startTime
          })
        }
        reciveData.chunks = []
      }
    }
  }

  /**
   * 发送数据块，注意只能串行调用
   * @param data
   * @returns
   */
  public async sendData(data: ArrayBuffer | string) {
    return new Promise<void>((resolve, reject) => {
      this.sendPromiseReject = reject
      if (!this.dc) {
        reject()
        return
      }
      let offset = 0
      let count = 0
      if (typeof data === 'string') {
        this.dc.onbufferedamountlow = () => {
          if (offset < count) {
            this.dc?.send(
              data.substring(
                PeerDataChannel.BLOCK_SIZE * offset,
                PeerDataChannel.BLOCK_SIZE * (offset + 1)
              )
            )
            offset++
            if (offset >= count) {
              resolve()
            }
          }
        }
        count = Math.floor(data.length / PeerDataChannel.BLOCK_SIZE) + 1
        this.dc.send(JSON.stringify({ count: count, type: 'string' }))
      } else {
        this.dc.onbufferedamountlow = () => {
          if (offset < count) {
            this.dc?.send(
              data.slice(
                PeerDataChannel.BLOCK_SIZE * offset,
                PeerDataChannel.BLOCK_SIZE * (offset + 1)
              )
            )
            offset++
            if (offset >= count) {
              resolve()
            }
          }
        }
        count = Math.floor(data.byteLength / PeerDataChannel.BLOCK_SIZE) + 1
        this.dc.send(JSON.stringify({ count: count, type: 'ArrayBuffer' }))
      }
    })
  }

  /**
   * 重协商SDP
   */
  private async reNegotition() {
    return this.pc
      .createOffer()
      .then((offer) => this.pc.setLocalDescription(offer))
      .then(() => (this.pc.localDescription ? this.onSDP(this.pc.localDescription) : undefined))
      .catch((e) => {
        console.error(e)
        this.onError(e)
        this.dispose()
      })
  }

  /**
   * 设置远端SDP
   * @param sdp 会话描述
   */
  public async setRemoteSDP(sdp: RTCSessionDescriptionInit) {
    return this.pc
      .setRemoteDescription(sdp)
      .then(() => (sdp?.type === 'offer' ? this.pc.createAnswer() : undefined))
      .then(async (anwser) => {
        if (anwser) {
          await this.pc.setLocalDescription(anwser)
          this.onSDP(anwser)
        }
      })
      .catch((e) => {
        console.error(e)
        this.onError(e)
        this.dispose()
      })
  }

  /**
   * 添加ICE服务候选
   * @param candidate ICE服务候选
   */
  public async addICECandidate(candidate: RTCIceCandidateInit) {
    return this.pc.addIceCandidate(candidate)
  }

  /**
   * 判断是否已连接
   * @returns 为 true 则已连接，否则未连接
   */
  public isConnected() {
    return this.pc.connectionState === 'connected'
  }

  /**
   * 销毁节点并清理资源
   */
  public dispose() {
    this?.sendPromiseReject()

    // 关闭数据通道
    this.dc?.close()

    // 移除所有的事件监听器
    this.pc.onicecandidate = null
    this.pc.ontrack = null
    this.pc.ondatachannel = null
    this.pc.oniceconnectionstatechange = null
    this.pc.onsignalingstatechange = null
    this.pc.onicegatheringstatechange = null
    this.pc.onnegotiationneeded = null
    this.pc.close()
  }
}
