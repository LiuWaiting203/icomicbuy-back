import express from 'express'
import contentType from '../middlewares/contentType.js'
import upload from '../middlewares/upload.js'
import { create, login, logout, extend, getProfile, editUser, getCart, getLikes, editCart, editLikes } from '../controllers/users.js'
import * as auth from '../middlewares/auth.js'

const router = express.Router()

router.post('/', contentType('application/json'), create)
router.post('/login', contentType('application/json'), auth.login, login)
router.delete('/logout', auth.jwt, logout)
router.patch('/edit', auth.jwt, contentType('multipart/form-data'), upload, editUser)
router.patch('/extend', auth.jwt, extend)
router.patch('/likes/:pid', auth.jwt, editLikes)
router.get('/me', auth.jwt, getProfile)
router.get('/cart', auth.jwt, getCart)
router.get('/likes', auth.jwt, getLikes)
router.post('/cart', auth.jwt, contentType('application/json'), auth.jwt, editCart)

export default router
