import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import { StatusCodes } from 'http-status-codes'
import mongoSanitize from 'express-mongo-sanitize'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import routeUsers from './routes/users.js'
import routeProduct from './routes/products.js'
import routeOrders from './routes/orders.js'
import './passport/passport.js'

const app = express()

app.use(rateLimit({
  // 設定一個 IP 15 分鐘內最多 100 次請求
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  // 超出流量回應的狀態碼
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
  // 超出流量回應的訊息
  message: '送出太多請求, 15分鐘後再試一遍',
  handler(req, res, next, options) {
    res.status(options.statusCode).json({
      success: false,
      message: options.message
    })
  }
}))

app.use(cors({
  /**
   *
   * @param {*} origin 請求來源
   * @param {*} callback (錯誤, 是否允許請求)
   */
  origin(origin, callback) {
    if (origin === undefined || origin.includes('github') || origin.includes('localhost')) {
      callback(null, true)
    } else {
      callback(new Error('CORS'), false)
    }
  }
}))

app.use((_, req, res, next) => {
  res.status(StatusCodes.FORBIDDEN).json({
    success: true,
    message: '請求被拒'
  })
})

app.use(express.json())
app.use((_, req, res, next) => {
  res.status(StatusCodes.BAD_REQUEST).json({
    success: true,
    message: '資料格式錯誤'
  })
})

app.use(mongoSanitize())

app.use('/users', routeUsers)
app.use('/products', routeProduct)
app.use('/orders', routeOrders)

app.all('*', (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: '找不到'
  })
})

app.listen(process.env.PORT || 4000, async () => {
  console.log('Server Actived')
  await mongoose.connect(process.env.DB_URL)
  mongoose.set('sanitizeFilter', true)
  console.log('Database connected')
})
