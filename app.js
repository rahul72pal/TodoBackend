const express = require('express');
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
const todoRoutes = require('./routes/todo');
const challenge = require('./routes/challenge')
const cookieParser = require("cookie-parser");
const cors = require('cors');
const Challenge = require('./models/Challenge');
const User = require('./models/User');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

console.log(process.env.PORT)
// Middleware
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded({
//     extended: true
// }));

// app.use(bodyParser.json());
app.use(cookieParser());

const corsOptions = {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200
};

// console.log(process.env.MONGODB_URL)
mongoose.connect(process.env.MONGODB_URL, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
});

app.use(cors(corsOptions));
// Use routes 
app.use('/api/v1/todos', todoRoutes);
app.use('/api/v1/challenge', challenge);
// app.post('/api/v1/challenge/deleteChallen', async (req, res) => {
//     try {
//         const { challengeId } = req.body;
//         console.log(challengeId);
//         const userId = req.user.id;

//         const challenge = await Challenge.findByIdAndDelete(challengeId);

//         if (!challenge) {
//             return res.status(400).json({
//                 success: false,
//                 message: "No Challenge Found"
//             })
//         }

//         //update user
//         const userChallenge = await User.findByIdAndUpdate(
//             userId,
//             {
//                 $pull: {
//                     "challenge": challengeId
//                 }
//             }
//         ).populate({
//             path: 'challenge',
//             populate: {
//                 path: 'task', // name same as the challenge given in model
//                 model: 'Todo', // Replace with the actual model name for Todo
//             }
//         }).exec();


//         return res.json({
//             success: true,
//             message: "Update User challenge",
//             data: userChallenge
//         })
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// });
app.post('/api/v1/challenge/challengeDeta', async (req, res) => {
    try {
        console.log(req.body)
        const { challengeId } = req.body;
        console.log(challengeId);

        const challeneg = await Challenge.findById(challengeId).populate('task');

        console.log("CHallenge Details =", challeneg);
        if (!challeneg) {
            return res.status(401).json({
                success: true,
                message: "No Challenge Found"
            })
        }

        return res.status(200).json({
            success: true,
            data: challeneg,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

// Start server
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Welcome to Node js backend is running.......",
    })
})

//for schedule task corntab guru

app.listen(PORT, () => {
    console.log(`app is running at ${PORT}`)
})
