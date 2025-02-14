import mongoose from 'mongoose'

const MONGO_URI = process.env.VITE_MONGODB_URI || 'mongodb://localhost:27017/nuxt_app'

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  await mongoose.connect(MONGO_URI)

  return mongoose.connection
}
