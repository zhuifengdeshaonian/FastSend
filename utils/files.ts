// import '@types/wicg-file-system-access'

async function dealFilesFromHandlerLoop(
  fh: FileSystemFileHandle | FileSystemDirectoryHandle,
  paths: Array<string>,
  result: any
) {
  if (fh.kind === 'file') {
    const file = await fh.getFile()
    result[paths.join('/')] = {
      paths: [...paths],
      size: file.size,
      lastModified: file.lastModified,
      file: file
    }
  } else if (fh.kind === 'directory') {
    for await (const fh1 of fh.entries()) {
      await dealFilesFromHandlerLoop(fh1[1], [...paths, fh1[0]], result)
    }
  }
}

/**
 *
 * @param fh 根据目录Handler构建扁平文件树
 * @returns
 */
export async function dealFilesFromHandler(fh: FileSystemDirectoryHandle) {
  const result = {}
  await dealFilesFromHandlerLoop(fh, [], result)
  return result
}

/**
 * 根据文件列表构建扁平文件树
 * @param fl
 * @returns
 */
export function dealFilesFormList(fl: Array<File>) {
  const result: any = {}
  for (const f of fl) {
    result[f.name] = {
      paths: f.webkitRelativePath.split('/'),
      size: f.size,
      lastModified: f.lastModified,
      file: f
    }
  }
  return result
}

/**
 * 根据文件构建扁平文件树
 * @param file
 * @returns
 */
export function dealFilesFormFile(file: File) {
  return {
    [file.name]: {
      paths: [file.name],
      size: file.size,
      lastModified: file.lastModified,
      file: file
    }
  }
}

/**
 * 选择目录
 * @param cb 回调方法
 * @returns
 */
export function selectDir(cb: (files: Array<File>) => void) {
  if (typeof window === 'undefined') {
    return
  }
  const input = document.createElement('input')
  input.style.display = 'none'
  input.type = 'file'
  input.multiple = true
  input.webkitdirectory = true
  input.onchange = () => {
    input.onchange = null
    input.remove()
    if (input.files) {
      cb([...input.files])
    }
  }
  input.click()
}

/**
 * 选择文件
 * @param cb 回调方法
 * @returns
 */
export function selectFile(cb: (files: File) => void, accept: string | undefined) {
  if (typeof window === 'undefined') {
    return
  }
  const input = document.createElement('input')
  input.style.display = 'none'
  input.type = 'file'
  if (accept) {
    input.accept = accept
  }
  input.onchange = () => {
    input.onchange = null
    input.remove()
    if (input.files && input.files.length > 0) {
      cb(input.files[0])
    }
  }
  input.click()
}
