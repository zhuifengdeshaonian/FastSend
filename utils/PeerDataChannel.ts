export class PeerDataChannel {
  private static BLOCK_SIZE = 32768
  private pc: RTCPeerConnection
  private dc: RTCDataChannel | null = null
  private receiveData: {
    startTime: number
    offset: number
    count: number
    type: string
    chunks: (string | ArrayBuffer)[]
  } = { startTime: 0, offset: 0, count: 0, type: '', chunks: [] }
  private sendPromiseReject: (reason?: any) => void = () => {}
  private eventQueue: EventQueue<any>
  public onReceive: (
    data: ArrayBuffer | string,
    info: { size: number; duration: number }
  ) => Promise<void> = () => new Promise<void>(() => {})
  public onSDP: (sdp: RTCSessionDescriptionInit) => void = () => {}
  public onICECandidate: (candidate: RTCIceCandidate) => void = () => {}
  public onError: (e: any) => void = () => {}
  public onConnected: () => void = () => {}
  public onDispose: () => void = () => {}
  public onOpen: () => void = () => {}

  constructor(iceServers?: RTCIceServer[], init?: boolean) {
    this.eventQueue = new EventQueue((dat) => this.onData(dat))
    this.pc = new RTCPeerConnection({ iceServers: iceServers })
    this.pc.ondatachannel = (e) => {
      this.dc = e.channel
      this.dc.bufferedAmountLowThreshold = 0
      this.dc.onmessage = (e) => this.eventQueue.enqueue(e.data)
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
      this.dc.onmessage = (e) => this.eventQueue.enqueue(e.data)
      this.dc.onopen = () => this.onOpen()
    }
  }

  private async onData(data: any) {
    const receiveData = this.receiveData
    if (receiveData.offset === receiveData.count) {
      const dat = JSON.parse(data)
      this.receiveData = {
        startTime: new Date().getTime(),
        offset: 0,
        count: dat.count,
        type: dat.type,
        chunks: []
      }
    } else {
      receiveData.chunks.push(data)
      receiveData.offset++
      if (receiveData.offset === receiveData.count) {
        const endTime = new Date().getTime()
        const b = new Blob(receiveData.chunks)
        if (receiveData.type === 'string') {
          await this.onReceive(await b.text(), {
            size: b.size,
            duration: endTime - receiveData.startTime
          })
        } else {
          await this.onReceive(await b.arrayBuffer(), {
            size: b.size,
            duration: endTime - receiveData.startTime
          })
        }
        receiveData.chunks = []
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
      const dc = this.dc
      dc.bufferedAmountLowThreshold = 0
      let offset = 0
      let count = 0
      if (typeof data === 'string') {
        dc.onbufferedamountlow = () => {
          if (offset < count) {
            dc.send(
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
        count = Math.ceil(data.length / PeerDataChannel.BLOCK_SIZE)
        dc.send(JSON.stringify({ count: count, type: 'string' }))
      } else {
        dc.onbufferedamountlow = () => {
          if (count - offset > 16) {
            dc.bufferedAmountLowThreshold = 16 * PeerDataChannel.BLOCK_SIZE
          } else {
            dc.bufferedAmountLowThreshold = 0
          }
          for (let i = 0; i < 32; i++) {
            if (offset < count) {
              dc.send(
                data.slice(
                  PeerDataChannel.BLOCK_SIZE * offset,
                  PeerDataChannel.BLOCK_SIZE * (offset + 1)
                )
              )
              offset++
              if (offset >= count) {
                resolve()
                break
              }
            }
          }
        }
        count = Math.ceil(data.byteLength / PeerDataChannel.BLOCK_SIZE)
        dc.send(JSON.stringify({ count: count, type: 'ArrayBuffer' }))
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

  public getReciviedBufferSize() {
    let size = 0
    this.receiveData.chunks.forEach(
      (dat) => (size += typeof dat === 'string' ? dat.length : dat.byteLength)
    )
    return size
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

class EventQueue<T> {
  private queue: any[T]
  private processing: boolean
  private handler: (e: T) => Promise<void>

  constructor(handler: (e: T) => Promise<void>) {
    this.queue = []
    this.processing = false
    this.handler = handler
  }

  public enqueue(e: T) {
    this.queue.push(e)
    if (!this.processing) {
      this.processNext()
    }
  }

  private async processNext() {
    if (this.queue.length > 0) {
      this.processing = true
      const e = this.queue.shift()
      await this.handler(e)
      this.processNext()
    } else {
      this.processing = false
    }
  }
}
