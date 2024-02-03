const Challenge = require("../models/Challenge");
const User = require("../models/User");
const Todo = require("../models/todo");
const schedule = require('node-schedule');
const moment = require('moment');
const cron = require('node-cron');
const ChallengeTask = require("../models/ChallengeTask");


const createTask = async (taskObj, challengeId) => {
    // console.log("Create Challenge Called 6.2");
    // console.log(taskObj, challengeId)

    const challenge = await Challenge.findById(challengeId);

    try {
        // Create an object with task properties
        const taskData = {
            name: taskObj.name,
            description: taskObj.description,
            priority: taskObj.priority,
            completed: taskObj.completed,
            status: taskObj.status,
            createdAt: taskObj.createdAt,
            expiresAt: new Date(Date.now() + 60 * 1000),
        };

        const newTodo = new ChallengeTask(taskData);

        if (!challenge) {
            return "User Not Found";
        }

        const savedTodo = await newTodo.save();
        const updatedChallengeTask = await Challenge.findByIdAndUpdate(
            { _id: challengeId },
            {
                $push: {
                    challengeTasks: savedTodo._id,
                }
            },
            { new: true }
        ).populate("challengeTasks").populate("task").exec();
        updatedChallengeTask.save();

        return updatedChallengeTask;
    } catch (error) {
        // console.log("Create TODO ", error);
        throw error; // Rethrow the error to propagate it up
    }
}


// Function to create daily tasks for the user
const createDailyTasks = async (userId, challengeId) => {
    try {
        // console.log("Create Challenge Called");
        let user = await User.findById(userId);
        // console.log("Create Challenge Called 2");
        const challenge = await Challenge.findById(challengeId).populate('task');

        // console.log("challenge the create daily with task", challenge.remainingDays);

        if (challenge.remainingDays > 0) {
            // console.log("Create Challenge Called 4");
            for (let i = 0; i < challenge.task.length; i++) {
                // console.log("Create Challenge Called 6");
                // console.log("challenge task's", challenge.task[i]);
                // Pass user directly to createTask
                // user =
                //update the challenge add daily task in the challenge task array
                await createTask(challenge.task[i], challengeId);
            }

            // console.log("Create Challenge Called 8");
            challenge.remainingDays--;
            await challenge.save();
            // console.log("User After dayssssss created Daily Task",challenge.remainingDays);

            return user;
        }

        else{
            return "Challenge Expires"
        }


    } catch (error) {
        // console.error("Error in createDailyTasks:", error);
        throw error; // Rethrow the error to propagate it up
    }
};


// Function to mark tasks as expired
// const markTasksAsExpired = async () => {
//     // Your logic to mark tasks as expired goes here
//     // ...
//     // console.log("Your logic to mark tasks as expired goes here")

//     // Example: Find tasks that are older than 24 hours and mark them as expired
//     const twentyFourHoursAgo = moment().subtract(24, 'hours');
//     const expiredTasks = await Todo.find({
//         createdAt: { $lt: twentyFourHoursAgo },
//         status: 'active', // Assuming you have a status field for tasks
//     });

//     // Mark tasks as expired
//     await Promise.all(
//         expiredTasks.map(async (task) => {
//             task.status = 'expired'; // Update the status to expired
//             await task.save();
//         })
//     );
// };

// Schedule task creation for each user daily at midnight
cron.schedule('* * * * *', async () => {
    // console.log("Scheduled task creation for each user daily at midnight");
    try {
        // Fetch challenges with status 'Start'
        const challenges = await Challenge.find({ status: 'Start' });

        for (const challenge of challenges) {
            // console.log(`Creating tasks for challenge ${challenge._id} (${challenge.name})`);

            // Create daily tasks for the challenge
            await createDailyTasks(challenge.userId, challenge._id);

            // console.log("Task creation for challenge daily completed");
        }

    } catch (error) {
        // console.error("Error in task creation:", error);
    }
});

// Schedule task expiry check every minute for testing purposes
// schedule.scheduleJob('* * * * *', async () => {
//     await markTasksAsExpired();
// });


exports.CreateChallenge = async (req, res) => {
    try {
        // destructure the body and find the user
        const { name, description, days, status } = req.body;
        // console.log(name, description, days, status)
        // console.log(req.body);
        const userId = req.user.id;

        //user
        const user = await User.findById(userId);

        //make the challenge
        const challenge = new Challenge({
            name,
            description,
            days,
            status,
            userId,
            remainingDays: days
        });

        if (!user) {
            return res.status(402).json({
                success: false,
                message: "User Not Find"
            })
        }
        //save the challenge and update the User
        const savedChallenge = await challenge.save();
        const updatedUser = await User.findByIdAndUpdate(
            { _id: user._id },
            {
                $push: {
                    challenge: savedChallenge._id,
                }
            },
            { new: true }
        )
        updatedUser.save();

        res.status(201).json({
            success: true,
            message: "Challenge Created",
            savedChallenge,
            updatedUser
        });

    } catch (error) {
        // console.log("Create Challenege ", error);
        res.status(400).json({ message: error.message });
    }
}
exports.challengeTask = async (req, res) => {
    try {
        const { name, description, priority, challengeId } = req.body;
        const { email, id } = req.user;
        //   // console.log(req.user.id);

        const user = await User.findById(id);

        try {
            const newTodo = new Todo({
                name,
                description,
                priority,
                // alertMode,
                // dueHours,
            });

            if (!user) {
                return res.status(402).json({
                    success: false,
                    message: "User Not Find"
                })
            }

            const savetaskdTodo = await newTodo.save();

            //update the challenge 
            const challenge = await Challenge.findByIdAndUpdate(
                challengeId,
                {
                    $push: {
                        task: savetaskdTodo._id,
                    },
                },
                { new: true }
            )
                .populate("task")
                .exec()
            // console.log("Challlenege = ", challenge)

            // updatedUser.save();

            res.status(201).json({
                success: true,
                message: "Task Created",
                savetaskdTodo,
                challenge
            });
        } catch (error) {
            // console.log("Create Task challenge TODO ", error);
            res.status(400).json({ message: error.message });
        }
    } catch (error) {
        // console.log("Create Task challenge TODO 1212 ", error);
        res.status(400).json({ message: error.message });
    }
}

exports.startChallenge = async (req, res) => {
    try {
        // console.log(req.body)
        const { challengeId } = req.body;
        const id = req.user.id;

        // Check for challenge
        const challenge = await Challenge.findById(challengeId);

        if (!challenge) {
            return res.status(402).json({
                success: false,
                message: "Challenge Not Found",
            });
        }

        // Update challenge status to "Start"
        challenge.status = "Start";
        challenge.totalTask = challenge.days * challenge.task.length;
        await challenge.save(); // Save the updated challenge

        // Create daily tasks for the user immediately when the challenge starts
        // const user = await User.findById(id);
        const result = await createDailyTasks(id, challenge._id);
        // console.log("Result of the daily task add and here is the updated user is =========",result);

        return res.status(200).json({
            success: true,
            message: "Challenge Started",
            data: result, // Optionally, you can send the updated challenge in the response
        });


    } catch (error) {
        // console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

exports.uerChallenge = async (req, res) => {
    try {
        const { challengeId } = req.body;
        const userId = req.user.id;

        const userChallenge = await User.findById(userId).populate({
            path: 'challenge',
            populate: {
                path: 'task',// name same as the challeneg give in model
                model: 'Todo', // Replace with the actual model name for Todo
            }
        });

        if (!userChallenge) {
            return res.status(400).json({
                success: true,
                message: "No User Found"
            })
        }

        //find all the challenge of the user's
        const challenge = userChallenge.challenge;

        if (userChallenge.length === 0) {
            return res.status(401).json({
                success: false,
                message: "No Challenge Found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Challenge Found ",
            data: challenge
        })
    } catch (error) {
        // console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
exports.challengeDetails = async (req, res) => {
    try {
        // console.log(req.body)
        const { challengeId } = req.body;
        console.log("CHALLENGE ID",challengeId);

        const challeneg = await Challenge.findById(challengeId).populate('task');

        // console.log("CHallenge Details =", challeneg);
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
        // console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.challengeDetails = async (req, res) => {
    try {
        // console.log(req.body)
        const { challengeId } = req.body;
        const id = req.user.id;
        // console.log(challengeId);

        const challeneg = await Challenge.findById(challengeId).populate('task').populate('challengeTasks');
        const user = await User.findById(id).populate('challenge');

        console.log("CHallenge Details callled from the challenge api this is challenge of give challnege id this is user of updated challnege task array  =", user, challeneg);
        if (!challeneg.task.length) {
            return res.status(401).json({
                success: false,
                message: "No Challenge Task Found for the Daily Task"
            })
        }

        return res.status(200).json({
            success: true,
            challenge: challeneg,
            uerdailyTask: challeneg.challengeTasks,
        })
    } catch (error) {
        // console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

exports.deleteChallenge = async (req, res) => {
    try {
        const { challengeId } = req.body;
        // console.log(challengeId);
        const userId = req.user.id;

        const challenge = await Challenge.findByIdAndDelete(challengeId);

        if (!challenge) {
            return res.status(400).json({
                success: false,
                message: "No Challenge Found"
            })
        }

        //update user
        const userChallenge = await User.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    "challenge": challengeId
                }
            }
        ).populate({
            path: 'challenge',
            populate: {
                path: 'task', // name same as the challenge given in model
                model: 'Todo', // Replace with the actual model name for Todo
            }
        }).exec();


        return res.json({
            success: true,
            message: "Update User challenge",
            data: userChallenge
        })
    } catch (error) {
        // console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.completedChallengeTask = async(req,res)=>{
    try {
        const {challengeTaskId , challengeId} = req.body;
        const challengeTask = await ChallengeTask.findById(challengeTaskId);

        if(!challengeTask){
            return res.status(400).json({
                success: false,
                message: "No Tasks Found"
            })
        }

        //upadet the complted
        challengeTask.completed = true
        challengeTask.save();

        //upadte the complted task properyt in challenge
        const challenge = await Challenge.findById(challengeId).populate("challengeTasks");

        if(!challenge){
            return res.status(400).json({
                success: false,
                message: "No Challenge Found"
            })
        }

        challenge.completedTask ++;
        challenge.progress = (challenge.completedTask / challenge.totalTask) * 100
        challenge.save();

        return res.status(200).json({
            success: true,
            message:"Challenge Task update",
            data: challenge
        })

    } catch (error) {
        // console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}