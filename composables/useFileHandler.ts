export default function useFileHandler(fh: FileSystemHandle | undefined) {
  const fileHandler = useState('fileHandler')
  if (fh) {
    fileHandler.value = fh
  }
  return fileHandler
}
