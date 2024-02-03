const express = require('express');
const router = express.Router();
const {
    CreateChallenge,
    challengeTask,
    startChallenge,
    uerChallenge,
    challengeDetails,
    deleteChallenge,
    completedChallengeTask
} = require("../controllers/Challenge")

//middlewares 
const {auth,isUser} = require("../middlewares/Auth")

router.post('/createChallenge',auth,isUser, CreateChallenge);
router.post('/createChallenge-task',auth,isUser, challengeTask);
router.post('/createChallenge-task-start',auth,isUser, startChallenge);
router.get('/challenges',auth,isUser, uerChallenge);
router.post('/challengeDetails',auth,isUser, challengeDetails);
router.post('/deleteChallenge',auth,isUser, deleteChallenge);
router.post('/challengeTaskComplated',auth,isUser,completedChallengeTask)

module.exports = router;