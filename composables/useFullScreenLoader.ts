export default function useFullScreenLoader(isLoading: boolean | undefined) {
  const isFullScreenLoading = useState('isFullScreenLoading', () => true)
  if (isLoading !== undefined) {
    isFullScreenLoading.value = isLoading
  }
  return isFullScreenLoading
}
