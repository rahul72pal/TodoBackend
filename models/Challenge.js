const mongoose  = require("mongoose");


const challengeSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true 
    },
    days:{
        type: Number,
        required: true,
    },
    totalTask:{
        type: Number,
    },
    task:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Todo"
    }],
    status:{
        type: String,
        enum: ["Draft","Start"]
    },
    userId:{
        type: String,
    },
    remainingDays:{
        type: Number,
    },
    completedTask:{
        type: Number,
        default: 0,
    },
    challengeTasks:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChallengeTask"
    }],
    progress:{
        type: Number
    }
})


const Challenge = mongoose.model("Challenge", challengeSchema);

module.exports = Challenge;