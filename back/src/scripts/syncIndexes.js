import { connectDb, disconnectDb } from './_lib/db.js'
import VmrsSystem from '../models/VmrsSystem.js'
import VmrsComponent from '../models/VmrsComponent.js'
import VmrsJob from '../models/VmrsJob.js'

async function main() {
    console.log('== sync:indexes ==')

    await connectDb()

    await VmrsSystem.syncIndexes()
    await VmrsComponent.syncIndexes()
    await VmrsJob.syncIndexes()

    console.log('Indexes synced ✅')

    await disconnectDb()
}

main().catch(async (err) => {
    console.error(err)
    await disconnectDb()
    process.exit(1)
})