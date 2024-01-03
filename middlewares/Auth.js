const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

module.exports.auth = async(req,res,next)=>{
    try {

        // console.log(req.header("Authorization"));
        const token = req.cookies.Token ||
        req.body.token || req.header("Authorization").replace("Bearer ", "");

        //token is missing
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Token is Missing"
            });
        }

        //verify the token
        try {
            const decode = await jwt.verify(token, process.env.JWT_SECRETE, { algorithm: 'HS256' });
            console.log("Verify the Decoder = ", decode);
            req.user = decode;
        } catch (error) {
            console.log("Error during verification:", error.message);
            return res.status(401).json({
                success: false,
                message: "Token Invalid in Verifying"
            });
        }
        
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: "Token Invalide in Authorization"
        })
    }
}

//middlewares for the User
module.exports.isUser = async(req,res,next)=>{
    try {
        if(req.user.accountType !== "User"){
            return res.status(401).json({
                success: false,
                message:"This is Protected Route for the User"
            })
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: "User Role Can not verify"
        })
    }
}

//middlewares for the Admin
module.exports.isAdmin = async(req,res,next)=>{
    try {
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success: false,
                message:"This is Protected Route for the Admin"
            })
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: "Admin Role Can not verify"
        })
    }
}
