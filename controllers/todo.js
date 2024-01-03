const Todo = require('../models/todo');
const { mailSender } = require('../utils/mailSender');
const cron = require('node-cron');
const { PenddingTask } = require("../mail/templates/PenddingTask")
const { RegisterTask } = require("../mail/templates/RegisterTask")
const User = require("../models/User")


exports.getAllTodos = async (req, res) => {
  try {
    const { id } = req.user;

    // Get the current date
    const today = new Date();
    // Set the time to the start of the day (midnight)
    today.setHours(0, 0, 0, 0);

    const userTodos = await User.findById(id)
      .populate({
        path: "tasks",
        match: { createdAt: { $gte: today } },
        options: { sort: { createdAt: -1 } }, // Sort tasks by createdAt in descending order
      })
      .exec();

    if (userTodos.tasks.length === 0) {
      return res.status(200).json({
        message: "No Today Task Found",
      });
    }

    // const task = await Todo.find();
    console.log("TASK 1", userTodos.completedTask)
    console.log("TASK 2", userTodos.tasks.length)
    const completePercent = (userTodos.completedTask / userTodos.tasks.length) * 100;

    return res.status(200).json({
      success: true,
      message: "User Tasks found",
      data: userTodos.tasks,
      completed: completePercent,
      taskCompleted: userTodos.completedTask
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.createTodo = async (req, res) => {
  console.log(req.body);
  const { name, description, priority, alertMode, dueHours } = req.body;
  console.log(name, description, priority, alertMode, dueHours);
  const { email, id } = req.user;
  console.log(req.user.id);

  const user = await User.findById(id);

  try {
    const newTodo = new Todo({
      name,
      description,
      priority,
      alertMode,
      dueHours,
    });

    if (!user) {
      return res.status(402).json({
        success: false,
        message: "User Not Find"
      })
    }

    const savedTodo = await newTodo.save();
    const updatedUser = await User.findByIdAndUpdate(
      { _id: user._id },
      {
        $push: {
          tasks: savedTodo._id,
        }
      },
      { new: true }
    )
    updatedUser.save();

    const mailsend = await mailSender(email, "Your Task Is Register", RegisterTask(`${updatedUser.firstName} ${updatedUser.lastName}`, name, description, dueHours));
    console.log("First Mail Response = ",mailsend);

    // Schedule an email 1 hour before the task end date
    const taskDate = new Date();
    // const taskHours = taskDate.getHours();
    // const currentHours = new Date().getHours();
    // console.log("Current and Task Hours =", taskDate);
    // let cronExpression = '';
    // console.log("More than the Current Date 1st",taskDate,new Date());
    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();

    // prints date in YYYY-MM-DD format
    // console.log(year + "-" + month + "-" + date);

    // prints date & time in YYYY-MM-DD HH:MM:SS format
    // console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);

    // prints time in HH:MM format
    // console.log(hours + ":" + minutes);
    if (dueHours && alertMode) {
      // let hourssend ;
      // console.log(dueHours);
      if (dueHours === "1") {
        minutes = parseInt(minutes) + 3;
      }
      // console.log("More than the Current Date 2nd",taskDate,new Date());
      // taskDate.setHours(taskDate.getHours() - 1 + dueHours);
      // console.log("Current and Task Hours =", parseInt(minutes),parseInt(hours) - 1 + parseInt(dueHours));
      // const cronExpression = `${taskDate.getMinutes()} ${taskDate.getHours()} ${taskDate.getDate()} ${taskDate.getMonth() + 1} *`;
      const cronExpression = `${parseInt(minutes)} ${parseInt(hours) - 1 + parseInt(dueHours)} ${date} ${month} *`;

      console.log(cronExpression);
      try {
        const emailsend = cron.schedule(cronExpression, () => {
          mailSender(email, "Your Task Is  Pending", PenddingTask(`${updatedUser.firstName} ${updatedUser.lastName}`, name, description, dueHours));
        });
        console.log(emailsend);

      } catch (error) {
        console.log("Schedular Eroror = ", error.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Task Created",
      savedTodo,
      updatedUser
    });
  } catch (error) {
    console.log("Create TODO ", error);
    res.status(400).json({ message: error.message });
  }
};

exports.getYesterdayTasks = async (req, res) => {
  try {
    const { id } = req.user;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayTasks = await User.findById(id)
      .populate({
        path: "tasks",
        match: { createdAt: { $gte: yesterday, $lt: new Date() } },
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "Yesterday's tasks found",
      data: yesterdayTasks.tasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
}

exports.getPreviousTasks = async (req, res) => {
  const { id } = req.user;

  // Get the current date
  const today = new Date();
  // Set the time to the start of the day (midnight)
  today.setHours(0, 0, 0, 0);

  try {
    const previousTasks = await User.findById(id)
      .populate({
        path: "tasks",
        match: { createdAt: { $lt: today } },
      })
      .exec();

    console.log("Previous Task", previousTasks.tasks);

    return res.status(200).json({
      success: true,
      message: "Previous tasks found",
      data: previousTasks.tasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }

}

exports.completeTask = async (req, res) => {
  try {
    // console.log(req);
    const { id } = req.user.id
    const { taskId } = req.body;
    console.log(taskId);

    // Assuming User model has a 'tasks' field that references Task model
    const user = await User.findOne({ 'tasks': taskId })
      .populate("tasks");

    console.log("User Task ", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or Task not associated with the user",
      });
    }

    // Find the task within the user's tasks
    const task = user.tasks.find(task => task._id.toString() === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Set the task as completed (modify based on your Task model structure)
    const task1212 = await Todo.findByIdAndUpdate(
      { _id: taskId },
      {
        completed: true,
      },
      { new: true }
    );
    // const userupdate = await User.findById(id)
    // console.log(userupdate);
    user.completedTask += 1;
    // userupdate.save();
    console.log("!@#$%=", user);
    task.completed = true;
    await user.save();
    console.log("TASK IS HERE = ", task1212);

    return res.status(200).json({
      success: true,
      message: "Task completed successfully",
      data: task,
      task: task1212,
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    const userId = req.user.id; // Assuming you have user information in the request

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const task = await Todo.findById(taskId);

    if (task.completed) {
      // Update the tasks array by removing the specified task
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { tasks: taskId }, $inc: { completedTask: -1 } }, // Remove taskId from the tasks array and decrement completedTask
        { new: true } // Return the updated user
      );
      // Log the updated user for debugging
      console.log('User after deleting task:', updatedUser);
    }
    else {
      // Update the tasks array by removing the specified task
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { tasks: taskId } }, // Remove taskId from the tasks array 
        { new: true } // Return the updated user
      );
      // Log the updated user for debugging
      console.log('User after deleting task:', updatedUser);
    }

    // Delete the task
    await Todo.findByIdAndDelete(taskId);



    return res.status(200).json({
      success: true,
      message: 'Task deleted and user updated successfully',
      // data: updatedUser, 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { name, description,
      priority, alertMode, dueHours
      , taskId, completed } = req.body;
      console.log(req.body);

      // if(!name || !description ||)

    const task = await Todo.findById(taskId);

    if(!task){
      return res.json({
        message: "Task NoT found"
      })
    }

    // if(completed){
    //   return res.json({
    //     success: true,
    //     message: "You Have Complete Task"
    //   })
    // }

    //update
    task.name = name,
    task.description = description,
    task.priority = priority,
    task.dueHours = dueHours,
    task.alertMode = alertMode

    //save the task
    task.save();

    return res.status(200).json({
      success: true,
      message:"Task Update",
      data: task
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Task Updated error"
    })
  }
}

/*const getYesterdayTasks = async (req, res) => {
  
};

const getPreviousTasks = async (req, res) => {
  
};

const getAllTodos = async (req, res) => {
 
};

module.exports = {
  getYesterdayTasks,
  getPreviousTasks,
  getAllTodos,
};
 */
