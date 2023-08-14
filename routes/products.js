import express from 'express'
import * as auth from '../middlewares/auth.js'
import upload from '../middlewares/upload.js'
import contentType from '../middlewares/contentType.js'
import { create, getAll, getUserId, get, getProductId, edit, getRandomProduct } from '../controllers/products.js'

const router = express.Router()

router.post('/', auth.jwt, contentType('multipart/form-data'), upload, create)
router.get('/all', auth.jwt, getAll)
router.get('/user', auth.jwt, getUserId)
router.get('/random', getRandomProduct)
router.get('/:id', getProductId)
router.get('/', get)
router.patch('/:id', auth.jwt, contentType('multipart/form-data'), upload, edit)

export default router
