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

/**
 * 选择头像图片
 * @param cb 回调
 * @returns
 */
export function selectAvatar(cb: (url: string) => void) {
  if (typeof window === 'undefined') {
    return
  }
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = () => {
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      input.onchange = null
      input.remove()
      createImageBitmap(file)
        .then((img) => {
          // 将图片转256x256的webp格式，节省空间
          const oc = new OffscreenCanvas(256, 256)
          const ctx = oc.getContext('2d')
          if (!ctx) {
            throw new Error('Failed to create context')
          }
          ctx.drawImage(img, 0, 0, 256, 256)
          return oc.convertToBlob({ type: 'image/webp', quality: 0.61 })
        })
        .then((blob) => {
          // 再转换成DataURL方便存储
          const fr = new FileReader()
          fr.onload = () => {
            cb(fr.result + '')
          }
          fr.readAsDataURL(blob)
        })
        .catch(console.warn)
    } else {
      cb('')
      input.onchange = null
      input.remove()
    }
  }
  input.click()
}

/**
 * 将字节格式化为人类友好的文本
 *
 * @param bytes 字节数量
 * @param decimals 显示的小数位数
 *
 * @return 格式化后的字符串
 */
export function humanFileSize(bytes: number, decimals = 2) {
  if (!bytes) return '0B'
  var k = 1024
  var dm = decimals || 2
  var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  var i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i]
}

export function doDownloadFromHref(href: string, filename: string) {
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/**
 * 从Blob下载
 *
 * @param {Blob} blob
 * @param {string} filename
 */
export function doDownloadFromBlob(blob: Blob | File, filename: string) {
  const objUrl = URL.createObjectURL(blob)
  doDownloadFromHref(objUrl, filename)
  URL.revokeObjectURL(objUrl)
}

export async function copyToClipboard(content: string | ImageData): Promise<void> {
  // Check if the environment is SSR
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.clipboard) {
    return
  }

  try {
    if (typeof content === 'string') {
      await navigator.clipboard.writeText(content)
    } else {
      const canvas = document.createElement('canvas')
      canvas.width = content.width
      canvas.height = content.height
      const context = canvas.getContext('2d')

      if (!context) {
        throw new Error('Failed to get canvas context')
      }

      context.putImageData(content, 0, 0)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve))

      if (!blob) {
        throw new Error('Failed to create blob from canvas')
      }

      const item = new ClipboardItem({ 'image/png': blob })
      await navigator.clipboard.write([item])
    }
  } catch (error) {
    console.warn(error)
  }
}
