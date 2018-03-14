import express from 'express'
const app = express()
let port = 3000

/**
 * @Server
 * @Description 서버
 */
const server = app.listen(port, () => {
  console.log('Express listening on port ', port)
})

/**
 * @Socket
 * @Description 소켓
 * @params server
 * @params initialBuyList : 임의의 초기 데이터
 * @params initialSellList : 임의의 초기 데이터
 */

require('./io')(server)
