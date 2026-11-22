import { Router } from "express";
import { changePassword, forgotPassword, login, logout, registerUser, verification, verifyOtp } from "../controller/userController.js";
import { isAuthentaced } from "../middleware/isAuthentaced.js";
import { userSchema, validateUser } from "../validator/userValidate.js";


const userRouter = Router()


userRouter.post('/register', validateUser(userSchema), registerUser)
userRouter.post('/verify', verification)
userRouter.post('/login', login)
userRouter.post('/logout', isAuthentaced, logout)
userRouter.post('/forgot-password', forgotPassword)
userRouter.post('/verify-otp/:email', verifyOtp)
userRouter.post('/change-password/:email', changePassword)



export default userRouter;