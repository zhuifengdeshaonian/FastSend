export default function useFilesInfo(type?: string, fileMap?: any) {
  const filesInfo = useState<{ type: string; fileMap: any }>('useFilesInfo', () => ({
    type: '',
    fileMap: {}
  }))
  if (type) {
    filesInfo.value.type = type
  }
  if (fileMap) {
    filesInfo.value.fileMap = fileMap
  }
  return filesInfo
}
