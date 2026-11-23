import express from "express"
import "dotenv/config"
import connectDb from "./config/dbConnect.js"
import userRouter from "./routes/userRoutes.js"
import cors from 'cors'

const app = express()

// DATABASE (listen ke bahar, taake Vercel par bhi connect ho)
connectDb()

// MIDDLEWARE
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://note-app-mern-client.vercel.app",
    "http://localhost:5173",
]
    .filter(Boolean)
    .map((url) => url.replace(/\/$/, ""))   // aakhri "/" hata deta hai

app.use(cors({
    origin: (origin, callback) => {
        // Postman ya server-to-server requests mein origin nahi hota
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        return callback(new Error("Not allowed by CORS"))
    },
    credentials: true,
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