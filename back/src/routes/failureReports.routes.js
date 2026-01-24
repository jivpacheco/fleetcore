// back/src/routes/failureReports.routes.js
import express from 'express'
import * as C from '../controllers/failureReports.controller.js'

const router = express.Router()

router.get('/', C.list)
router.get('/:id', C.get)
router.post('/', C.create)
router.patch('/:id', C.update)
router.delete('/:id', C.remove)

export default router
