import { tradeResultEmitter } from './modules/trader'
import { initialBuyList as buyList, initialSellList as sellList } from './initTradeList'

/**
 * @tempFileSaveArea
 * @Description DB 대신 입력된 파일들을 순차적으로 저장해놓을 수 있는 임시 변수. 저장할 곳이 없으면
 *              입력되는 값들이 소켓마다 async하게 값들을 계속 보내서 1초마다 실행이 되지 않음.
 */
let tempFileSaveArea = []

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
module.exports = (server) => {
  const io = require('socket.io')(server)
  io.on('connection', socket => {
    console.log(`${socket.id} connected`)

    socket.emit('init data parse', { buyList, sellList })

    socket.on('file parser', files => {
      // 파일을 추가 전, 기존에 이미 tempFileWatcher가 실행 중이니 리스트만 추가
      // 리스트가 없으면 실행 중이 아니니 tempFileWatcher를 실행
      if (tempFileSaveArea && tempFileSaveArea.length > 0) {
        tempFileSaveArea = tempFileSaveArea.concat(files.split('\n'))
      } else {
        tempFileSaveArea = tempFileSaveArea.concat(files.split('\n'))
        tempFileWatcher(io)
      }
    })

    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected`)
    })
  })
}

function tempFileWatcher (io) {
  if (!tempFileSaveArea || tempFileSaveArea.length <= 0) {
    return
  }

  const data = tempFileSaveArea.shift()
  if (!data) {
    return
  }
  tradeResultEmitter(io, data, tempFileSaveArea.length || 0, buyList, sellList)

  const fileDataSender = setInterval(() => {
    const data = tempFileSaveArea.shift()
    if (!data) {
      clearInterval(fileDataSender)
      return
    }
    tradeResultEmitter(io, data, tempFileSaveArea.length || 0, buyList, sellList)
  }, 1000)
}