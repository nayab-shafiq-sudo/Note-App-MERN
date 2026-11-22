import express from "express"
import "dotenv/config"
import connectDb from "./config/dbConnect.js"
import userRouter from "./routes/userRoutes.js"
import cors from 'cors'

const app = express()

// MIDDLEWARE

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use('/user', userRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    connectDb() 
    console.log(`server is listening at port ${PORT}`)
})