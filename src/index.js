import express from 'express'
const app = express()
let port = 3000

/**
 * @Title DB
 * @Description 거래내역 저장용.
 */
// import mongoose from 'mongoose'
// import DB_URL from './config'
// mongoose.connect(DB_URL)
// mongoose.Promise = global.Promise
// mongoose.set('debug', true)
//
// const db = mongoose.connection
// db.on('error', console.error.bind(console, 'connection error:'))
// db.once('open', console.log.bind(console, "Connected to mongod server"))

/**
 * @Title Route
 * @Description static 파일 또는 일반 경로, 에러처리
 *              (소켓만 사용하면 거의 사용 용도가 없음.)
 */
import routes from './routes'
app.use('/static', express.static(__dirname + '/../public'))
app.use('/', routes)
app.use((err, req, res, next) => {
  res.status(err.status || 500).send({
    code: err.status || 500,
    message: err.message || 'Server error'
  })
})

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
 */
const io = require('socket.io')(server)
io.on('connection', socket => {
  console.log(`${socket.id} connected`)

  socket.on('test socket', data => {
    io.emit('test socket', data)
  })

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`)
  })
})