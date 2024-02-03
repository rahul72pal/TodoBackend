// const User = require("../models/User");
const OTP = require('../models/Otp');
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt');
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require('dotenv').config();


module.exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(401).json({
                success: false,
                message: "User Already Exist"
            })
        }
        // var otp = otpGenerator.generate(6,
        //     {
        //         upperCaseAlphabets: false,
        //         lowerCaseAlphabets: false,
        //         specialChars: false
        //     }
        // );


        //check unique Otp
        let isUniqueOtp = false;
        let otp;
        // Generate a unique OTP
        while (!isUniqueOtp) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });

            const existingOtp = await OTP.findOne({ otp });
            isUniqueOtp = !existingOtp;
        }

        console.log("Genrated Otp =", otp);

        const otpPayload = { email, otp };
        const otpbody = await OTP.create(otpPayload);
        await otpbody.save();

        console.log("OTP Body ", otpbody);

        return res.status(200).json({
            success: true,
            message: "OTP send Successfully",
            otp: otp
        })

    } catch (error) {
        console.log("error in otp send");
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "OTP NOT sent successfully",
            error: error.message
        })
    }
}

module.exports.singUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password,
            accountType, confirmPassword, otp } = req.body;

        //Validation
        if (!firstName || !lastName || !email || !password || !confirmPassword || !accountType) {
            return res.status(403).json({
                success: false,
                message: "All fields Are Required"
            })
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password Do Not Matched"
            })
        }

        const userExist = await User.findOne({ email: email });
        if (userExist) {
            return res.status(400).json({
                success: false,
                message: "User Already Exists"
            })
        }

        //find the most recent Otp for this email
        const recentOpt = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
        console.log("Most Recent Otp = ", recentOpt);

        if (recentOpt && recentOpt.length == 0) {
            return res.status(400).json({
                success: false,
                message: "OTP not Found"
            })
        } else if (otp !== recentOpt.otp) {
            return res.status(400).json({
                success: false,
                message: "InValide Otp"
            })
        }
        // hashed the password 
        const hashedpasswrod = await bcrypt.hash(password, 10);

        //entity created in DB
        const user = await User.create({
            firstName, lastName, email, password: hashedpasswrod, accountType,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        return res.status(200).json({
            success: true,
            message: "User Singin Successfully",
        })
    } catch (error) {
        console.log("error in otp send");
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "User NOT singin successfully",
            error: error.message
        })
    }
}

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body);

        //valiadation
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "Fields Are Required"
            })
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(402).json({
                success: false,
                message: "User Not Register Go ot SingUp"
            })
        }

        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRETE, {
                expiresIn: "5h",
            });
            user.token = token;
            user.password = undefined

            //create the cookie and give me response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }
            res.cookie("Token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "User Logged In SuccessFully"
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Password is Does not Machted"
            })
        }
    } catch (error) {
        console.log("error in otp send");
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "User NOT login successfully",
            error: error.message
        })
    }
}