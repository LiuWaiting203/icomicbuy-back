import products from '../models/products.js'

/**
 * 隨機取上架商品
 * @param {number} limit 隨機數量
 * @returns
 */
export const randomProducts = (limit) => new Promise((resolve, reject) => {
  products.findRandom({ sell: true }, {}, { limit }, (error, docs) => {
    console.log(error, docs)
    console.log(123)
    if (error) {
      reject(error)
    } else {
      resolve(docs)
    }
  })
})
