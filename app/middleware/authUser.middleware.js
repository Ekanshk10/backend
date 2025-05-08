import jwt from "jsonwebtoken"
import prisma from "../DB/db.config.js";

export const authUser = async(req, res, next)=>{
    
    try {
        const token = req.cookies.jwt;

        if(!token) return res.status(401).json({
            success:false,
            message:"Please Login to access this page"
        })
    
        const checkValidToken = jwt.verify(token, process.env.JWT_SECRET);
    
        if(!checkValidToken) return res.status(401).json({
            success:false,
            message:"Unauthorized",
        })
    
        const user = await prisma.user.findUnique({
            where:{
                email:checkValidToken.email,
            }
        })
    
        if(!user) return res.status(404).json({
            success:false,
            message:"User Not found",
        })
    
        req.user = user;
        
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error: error.message,
        })
    }
}
