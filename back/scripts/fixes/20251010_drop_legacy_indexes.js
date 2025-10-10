// back/scripts/fixes/20251010_drop_legacy_indexes.js
// Limpia índices legados en vehicles (code_1 y internalCode_1 “simple”)
// y sincroniza los índices del modelo actual.

import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

import Vehicle from '../../src/models/Vehicle.js'

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/fleetcore_dev'
  await mongoose.connect(uri)

  const col = mongoose.connection.db.collection('vehicles')

  const idx = await col.indexes()
  console.log('Índices actuales:', idx.map(i => i.name))

  const toDrop = ['code_1', 'internalCode_1'] // soltamos ambos si existen
  for (const name of toDrop) {
    try {
      await col.dropIndex(name)
      console.log(`✔ dropIndex(${name})`)
    } catch (e) {
      if (String(e).includes('index not found')) {
        console.log(`(i) ${name} no existe, ok`)
      } else {
        console.warn(`⚠ no se pudo dropear ${name}:`, e.message)
      }
    }
  }

  // Sincroniza lo que define el schema (crea el índice único parcial de internalCode)
  await Vehicle.syncIndexes()
  console.log('✔ Vehicle.syncIndexes() completado')

  await mongoose.disconnect()
  console.log('Listo ✅')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
