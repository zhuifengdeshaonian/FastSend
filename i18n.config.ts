export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'zh',
  messages: {
    en: {
      welcome: 'Welcome',
      description: 'Point-to-point fast file transfer and directory synchronization',
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
        reciveCode: 'Recive Code',
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
          'Warning: Your browser does not support modern file access APIs, making the `Directory Sync` and `Send Directory` features unavailable. Additionally, the file receiving limit is 1GB.'
      }
    },
    zh: {
      welcome: '欢迎',
      description: '点对点快速文件传输和目录同步',
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
        reciveCode: '取件码',
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
          '警告：您的浏览器不支持现代文件访问API，无法使用`目录同步`以及`发送目录`功能，同时接收文件限制1GB。'
      }
    }
  }
}))
