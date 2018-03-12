import { tradeResultEmitter } from './modules/trader'
/**
 * @io.js
 * @param server
 * @param buyList
 *  @type [{
 *    price: Int
 *    count: Int
 *  }]
 * @param sellList
 *  @type [{
 *    price: Int
 *    count: Int
 *  }]
 */
module.exports = (server, buyList, sellList) => {
  const io = require('socket.io')(server)
  io.on('connection', socket => {
    socket.emit('init data parse', { buyList, sellList })

    socket.on('file parser', files => {
      let index = 0

      tradeResultEmitter(io, files[index++], buyList, sellList)
      let fileDataSender = setInterval(() => {
        if (!files[index] || files[index] == undefined) {
          clearInterval(fileDataSender)
        }
        tradeResultEmitter(io, files[index++], buyList, sellList)
      }, 1000)
    })

    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected`)
    })
  })
}