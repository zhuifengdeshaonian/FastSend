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
      hint: {}
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
      hint: {}
    }
  }
}))
