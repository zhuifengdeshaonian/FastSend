export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'zh',
  messages: {
    en: {
      welcome: 'Welcome',
      description:
        'A tool station based on WebRTC to achieve point-to-point fast directory synchronization and file transfer',
      home: 'Home',
      about: 'About',
      label: {
        title: 'Title',
        secondsAgo: '{n} seconds ago',
        minutesAgo: '{n} minutes ago',
        hoursAgo: '{n} hours ago',
        daysAgo: '{n} days ago',
        send: 'Send',
        recive: 'Recive',
        quickStart: 'Qucik Start'
      },
      btn: {
        submit: 'Submit',
        update: 'Update',
        ok: 'OK',
        cancel: 'Cancel',
        send: 'Send',
        clear: 'Clear',
        download: 'Download',
        copy: 'Copy',
        copied: 'Copied'
      },
      hint: {
        noModernFileAPIWarn:
          'Warning: Your browser does not support the modern file access API, which means you cannot use the `Directory Sync` and `Receive Directory` functions, and there is a file receiving limit of 1GB.'
      }
    },
    zh: {
      welcome: '欢迎',
      description: '基于WebRTC实现点对点快速目录同步和文件传输的工具站',
      home: '主页',
      about: '关于',
      label: {
        title: '标题',
        secondsAgo: '{n} 秒前',
        minutesAgo: '{n} 分前',
        hoursAgo: '{n} 小时前',
        daysAgo: '{n} 天前',
        send: '发送',
        recive: '接收',
        quickStart: '快速开始'
      },
      btn: {
        submit: '提交',
        update: '更新',
        ok: '确定',
        cancel: '取消',
        send: '发送',
        clear: '清空',
        download: '下载',
        copy: '复制',
        copied: '已复制'
      },
      hint: {
        noModernFileAPIWarn:
          '警告：您的浏览器不支持现代文件访问API，无法使用接收`目录同步`以及`接收目录`功能，同时接收文件限制1GB。'
      }
    }
  }
}))
