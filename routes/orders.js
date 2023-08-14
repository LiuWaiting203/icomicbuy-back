import express from 'express'
import * as auth from '../middlewares/auth.js'
import admin from '../middlewares/admin.js'
import { create, get, getAll } from '../controllers/orders.js'

const router = express.Router()

router.post('/', auth.jwt, create)
router.get('/', auth.jwt, get)
router.get('/all', auth.jwt, admin, getAll)
// router.get('/user', auth.jwt, getUser)

export default router
