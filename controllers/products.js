import { StatusCodes } from 'http-status-codes'
import products from '../models/products.js'
import { getMessageFromValidationError } from '../utils/error.js'

export const create = async (req, res) => {
  try {
    const result = await products.create({
      name: req.body.name,
      price: req.body.price,
      image: req.file.path,
      description: req.body.description,
      category: req.body.category,
      user: {
        _id: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar
      }
    })
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: getMessageFromValidationError(error)
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '發生錯誤'
      })
    }
  }
}

export const getAll = async (req, res) => {
  try {
    let result = products
      .find({
        $or: [
          { name: new RegExp(req.query.search, 'i') },
          { description: new RegExp(req.query.search, 'i') },
          { category: new RegExp(req.query.search, 'i') }
        ]
      })
      .sort({ [req.query.sortBy]: req.query.sortOrder === 'asc' ? 1 : -1 })
    if (req.query.itemsPerPage > -1) {
      result = result
        .skip((req.query.page - 1) * req.query.itemsPerPage)
        .limit(req.query.itemsPerPage)
    }
    result = await result
    const count = await products.estimatedDocumentCount()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        data: result,
        count
      }
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}

export const getUserId = async (req, res) => {
  try {
    let result = products
      .find({
        user: req.user._id,
        $or: [
          { name: new RegExp(req.query.search, 'i') },
          { description: new RegExp(req.query.search, 'i') },
          { category: new RegExp(req.query.search, 'i') }
        ]
      })
      .sort({ [req.query.sortBy]: req.query.sortOrder === 'asc' ? 1 : -1 })
    if (req.query.itemsPerPage > -1) {
      result = result
        .skip((req.query.page - 1) * req.query.itemsPerPage)
        .limit(req.query.itemsPerPage)
    }
    result = await result
    const count = await products.estimatedDocumentCount()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        data: result,
        count
      }
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '登入失敗'
    })
  }
}

export const get = async (req, res) => {
  try {
    // const result = await products.findById(req.params.id).populate('user', 'avatar name')
    const query = { sell: true }
    if (req.query.category) {
      query.category = req.query.category
    }
    const result = await products
      .find(query).populate('user', 'avatar name')
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

export const getProductId = async (req, res) => {
  try {
    const result = await products.findById(req.params.id).populate('user', 'avatar name')
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '登入失敗'
      })
    }
  }
}

export const getRandomProduct = async (req, res) => {
  try {
    const result = await products.aggregate([
      { $match: { sell: true } },
      { $sample: { size: 4 } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                avatar: 1
              }
            }
          ]
        }
      },
      { $unwind: { path: '$user' } }])
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '登入失敗'
      })
    }
  }
}

export const edit = async (req, res) => {
  try {
    const result = await products.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      price: req.body.price,
      image: req.file?.path,
      description: req.body.description,
      category: req.body.category,
      sell: req.body.sell
    }, { new: true, runValidators: true })
    if (!result) {
      throw new Error('NOT FOUND')
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: getMessageFromValidationError(error)
      })
    } else if (error.name === 'CastError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '格式錯誤'
      })
    } else if (error.message === 'NOT FONUD') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '發生錯誤'
      })
    }
  }
}
