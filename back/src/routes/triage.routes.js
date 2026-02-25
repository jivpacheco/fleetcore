import express from 'express'
import * as C from '../controllers/triage.controller.js'

const router = express.Router()

router.get('/', C.list)
router.get('/:id', C.get)
router.post('/', C.create)
router.put('/:id', C.update)
router.delete('/:id', C.remove)

export default router