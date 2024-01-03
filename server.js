const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const todoRoutes = require('./routes/todo');
const cookieParser = require("cookie-parser");
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());

const corsOptions = {
    origin:"https://todo-frontend-new.vercel.app",
    credentials: true,
    optionSuccessStatus: 200
};

// Connect to MongoDB
// mongoose.connect('mongodb+srv://rahulgwl72:iwPQAnEhyvU550Es@cluster0.nyhnbge.mongodb.net/MytodoApp', {
//     //   useNewUrlParser: true,
//     //   useUnifiedTopology: true,
// });
mongoose.connect('mongodb+srv://rahulgwl72:iwPQAnEhyvU550Es@cluster0.nyhnbge.mongodb.net/MytodoApp', {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
});

app.use(cors(corsOptions));
// Use routes 
app.use('/api/v1/todos', todoRoutes);

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
