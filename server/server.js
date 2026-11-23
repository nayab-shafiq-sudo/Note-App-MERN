import express from "express"
import "dotenv/config"
import connectDb from "./config/dbConnect.js"
import userRouter from "./routes/userRoutes.js"
import cors from 'cors'

const app = express()

// DATABASE (listen ke bahar, taake Vercel par bhi connect ho)
connectDb()

// MIDDLEWARE
app.use(cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"].filter(Boolean),
    credentials: true
}))
app.use(express.json())

// HEALTH CHECK (browser mein backend link kholne par "Cannot GET /" na aaye)
app.get('/', (req, res) => {
    res.json({ success: true, message: "API is running" })
})

app.use('/user', userRouter)

// LOCAL par server chalao, Vercel par nahi
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`server is listening at port ${PORT}`)
    })
}

export default app