/**
 * 获取浏览器当前滚动高度
 * @returns 浏览器滚动高度
 */
export function getScrollTop(): number {
  // 检查 window 和 document 是否存在，以处理 SSR 的情况
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return 0
  }
  // 使用不同的方式获取滚动条高度，以处理浏览器兼容性问题
  if (typeof window.scrollY !== 'undefined') {
    // 支持现代浏览器
    return window.scrollY
  } else if (document.documentElement && document.documentElement.scrollTop) {
    // 兼容IE 6-8
    return document.documentElement.scrollTop
  } else if (document.body && document.body.scrollTop) {
    // 兼容一些老的浏览器
    return document.body.scrollTop
  }
  return 0
}

/**
 * 判断浏览器是否支持现代文件操作
 */
export function isModernFileAPIAvailable() {
  const fileHandleSupported = 'FileSystemHandle' in window
  const openFilePickerSupported = 'showOpenFilePicker' in window
  const saveFilePickerSupported = 'showSaveFilePicker' in window
  const directoryPickerSupported = 'showDirectoryPicker' in window

  return (
    fileHandleSupported &&
    openFilePickerSupported &&
    saveFilePickerSupported &&
    directoryPickerSupported
  )
}

/**
 * 生成随机字符串
 * @param length 长度
 * @returns
 */
export function genRandomString(length: number): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let randomString = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    randomString += charset.charAt(randomIndex)
  }
  return randomString
}
