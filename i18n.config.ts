export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'zh',
  messages: {
    en: {
      welcome: 'Welcome',
      description: 'Fast peer-to-peer file and directory transfers',
      home: 'Home',
      sender: 'Sender',
      recipient: 'Recipient',
      about: 'About',
      label: {
        title: 'Title',
        secondsAgo: '{n} seconds ago',
        minutesAgo: '{n} minutes ago',
        hoursAgo: '{n} hours ago',
        daysAgo: '{n} days ago',
        send: 'Send',
        receive: 'Receive',
        receiveCode: 'Receive Code',
        quickStart: 'Qucik Start',
        transmitted: 'Transmitted',
        times: 'times',
        totalProgress: 'Total progress'
      },
      btn: {
        submit: 'Submit',
        update: 'Update',
        ok: 'OK',
        cancel: 'Cancel',
        send: 'Send',
        receive: 'Receive',
        clear: 'Clear',
        download: 'Download',
        copy: 'Copy',
        copyLink: 'Copy link',
        copied: 'Copied',
        sendFile: 'Send file',
        sendDir: 'Send folder',
        syncDir: 'Folder synchronization',
        toHome: 'Back to home',
        terminate: 'Terminate',
        buyMeCoffee: 'Buy me coffee'
      },
      hint: {
        noModernFileAPIWarn:
          'Warning: Your browser does not support modern file access APIs, making the `Folder synchronization` and `Send folder` features unavailable. Additionally, the file receiving limit is 1GB.',
        toManyPeople: 'There are too many people currently connected, please try again later',
        serverError: 'The service is abnormal, please try again later',
        closeTheProxy:
          'If you are currently in a proxy environment, please close the proxy and try again',
        connecting: 'Connecting',
        noSupportFileAccessAPI: 'The counterparty does not support modern file access APIs',
        connectInterrupted: 'Connection interrupted, transmission failed',
        areYouSureContinue: 'Are you sure to continue the transmission?',
        inTransit: 'In transit',
        transCompleted: 'Transmission completed',
        invalidPickupCode: 'Invalid pickup code',
        refusesToTransmit: 'The other party refuses to transmit',
        waitingForConfirm: 'Waiting for confirmation from the other party',
        noSupportDirTrans: 'The current browser does not support directory transfer',
        connectTimeout: 'Connection timeout'
      }
    },
    zh: {
      welcome: '欢迎',
      description: '点对点快速传输文件和目录',
      home: '主页',
      sender: '发送',
      recipient: '接收',
      about: '关于',
      label: {
        title: '标题',
        secondsAgo: '{n} 秒前',
        minutesAgo: '{n} 分前',
        hoursAgo: '{n} 小时前',
        daysAgo: '{n} 天前',
        send: '发送',
        receive: '接收',
        receiveCode: '取件码',
        quickStart: '快速开始',
        transmitted: '已传输',
        times: '次',
        totalProgress: '总进度'
      },
      btn: {
        submit: '提交',
        update: '更新',
        ok: '确定',
        cancel: '取消',
        send: '发送',
        receive: '接收',
        clear: '清空',
        download: '下载',
        copy: '复制',
        copyLink: '复制链接',
        copied: '已复制',
        sendFile: '发送文件',
        sendDir: '发送目录',
        syncDir: '目录同步',
        toHome: '回首页',
        terminate: '终止',
        buyMeCoffee: '请我喝咖啡'
      },
      hint: {
        noModernFileAPIWarn:
          '警告：您的浏览器不支持现代文件访问API，无法使用`目录同步`以及`发送目录`功能，同时接收文件限制1GB。',
        toManyPeople: '当前连接人数太多，请稍后再试',
        serverError: '服务异常，请稍后再试',
        closeTheProxy: '如果当前处于代理环境，请关闭代理重试',
        connecting: '连接中',
        noSupportFileAccessAPI: '对方不支持现代文件访问API',
        connectInterrupted: '连接中断，传输失败',
        areYouSureContinue: '确定继续传输吗？',
        inTransit: '传输中',
        transCompleted: '传输完成',
        invalidPickupCode: '取件码无效',
        refusesToTransmit: '对方拒绝传输',
        waitingForConfirm: '等待对方确认',
        noSupportDirTrans: '当前浏览器不支持目录传输',
        connectTimeout: '连接超时'
      }
    }
  }
}))
