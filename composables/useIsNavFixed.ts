export default function useIsNavFixed(val: boolean | undefined) {
  const isNavFixed = useState('isNavFixed', () => false)
  if (val !== undefined) {
    isNavFixed.value = val
  }
  return isNavFixed
}
