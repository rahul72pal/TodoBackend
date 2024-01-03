const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todo');
const {sendOtp, singUp, login} = require('../controllers/Auth')

//middlewares 
const {auth,isUser,isAdmin} = require("../middlewares/Auth")

// Define routes
router.get('/alltodos',auth,isUser, todoController.getAllTodos);
router.post('/createtodo',auth,isUser, todoController.createTodo);
router.get('/yesterday',auth,isUser, todoController.getYesterdayTasks);
router.get('/previous',auth,isUser, todoController.getPreviousTasks);
router.post('/completed',auth,isUser, todoController.completeTask);
router.post('/updateTask',auth,isUser, todoController.updateTask);
router.post('/sendotp', sendOtp);
router.post('/singup', singUp);
router.post('/login', login);
router.delete('/delete',auth,isUser, todoController.deleteTask);

module.exports = router;
