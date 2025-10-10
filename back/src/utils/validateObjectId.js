// back/src/utils/validateObjectId.js
import mongoose from 'mongoose'

/**
 * Valida que req.params[param] sea un ObjectId válido.
 * Si no lo es, responde 400 y corta la cadena de middlewares.
 */
export const validateObjectId = (param = 'id') => (req, res, next) => {
  const val = req.params?.[param]
  if (!mongoose.isValidObjectId(val)) {
    return res.status(400).json({ message: `Parámetro "${param}" inválido` })
  }
  next()
}
