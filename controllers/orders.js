import { StatusCodes } from 'http-status-codes'
import orders from '../models/orders.js'
import users from '../models/users.js'
import { getMessageFromValidationError } from '../utils/error.js'

export const create = async (req, res) => {
  try {
    if (req.user.cart.length === 0) {
      throw new Error('EMPTY')
    }
    const user = await users.findById(req.user._id, 'cart').populate('cart.product')
    const canCheckout = user.cart.every(cart => cart.product.sell)
    if (!canCheckout) {
      throw new Error('SELL')
    }
    await orders.create({
      user: req.user._id,
      cart: req.user.cart,
      address: req.body.address
    })
    req.user.cart = []
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: ''
    })
  } catch (error) {
    if (error.message === 'EMPTY') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '購物車為空'
      })
    } else if (error.message === 'SELL') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '包含已下架商品'
      })
    } else if (error.name === 'ValidationError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: getMessageFromValidationError(error)
      })
    } else {
      console.log(error)
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '發生錯誤'
      })
    }
  }
}

export const get = async (req, res) => {
  try {
    const result = await orders.find({ user: req.user._id }).populate('cart.product')
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}

export const getAll = async (req, res) => {
  try {
    const result = await orders.find().populate('cart.product').populate('user', 'account name')
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}
