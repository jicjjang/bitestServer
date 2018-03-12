const fs = require('fs')
const tradeProcessor = require('../src/modules/trader').tradeProcessor;

const file = fs.readFileSync(__dirname + '/tradeInsertTest.txt', 'utf8')

test('traderProcessor with initial data', () => {
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

  const splitedFile = file.split('\n')

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

test('traderProcessor without initial data', () => {
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
  const splitedFile = file.split('\n')

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