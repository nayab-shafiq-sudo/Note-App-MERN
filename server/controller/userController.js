import userModel from "../models/userModel.js";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import { verifyMail } from "../emailVerify/verifyMail.js";
import sessionModel from "../models/sessionModel.js";
import "dotenv/config"
import { sendOtpMail } from "../emailVerify/sendOtpMail.js";

export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password){
            return res.status(400).json({
                success: false,
                message: "All field are required"
            })
        }
        const existingUser = await userModel.findOne({email})
        if (existingUser){
            return res.status(400).json({
                success: false,
                message: "User already exists."
            })
        }
        //  hassing passsword
        const hashPasswordy = await bcrypt.hash(password, 10)
        //  CREATING USER
        const user = await userModel.create({username, email, password:hashPasswordy})
        //  CREATING TOKEN
        const token = await jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "10m"})
        //  SENDING VERIFICATION MAIL
        verifyMail(token, email) 
        user.token = token
        await user.save()

        return res.status(201).json({
            success: true,
            message: "User created succesfully",
            data: user
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const verification = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                success: false,
                message: "Authorization token is missing"
            })
        }
        const token = authHeader.split(" ")[1]

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (error) {
            if (error.name === "TokenExpiredError"){
                return res.status(400).json({
                    success: false,
                    message: "The registration token is expired"
                })
            }
            return res.status(400).json({
                success: false,
                message: "Token verification failed"
            })
        }

        const user = await userModel.findById(decoded.id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        user.token = null
        user.isVerified = true
        await user.save()

        return res.status(200).json({
            success: true,
            message: "Email verified succesfully"
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const user = await userModel.findOne({email})
        if (!user){
            return res.status(401).json({
                success: false,
                message: "user not found"
            })
        }

        const veriftPassowrd = await bcrypt.compare(password, user.password)
        if (!veriftPassowrd){
            return res.status(402).json({
                success: false,
                message: "Incorrect password"
            })
        }
        //  CHECK IF USER IS VERIFIED
        if (user.isVerified !== true){
            return res.status(403).json({
                success: false,
                message: "verify your account befour login"
            })
        }
        //  CHECK FOR EXISTING SESSION 
        const existingSession = await sessionModel.findOne({userId: user._id})
        if (existingSession){
            await sessionModel.deleteOne({userId: user._id})
        }
        //  CREATE A NEW SESSION
        await sessionModel.create({userId: user._id})

        //GENRATE TOKEN
        const accessToken = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn: "10m"})
        const refreshToken = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '10d'})

        user.isLoggedIn = true;
        await user.save()

        return res.status(200).json({
            success: true,
            message: `Welcome back ${user.username}`,
            accessToken,
            refreshToken,
            user
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const logout = async (req, res) => {
    try {
        const userId = req.userId;
        await sessionModel.deleteMany({userId})
        await userModel.findByIdAndUpdate(userId, {isLoggedIn: false})

        return res.status(200).json({
            success: true,
            message: "Logged out succesfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await userModel.findOne({email})
        if (!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const otp = Math.floor(100000 + Math.random()*900000).toString()
        const expiry = new Date(Date.now() + 10 * 60 * 1000)

        user.otp = otp
        user.otpExpiry = expiry
        await user.save()
        await sendOtpMail(email, otp)
        return res.status(200).json({
            success: true,
            message: "OTP send succesfully."
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const verifyOtp = async (req, res) => {
    const {otp} = req.body;
    const email = req.params.email

    if (!otp){
        return res.status(400).json({
            success: false,
            message: "OTP is required"
        })
    }

    try {
        const user = await userModel.findOne({email})
        if (!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        if (!user.otp || !user.otpExpiry){
            return res.status(400).json({
                success: false,
                message: "OTP not genrated or already verified."
            })
        }
        if (user.otpExpiry < new Date()){
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one."
            })
        }
        if (otp !== user.otp){
            return res.status(400).json({
                success: false,
                message: "Inavalid OTP"
            })
        }

        user.otp = null
        user.otpExpiry = null
        await user.save()

        res.status(200).json({           
            success: true,
            message: "OTP verified successfully."
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const changePassword = async (req, res) => {
    
    const {newPassword, confirmPassword} = req.body;
    const email = req.params.email;

    if (!newPassword || !changePassword){
        return res.status(400).json({
            success: false,
            message: "All fields required"
        })
    }
    if (newPassword !== confirmPassword){
        return res.status(400).json({
            success: false,
            message: "Password does not match"
        })
    }

    try {
        const user = await userModel.findOne({email})
        if (!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })   
        }

        const hashPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
    
}