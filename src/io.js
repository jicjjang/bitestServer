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

      _tradeResultEmitter(io, files[index++], buyList, sellList)
      let fileDataSender = setInterval(() => {
        if (!files[index] || files[index] == undefined) {
          clearInterval(fileDataSender)
        }
        _tradeResultEmitter(io, files[index++], buyList, sellList)
      }, 1000)
    })

    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected`)
    })
  })
}

function _tradeResultEmitter(io, file, buyList, sellList) {
  if (file) {
    const splitedFile = file.split('\t'),
      type = splitedFile[0],
      price = splitedFile[1],
      count = splitedFile[2]
    _tradeProcessor({ type, price, count }, buyList, sellList)
    io.emit('file parser', { type, price, count, buyList, sellList })
  }
}

function _tradeProcessor(insert, buyList, sellList) {
  const type = insert.type,
    price = parseInt(insert.price)
  let count = parseInt(insert.count)

  if (type.toLocaleUpperCase() === 'B') {
    let buyTotalPrice = price * count  // 살 수 있는 전체 가격

    for (let i=0; i<sellList.length; i++) {
      const intSellPrice = sellList[i].price,
        intSellCount = sellList[i].count,
        sellTotalPrice = intSellPrice * intSellCount

      if (intSellPrice <= price) {
        // case 1. 매도가 <= 매수가
        // 낮거나 같은 가격대를 살 수 있을만큼 구매 후, 매수 등록
        if (sellTotalPrice === buyTotalPrice) {
          // 1-1. 매수가 * 매수량 == 매도가 * 매도량
          // 매수량 0, 매도량 0, 거래 종료
          sellList.splice(i, 1)
          count = 0
          break
        } else if (sellTotalPrice > buyTotalPrice) {
          // 1-2. 매수가 * 매수량 > 매도가 * 매도량
          // 매수량 0, 거래 종료
          sellList[i].count = Math.round((sellTotalPrice - buyTotalPrice) / intSellPrice)
          count = 0
          break
        } else {
          // 1-3. 매수가 * 매수량 < 매도가 * 매도량
          // 매도량 0, 거래 계속
          sellList.splice(i, 1)
          count = Math.round((buyTotalPrice - sellTotalPrice) / price)
        }
      } else {
        // case 2. 매도가 > 매수가
        // 매수 등록
        for (let i=0; i<buyList.length; i++) {
          if (buyList[i].price === price) {
            // 2-1. 매수 리스트 가격 == 매수가
            buyList[i].count += count
            break
          } else if (buyList[i].price < price) {
            // 2-2. 매수 리스트 가격 < 매수가
            buyList.splice(i, 0, { price, count })
            break
          } else {
            // 2-2. 매수 리스트 가격 > 매수가
            if (!buyList[i+1]) {  // 다음 값이 없으면 등록 (가장 마지막)
              buyList[i+1] = { price, count }
              break
            }
          }
        }
        break
      }
    }

  } else if (type.toLocaleUpperCase() === 'S') {
    let sellTotalPrice = price * count  // 총 파는 가격

    for (let i=0; i<buyList.length; i++) {
      const intBuyPrice = buyList[i].price,
        intBuyCount = buyList[i].count,
        buyTotalPrice = intBuyPrice * intBuyCount

      // 파는건 가격까지 고려할 필요가 없으므로 내가 정한 가격보다
      // 더 비싼 매수가가 있으면 그대로 다 팔면 됨
      if (intBuyPrice >= price) {
        // case 1. 매수가 >= 매도가
        // 크거나 같은 가격대를 팔 수 있는만큼 판매 후, 매도 등록
        if (intBuyCount === count) {
          // 1-1. 매수량 == 매도량
          // 매도일 경우, 매수와는 다르게 돈이 정해진 것이 아니기 때문에
          // 돈이 추가된 price * count 방식으로 할 필요가 없음.
          buyList.splice(i, 1)
          count = 0
          break // 종료
        } else if (intBuyCount > count) {
          // 1-2. 매수량 > 매도량
          buyList[i].count -= count
          count = 0
          break // 종료
        } else {
          // 1-3. 매수량 < 매도량
          buyList.splice(i, 1)
          count = Math.round((sellTotalPrice - buyTotalPrice) / price)
        }
      } else {
        // case 2. 매수가 < 파는 가장 작은 값
        // 매수 등록
        for (let i=0; i<sellList.length; i++) {
          if (sellList[i].price === price) {
            // 2-1. 매도 리스트 가격 == 파는 가장 작은 값
            sellList[i].count += count
            break // 존재하는 리스트의 값에 추가
          } else if (sellList[i].price > price) {
            // 2-2. 매도 리스트 가격 > 파는 가장 작은 값
            sellList.splice(i, 0, { price, count })
            break // 리스트에 등록
          } else {
            // 2-3. 매도 리스트 가격 < 파는 가장 작은 값
            if (!sellList[i+1]) {  // 다음 값이 없으면 다음 값 (가장 마지막)
              sellList[i+1] = { price, count }
              break
            }
          }
        }
        break
      }
    }
  }
}