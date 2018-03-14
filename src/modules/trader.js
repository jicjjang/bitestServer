export function tradeResultEmitter(io, file, buyList, sellList) {
  if (file) {
    const splitedFile = file.split('\t'),
      type = splitedFile[0] || 'B',
      price = splitedFile[1] || 0,
      count = splitedFile[2] || 0

    const currentPrice = tradeProcessor({ type, price, count }, buyList, sellList)
    io.emit('file parser', { type, price, count, currentPrice, buyList, sellList })
  }
}

export function tradeProcessor(tradeData, buyList, sellList, isProduction=true) {
  let currentPrice = 0,
    count = parseInt(tradeData.count)
  const type = tradeData.type,
    price = parseInt(tradeData.price)

  if (type.toLocaleUpperCase() === 'B') {
    let buyTotalPrice = price * count  // 살 수 있는 전체 가격

    if (!sellList || sellList.length <= 0) {
      // 사려는 목록에 없다면 바로 등록
      _tradeRegister(buyList, type, price, count)
    } else {
      for (let i = 0; i < sellList.length; i++) {
        const intSellPrice = sellList[i].price,
          intSellCount = sellList[i].count,
          sellTotalPrice = intSellPrice * intSellCount

        if (intSellPrice <= price) {
          // case 1. 매도가 <= 매수가
          // 낮거나 같은 가격대를 살 수 있을만큼 구매 후, 매수 등록
          if (sellTotalPrice === buyTotalPrice) {
            // 1-1. 매수가 * 매수량 == 매도가 * 매도량
            // 매수량 0, 매도량 0, 거래 종료
            sellList.splice(i--, 1)
            count = 0
            currentPrice = price  // 매수량, 매도량이 이 딱 맞아서 거래 후 둘다 없어짐. 현재가는 price
            break
          } else if (sellTotalPrice > buyTotalPrice) {
            // 1-2. 매수가 * 매수량 > 매도가 * 매도량
            // 매수량 0, 거래 종료
            sellList[i].count = Math.round((sellTotalPrice - buyTotalPrice) / intSellPrice)
            count = 0
            currentPrice = intSellPrice  // 매도량이 더 많아서 매수값이 없어짐. 현재가는 intSellPrice
            break
          } else {
            // 1-3. 매수가 * 매수량 < 매도가 * 매도량
            // 매도량 0, 거래 계속
            sellList.splice(i--, 1)
            count = Math.round((buyTotalPrice - sellTotalPrice) / price)
            currentPrice = intSellPrice  // 매수량이 더 많아서 매도값이 없어짐. 현재가는 intBuyPrice
          }
        } else {
          // case 2. 매도가 > 매수가
          // 매수 등록
          _tradeRegister(buyList, type, price, count)
          break
        }
      }
    }
  } else if (type.toLocaleUpperCase() === 'S') {
    let sellTotalPrice = price * count  // 총 파는 가격

    if (!buyList || buyList.length <= 0) {
      // 팔려는 목록에 없다면 바로 등록
      _tradeRegister(sellList, type, price, count)
    } else {
      for (let i = 0; i < buyList.length; i++) {
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
            buyList.splice(i--, 1)
            count = 0
            currentPrice = price  // 매수량, 매도량이 이 딱 맞아서 거래 후 둘다 없어짐. 현재가는 0
            break // 종료
          } else if (intBuyCount > count) {
            // 1-2. 매수량 > 매도량
            buyList[i].count -= count
            count = 0
            currentPrice = intBuyPrice  // 매수량이 더 많아서 매도값이 없어짐. 현재가는 intBuyPrice
            break // 종료
          } else {
            // 1-3. 매수량 < 매도량
            buyList.splice(i--, 1)
            count -= intBuyCount
            currentPrice = intBuyPrice  // 매도량이 더 많아서 매수값이 없어짐. 현재가는 intBuyPrice
          }
        } else {
          // case 2. 매수가 < 파는 가장 작은 값
          // 매수 등록
          _tradeRegister(sellList, type, price, count)
          break
        }
      }
    }
  }

  return isProduction ? currentPrice : { buyList, sellList, currentPrice }
}

function _tradeRegister(list, type, price, count) {
  if (list && list.length > 0) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].price === price) {
        // case 1. 리스트 가격 == price
        // B, S 동일
        list[i].count += count
        break
      } else if (list[i].price < price) {
        // case 2. 리스트 가격 < price
        // B, S 다름
        if (type.toLocaleUpperCase() === 'B') {
          list.splice(i, 0, {price, count})
          break
        } else {
          if (!list[i + 1]) {  // 다음 값이 없으면 등록
            list[i + 1] = {price, count}
            break
          }
        }
      } else {
        // case 3. 리스트 가격 > price
        // B, S 다름
        if (type.toLocaleUpperCase() === 'B') {
          if (!list[i + 1]) {  // 다음 값이 없으면 등록
            list[i + 1] = {price, count}
            break
          }
        } else {
          list.splice(i, 0, {price, count})
          break
        }
      }
    }
  } else {
    list.push({ price, count })
  }
}
