import jwt from "jsonwebtoken"

export const createToken = async (user, res)=>{

    const token = jwt.sign({email :user.email}, process.env.JWT_SECRET, {expiresIn: "1d"})

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: false,
        maxAge:24*60*60*1000,
        sameSite: "strict",
    })

    return token;
} 