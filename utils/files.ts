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
export async function dealFilesFormList(fl: Array<File>) {
  return new Promise<any>((resolve, reject) => {
    const result: any = {}
    for (const f of fl) {
      result[f.webkitRelativePath] = {
        paths: f.webkitRelativePath.split('/'),
        size: f.size,
        lastModified: f.lastModified,
        file: f
      }
    }
    resolve(result)
  })
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
 * @returns
 */
export async function selectDir() {
  return new Promise<Array<File>>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject()
      return
    }
    const input = document.createElement('input')
    input.style.display = 'none'
    input.type = 'file'
    // input.multiple = true
    input.webkitdirectory = true
    input.directory = true
    input.onchange = () => {
      input.onchange = null
      input.oncancel = null
      input.remove()
      if (input.files) {
        resolve([...input.files])
      } else {
        resolve([])
      }
    }
    input.oncancel = () => {
      if (input.files && input.files.length === 0) {
        reject('No file')
      } else {
        reject('Cancel')
      }
    }
    input.click()
  })
}

/**
 * 选择文件
 * @param accept 接受的MIME类型
 * @returns
 */
export async function selectFile(accept?: string) {
  return new Promise<File>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject()
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
        resolve(input.files[0])
      } else {
        reject('No select')
      }
    }
    input.click()
  })
}
