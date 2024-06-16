export default defineWebSocketHandler({
  open(peer) {
    console.log('open', peer)
  },
  close(peer, details) {
    console.log('close', peer, details)
  },

  message(peer, message) {
    console.log('msg', peer, message)
  }
})
