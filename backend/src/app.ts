import express from 'express'
import emailRoutes from './routes/emailRoutes.js'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import mongoose from 'mongoose'

dotenv.config()


const app = express()
const PORT = process.env.PORT || 5000

app.use(cors());
app.use(express.json())

app.use('/api', emailRoutes)
app.use('/api/auth', authRoutes)

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.get('/', (req, res) => {
    res.send('IntentBox Backend is running')
})


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
