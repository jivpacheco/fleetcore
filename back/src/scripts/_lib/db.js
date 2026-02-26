import 'dotenv/config'
import mongoose from 'mongoose'

export async function connectDb() {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI
    if (!uri) throw new Error('Falta MONGO_URI (o MONGODB_URI) en .env')

    // Evita logs innecesarios; si quieres debug, setea MONGOOSE_DEBUG=true
    if (process.env.MONGOOSE_DEBUG === 'true') mongoose.set('debug', true)

    await mongoose.connect(uri)
    return mongoose.connection
}

export async function disconnectDb() {
    await mongoose.disconnect()
}