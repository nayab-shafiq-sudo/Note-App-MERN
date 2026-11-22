import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js";

export const isAuthentaced = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer")){
            return res.status(401).json({
                success: false,
                message: "Access token is missing or invalid"
            })
        }

        const token = authHeader.split(" ")[1]

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if(err){
                if (err.name === "TokenExpiredError"){
                    return res.status(400).json({
                        success: false,
                        message: "Access token has beem expired"
                    })
                }
                return res.status(400).jspn({
                    success: false,
                    message: "Assess token is missing"
                })
            }

            const {id} = decoded;

            const user = await userModel.findById(id) 
            if (!user){
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                })
            }

            req.userId = user._id
            next()

        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}