const mongoose = require("mongoose");
const {mailSender} = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp:{
        type: String,
        required: true,
    },
    createAt: {
        type: Date,
        default: Date.now,
        expires: 5*60// this otp will expire After 5 Minutes
    },
});

// function to send the otp thriught the email
async function emailVerificationotp(email,otp){
    try {
        const emailresponse = await mailSender(email,"OTP Verification" ,otp);
        console.log("Otp Schema Response of email = ",emailresponse);
    } catch (error) {
        console.log("error = ",error);
        throw error
    }
}

//pre middlewares in otp schema
otpSchema.pre("save",async function(next){
    await emailVerificationotp(this.email,this.otp);
    next();
})

module.exports = mongoose.model("OTP", otpSchema);