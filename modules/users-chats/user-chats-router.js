const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware")

const {sendMessage,getConversationHistory, markAsSeen, deleteMessage, getReceiversWithProfileImages} = require("./users-chats-controllers");





router.post('/send',authMiddleware, sendMessage );
router.get('/history/:senderId/:receiverId',authMiddleware,getConversationHistory);
router.put('/markAsSeen', authMiddleware, markAsSeen);
router.delete('/delete/message/:id',authMiddleware, deleteMessage);
router.get('/receivers/:userId',authMiddleware, getReceiversWithProfileImages);




module.exports = router;