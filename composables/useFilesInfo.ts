export default function useFilesInfo(type: string, fileMap: Map<any, any>) {
  const filesInfo = useState('useFilesInfo', () => ({ type: '', fileMap: new Map() }))
  if (type) {
    filesInfo.value.type = type
  }
  if (fileMap) {
    filesInfo.value.fileMap = fileMap
  }
  return filesInfo
}
