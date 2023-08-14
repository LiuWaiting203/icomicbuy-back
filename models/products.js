import mongoose from 'mongoose'
import random from 'mongoose-simple-random'

const schema = new mongoose.Schema({
  user: {
    type: mongoose.ObjectId,
    ref: 'users',
    required: [true, '缺少賣家'],
    default: []
  },
  name: {
    type: String,
    required: [true, '缺少商品名稱']
  },
  price: {
    type: Number,
    required: [true, '缺少價格'],
    minlength: [0, '價格過低']
  },
  image: {
    type: String,
    required: [true, '缺少圖片']
  },
  description: {
    type: String,
    required: [true, '缺少說明']
  },
  category: {
    type: String,
    required: [true, '缺少分類'],
    enum: {
      values: ['漫畫', '插畫', '素材', '音樂', '3D模型', '遊戲', '公仔'],
      message: '分類錯誤'
    }
  },
  sell: {
    type: Boolean,
    default: false,
    required: [true, '缺少上架狀態']
  }
}, { versionKey: false })

schema.plugin(random)

export default mongoose.model('products', schema)
