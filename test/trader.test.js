const fs = require('fs')
const tradeProcessor = require('../src/modules/trader').tradeProcessor;

const testFile = fs.readFileSync(__dirname + '/testTradeInsert.txt', 'utf8')
const devFile = fs.readFileSync(__dirname + '/devTradeInsert.txt', 'utf8')

/**
 * @TODO
 * 18가지 경우 테스트
 * => test 1, 2번에 순서대로 18가지 테스트
 * => test 3, 4번에 개발시 사용했던 파일 그대로를 입력
 *
 * BUY
 *   매수가 == 최저 매도가
 *     1. 매수가 * 매수량 == 매도가 * 매도량
 *     2. 매수가 * 매수량 > 매도가 * 매도량
 *     3. 매수가 * 매수량 < 매도가 * 매도량
 *   매수가 > 최저 매도가
 *     4. 매수가 * 매수량 == 매도가 * 매도량
 *     5. 매수가 * 매수량 > 매도가 * 매도량
 *     6. 매수가 * 매수량 < 매도가 * 매도량
 *   매수가 < 최저 매도가
 *     7. 매수가 * 매수량 == 매도가 * 매도량
 *     8. 매수가 * 매수량 > 매도가 * 매도량
 *     9. 매수가 * 매수량 < 매도가 * 매도량
 * SELL
 *   최고 매수가 == 매도가
 *     10. 매수량 == 매도량
 *     11. 매수량 > 매도량
 *     12. 매수량 < 매도량
 *   최고 매수가 > 매도가
 *     13. 매수량 == 매도량
 *     14. 매수량 > 매도량
 *     15. 매수량 < 매도량
 *   최고 매수가 < 매도가
 *     16. 매수량 == 매도량
 *     17. 매수량 > 매도량
 *     18. 매수량 < 매도량
 */

// 1. 테스트 거래 데이터와 초기 데이터
test('1. traderProcessor with initial data and test trade data', () => {
  let targetTradeList = {
      buyList: [
        { count: 100, price: 540 },
        { count: 100, price: 535 },
        { count: 100, price: 533 },
        { count: 50, price: 532 },
        { count: 100, price: 531 },
        { count: 100, price: 525 },
        { count: 50, price: 524 },
        { count: 100, price: 523 }
      ], sellList: [
        { count: 100, price: 541 },
        { count: 100, price: 542 },
        { count: 50, price: 544 },
        { count: 100, price: 545 },
        { count: 100, price: 550 },
        { count: 50, price: 551 },
        { count: 100, price: 552 },
        { count: 100, price: 553 }
      ]
    },
    testTradeList = JSON.parse(JSON.stringify(targetTradeList))

  const appendTradeValues = [
    { func: () => { testTradeList['sellList'].shift() } },
    { func: () => {
      testTradeList['sellList'].shift()
      testTradeList['buyList'].splice(0, 0, { count: 20, price: 542 })
    } },
    { func: () => { testTradeList['sellList'][0].count -= 30 } },
    { func: () => { testTradeList['sellList'].shift() } },
    { func: () => {
      testTradeList['sellList'].shift()
      testTradeList['buyList'].splice(0, 0, { count: 10, price: 546 })
    } },
    { func: () => { testTradeList['sellList'][0].count -= 20 } },
    { func: () => { testTradeList['buyList'].push({ count: 200, price: 275 }) } },
    { func: () => { testTradeList['buyList'].splice(1, 0, { count: 60, price: 545 }) } },
    { func: () => { testTradeList['buyList'].splice(2, 0, { count: 120, price: 544 }) } },
    { func: () => { testTradeList['buyList'].shift() } },
    { func: () => { testTradeList['buyList'][0].count -= 20 } },
    { func: () => {
      testTradeList['buyList'].shift()
      testTradeList['sellList'].splice(0, 0, { count: 20, price: 545 })
    } },
    { func: () => { testTradeList['buyList'].shift() } },
    { func: () => { testTradeList['buyList'][0].count -= 10 } },
    { func: () => {
      testTradeList['buyList'].shift()
      testTradeList['buyList'][0].count -= 10
    } },
    { func: () => { testTradeList['sellList'].splice(0, 0, { count: 90, price: 544 }) } },
    { func: () => { testTradeList['sellList'].push({ count: 20, price: 555 }) } },
    { func: () => { testTradeList['sellList'].splice(6, 0, { count: 200, price: 554 }) } },
  ]

  const splitedFile = testFile.split('\n')

  for (var i=0; i<splitedFile.length; i++) {
    const data = splitedFile[i].split('\t'),
      type = data[0],
      price = data[1],
      count = data[2]

    appendTradeValues[i].func()

    expect(tradeProcessor({
      type: type,
      price: price,
      count: count
    }, targetTradeList.buyList, targetTradeList.sellList))
      .toEqual(testTradeList);
  }
})

// 2. 테스트 거래 데이터와 비어있는 초기 데이터
test('2. traderProcessor without initial data and test trade data', () => {
  let targetTradeList = {
      buyList: [],
      sellList: []
    },
    testTradeList = JSON.parse(JSON.stringify(targetTradeList))

  const appendTradeValues = [
    { func: () => { testTradeList['buyList'].splice(0, 0, { count: 100, price: 541 }) } },
    { func: () => { testTradeList['buyList'].splice(0, 0, { count: 120, price: 542 }) } },
    { func: () => { testTradeList['buyList'].splice(0, 0, { count: 30, price: 544 }) } },
    { func: () => { testTradeList['buyList'].splice(0, 0, { count: 16, price: 680 }) } },
    { func: () => { testTradeList['buyList'].splice(1, 0, { count: 110, price: 546 }) } },
    { func: () => { testTradeList['buyList'].splice(1, 0, { count: 20, price: 551 }) } },
    { func: () => { testTradeList['buyList'].push({ count: 200, price: 275 }) } },
    { func: () => { testTradeList['buyList'].splice(3, 0, { count: 60, price: 545 }) } },
    { func: () => { testTradeList['buyList'][4].count += 120 } },

    { func: () => { testTradeList['buyList'][0].count -= 10 } },
    { func: () => {
      testTradeList['buyList'].shift()
      testTradeList['buyList'][0].count -= 14
    } },
    { func: () => {
      testTradeList['buyList'].shift()
      testTradeList['buyList'][0].count -= 54
    } },
    { func: () => {
      testTradeList['buyList'].shift()
      testTradeList['buyList'].shift()
      testTradeList['buyList'][0].count -= 4
    } },
    { func: () => { testTradeList['buyList'][0].count -= 10 } },
    { func: () => { testTradeList['buyList'][0].count -= 20 } },
    { func: () => { testTradeList['buyList'][0].count -= 90 } },
    { func: () => { testTradeList['sellList'].splice(0, 0, { count: 20, price: 555 }) } },
    { func: () => { testTradeList['sellList'].splice(0, 0, { count: 200, price: 554 }) } },
  ]
  const splitedFile = testFile.split('\n')

  for (var i=0; i<splitedFile.length; i++) {
    const data = splitedFile[i].split('\t'),
      type = data[0],
      price = data[1],
      count = data[2]

    appendTradeValues[i].func()

    expect(tradeProcessor({
      type: type,
      price: price,
      count: count
    }, targetTradeList.buyList, targetTradeList.sellList))
      .toEqual(testTradeList);
  }
})

// 3. 개발용 거래 데이터와 초기 데이터
test('3. traderProcessor with initial data and dev trade data', () => {
  let targetTradeList = {
    buyList: [
      { count: 100, price: 540 },
      { count: 100, price: 535 },
      { count: 100, price: 533 },
      { count: 50, price: 532 },
      { count: 100, price: 531 },
      { count: 100, price: 525 },
      { count: 50, price: 524 },
      { count: 100, price: 523 }
    ], sellList: [
      { count: 100, price: 541 },
      { count: 100, price: 542 },
      { count: 50, price: 544 },
      { count: 100, price: 545 },
      { count: 100, price: 550 },
      { count: 50, price: 551 },
      { count: 100, price: 552 },
      { count: 100, price: 553 }
    ]
  },
  testTradeList = JSON.parse(JSON.stringify(targetTradeList))

  const appendTradeValues = [
    { func: () => { testTradeList['sellList'][4].count += 100 } },
    { func: () => { testTradeList['buyList'][0].count += 100 } },
    { func: () => { testTradeList['sellList'].splice(4, 0, { count: 40, price: 549 }) } },
    { func: () => { testTradeList['sellList'].shift() } },
    { func: () => { testTradeList['sellList'].splice(3, 0, { count: 50, price: 548 }) } },
    { func: () => { testTradeList['sellList'].shift() } },
    { func: () => { testTradeList['sellList'].splice(2, 0, { count: 100, price: 547 }) } },
    { func: () => { testTradeList['buyList'].splice(0, 0, { count: 50, price: 543 }) } },
    { func: () => { testTradeList['sellList'].splice(2, 0, { count: 100, price: 546 }) } },
    { func: () => {
        testTradeList['sellList'].shift()
        testTradeList['buyList'].splice(0, 0, { count: 50, price: 544 })
      }},
    { func: () => { testTradeList['sellList'][0].count += 60 } },
    { func: () => { testTradeList['sellList'][0].count -= 50 } },
    { func: () => { testTradeList['sellList'][0].count += 50 } },
    { func: () => { testTradeList['sellList'][0].count -= 100 } },
    { func: () => { testTradeList['sellList'][0].count -= 20 } },
    { func: () => { testTradeList['buyList'].shift() } },
    { func: () => { testTradeList['sellList'][0].count -= 10 } },
    { func: () => { testTradeList['sellList'][0].count += 100 } },
    { func: () => { testTradeList['sellList'][1].count += 100 } },
    { func: () => { testTradeList['sellList'][2].count += 100 } },
    { func: () => { testTradeList['sellList'][5].count += 100 } },
    { func: () => { testTradeList['buyList'][1].count += 100 } },
    { func: () => { testTradeList['sellList'][4].count += 40 } },
    { func: () => { testTradeList['buyList'].splice(1, 0, { count: 100, price: 541 }) } },
    { func: () => { testTradeList['sellList'][3].count += 50 } },
    { func: () => { testTradeList['buyList'].splice(1, 0, { count: 100, price: 542 }) } },
    { func: () => { testTradeList['sellList'][2].count += 100 } },
    { func: () => { testTradeList['buyList'][0].count += 50 } },
    { func: () => { testTradeList['sellList'][1].count += 100 } },
    { func: () => { testTradeList['buyList'].splice(0, 0, { count: 100, price: 544 }) } },
    { func: () => { testTradeList['sellList'][0].count += 60 } },
    { func: () => { testTradeList['sellList'][0].count -= 50 } },
    { func: () => { testTradeList['sellList'][0].count += 50 } },
    { func: () => { testTradeList['sellList'][0].count -= 100 } },
    { func: () => { testTradeList['sellList'][0].count -= 20 } },
    { func: () => { testTradeList['sellList'][0].count -= 10 } },
    { func: () => { testTradeList['buyList'][0].count -= 50 } },
    { func: () => { testTradeList['sellList'][0].count += 100 } },
    { func: () => { testTradeList['sellList'][1].count += 100 } },
    { func: () => { testTradeList['sellList'][2].count += 100 } },
    { func: () => { testTradeList['sellList'][5].count += 100 } },
    { func: () => { testTradeList['buyList'][4].count += 100 } },
    { func: () => { testTradeList['sellList'][4].count += 40 } },
    { func: () => { testTradeList['buyList'][3].count += 100 } },
    { func: () => { testTradeList['sellList'][3].count += 50 } },
    { func: () => { testTradeList['buyList'][2].count += 100 } },
    { func: () => { testTradeList['sellList'][2].count += 100 } },
    { func: () => { testTradeList['buyList'][1].count += 50 } },
    { func: () => { testTradeList['sellList'][1].count += 100 } },
    { func: () => { testTradeList['buyList'][0].count += 100 } },
    { func: () => { testTradeList['sellList'][0].count += 60 } },
    { func: () => { testTradeList['sellList'][0].count -= 50 } },
    { func: () => { testTradeList['sellList'][0].count += 50 } },
    { func: () => { testTradeList['sellList'][0].count -= 100 } },
    { func: () => { testTradeList['sellList'][0].count -= 20 } },
    { func: () => { testTradeList['sellList'][0].count -= 10 } },
    { func: () => { testTradeList['buyList'][0].count -= 50 } }
  ]

  const splitedFile = devFile.split('\n')

  for (var i=0; i<splitedFile.length; i++) {
    const data = splitedFile[i].split('\t'),
      type = data[0],
      price = data[1],
      count = data[2]

    appendTradeValues[i].func()

    expect(tradeProcessor({
      type: type,
      price: price,
      count: count
    }, targetTradeList.buyList, targetTradeList.sellList))
      .toEqual(testTradeList);
  }
})

// 4. 개발용 거래 데이터와 비어있는 초기 데이터
test('4. traderProcessor without initial data and dev trade data', () => {
  let targetTradeList = {
    buyList: [],
    sellList: []
  },
  testTradeList = JSON.parse(JSON.stringify(targetTradeList))

  const appendTradeValues = [
    { func: () => { testTradeList['sellList'].splice(0, 0, { count: 100, price: 550 }) } },
    { func: () => { testTradeList['buyList'].splice(0, 0, { count: 100, price: 540 }) } },
    { func: () => { testTradeList['sellList'].splice(0, 0, { count: 40, price: 549 }) } },
    { func: () => { testTradeList['buyList'].splice(0, 0, { count: 100, price: 541 }) } },
    { func: () => { testTradeList['sellList'].splice(0, 0, { count: 50, price: 548 }) } },
    { func: () => { testTradeList['buyList'].splice(0, 0, { count: 100, price: 542 }) } },
    { func: () => { testTradeList['sellList'].splice(0, 0, { count: 100, price: 547 }) } },
    { func: () => { testTradeList['buyList'].splice(0, 0, { count: 50, price: 543 }) } },
    { func: () => { testTradeList['sellList'].splice(0, 0, { count: 100, price: 546 }) } },
    { func: () => { testTradeList['buyList'].splice(0, 0, { count: 100, price: 544 }) } },
    { func: () => { testTradeList['sellList'].splice(0, 0, { count: 60, price: 545 }) } },
    { func: () => { testTradeList['sellList'][0].count -= 50 } },
    { func: () => { testTradeList['sellList'][0].count += 50 } },
    { func: () => {
      testTradeList['sellList'].shift()
        testTradeList['buyList'].splice(0, 0, { count: 40, price: 545 })
    }},
    { func: () => { testTradeList['sellList'][0].count -= 20 } },
    { func: () => {
      testTradeList['buyList'].shift()
      testTradeList['buyList'][0].count -= 10
    } },
    { func: () => { testTradeList['sellList'][0].count -= 10 } },
    { func: () => { testTradeList['sellList'].splice(0, 0, { count: 100, price: 545 }) } },
    { func: () => { testTradeList['sellList'][1].count += 100 } },
    { func: () => { testTradeList['sellList'][2].count += 100 } },
    { func: () => { testTradeList['sellList'][5].count += 100 } },
    { func: () => { testTradeList['buyList'][4].count += 100 } },
    { func: () => { testTradeList['sellList'][4].count += 40 } },
    { func: () => { testTradeList['buyList'][3].count += 100 } },
    { func: () => { testTradeList['sellList'][3].count += 50 } },
    { func: () => { testTradeList['buyList'][2].count += 100 } },
    { func: () => { testTradeList['sellList'][2].count += 100 } },
    { func: () => { testTradeList['buyList'][1].count += 50 } },
    { func: () => { testTradeList['sellList'][1].count += 100 } },
    { func: () => { testTradeList['buyList'][0].count += 100 } },
    { func: () => { testTradeList['sellList'][0].count += 60 } },
    { func: () => { testTradeList['sellList'][0].count -= 50 } },
    { func: () => { testTradeList['sellList'][0].count += 50 } },
    { func: () => { testTradeList['sellList'][0].count -= 100 } },
    { func: () => { testTradeList['sellList'][0].count -= 20 } },
    { func: () => { testTradeList['sellList'][0].count -= 10 } },
    { func: () => { testTradeList['buyList'][0].count -= 50 } },
    { func: () => { testTradeList['sellList'][0].count += 100 } },
    { func: () => { testTradeList['sellList'][1].count += 100 } },
    { func: () => { testTradeList['sellList'][2].count += 100 } },
    { func: () => { testTradeList['sellList'][5].count += 100 } },
    { func: () => { testTradeList['buyList'][4].count += 100 } },
    { func: () => { testTradeList['sellList'][4].count += 40 } },
    { func: () => { testTradeList['buyList'][3].count += 100 } },
    { func: () => { testTradeList['sellList'][3].count += 50 } },
    { func: () => { testTradeList['buyList'][2].count += 100 } },
    { func: () => { testTradeList['sellList'][2].count += 100 } },
    { func: () => { testTradeList['buyList'][1].count += 50 } },
    { func: () => { testTradeList['sellList'][1].count += 100 } },
    { func: () => { testTradeList['buyList'][0].count += 100 } },
    { func: () => { testTradeList['sellList'][0].count += 60 } },
    { func: () => { testTradeList['sellList'][0].count -= 50 } },
    { func: () => { testTradeList['sellList'][0].count += 50 } },
    { func: () => { testTradeList['sellList'][0].count -= 100 } },
    { func: () => { testTradeList['sellList'][0].count -= 20 } },
    { func: () => { testTradeList['sellList'][0].count -= 10 } },
    { func: () => { testTradeList['buyList'][0].count -= 50 } },
  ]
  const splitedFile = devFile.split('\n')

  for (var i=0; i<splitedFile.length; i++) {
    const data = splitedFile[i].split('\t'),
      type = data[0],
      price = data[1],
      count = data[2]

    appendTradeValues[i].func()

    expect(tradeProcessor({
      type: type,
      price: price,
      count: count
    }, targetTradeList.buyList, targetTradeList.sellList))
      .toEqual(testTradeList);
  }
})