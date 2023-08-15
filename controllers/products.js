import { StatusCodes } from 'http-status-codes'
import products from '../models/products.js'
import { getMessageFromValidationError } from '../utils/error.js'
import mongoose from 'mongoose'

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
    const query = [
      { $match: { sell: true } },
      {
        $lookup: {
          from: 'users',
          let: { productId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$productId', '$likes']
                }
              }
            },
            { $count: 'count' }
          ],
          as: 'likes'
        }
      },
      {
        $unwind: {
          path: '$likes',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          'user.name': 1,
          'user.avatar': 1,
          name: 1,
          price: 1,
          image: 1,
          description: 1,
          category: 1,
          sell: 1,
          likes: '$likes.count'
        }
      }
    ]
    if (req.query.category) {
      query[0].$match.category = req.query.category
    }
    const result = await products.aggregate(query)
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: req.user
        ? result.map(product => {
          product.liked = req.user.likes.includes(product._id)
          return product
        })
        : result
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}

export const getProductId = async (req, res) => {
  try {
    const oid = new mongoose.Types.ObjectId(req.params.id)
    const result = await products.aggregate([
      {
        $match: {
          sell: true,
          _id: oid
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { productId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$productId', '$likes']
                }
              }
            },
            { $count: 'count' }
          ],
          as: 'likes'
        }
      },
      {
        $unwind: {
          path: '$likes',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          'user.name': 1,
          'user.avatar': 1,
          name: 1,
          price: 1,
          image: 1,
          description: 1,
          category: 1,
          sell: 1,
          likes: '$likes.count'
        }
      }
    ])
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: req.user ? { ...result[0], liked: req.user.likes.includes(oid) } : result[0]
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
          let: { productId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$productId', '$likes']
                }
              }
            },
            { $count: 'count' }
          ],
          as: 'likes'
        }
      },
      {
        $unwind: {
          path: '$likes',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          'user.name': 1,
          'user.avatar': 1,
          name: 1,
          price: 1,
          image: 1,
          description: 1,
          category: 1,
          sell: 1,
          likes: '$likes.count'
        }
      }
    ])
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: req.user ? result.map(product => ({ ...product, liked: req.user.likes.includes(product._id) })) : result

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
