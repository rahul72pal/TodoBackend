const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // You might want to add more validation for email format
    },
    password: {
        type: String,
        required: true
    },
    accountType: {
        type: String,
        enum: ["Admin", "User"],
        required: true,
    },
    tasks:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Todo"
    }],
    token:{
        type: String
    },
    image:{
        type: String
    },
    completedTask:{
        type: Number,
        default: 0,
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
