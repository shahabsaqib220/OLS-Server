const crypto = require('crypto');
const Message = require('../users-chats/user-chat-message-model');
const User = require('../user-registration/user-registration-model');
const connectDB = require('../../db');
require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io')
const server = http.createServer();
const io = socketIo(server);







// Encryption setup
const secretKeyHex = process.env.SECRET_KEY;
const secretKey = Buffer.from(secretKeyHex, 'hex');
const algorithm = 'aes-256-cbc';


// Encrypt message
function encryptMessage(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

// Decrypt message
function decryptMessage(encryptedText) {
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    const ivBuffer = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, secretKey, ivBuffer);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Decryption failed]';
  }
}

connectDB();



// Controller: Send a message
const sendMessage = async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  
  console.log("Secret key:", secretKeyHex.length);


  if (!senderId || !receiverId || !message) {
      return res.status(400).json({ error: 'senderId, receiverId, and message are required' });
  }

  try {
      // Encrypt the message before saving
      const encryptedMessage = encryptMessage(message);
      const newMessage = new Message({
          senderId,
          receiverId,
          message: encryptedMessage,
          seen: false,
      });

      // Save the message to the database
      const savedMessage = await newMessage.save();

      // Decrypt the message for emitting to the receiver
      const messageToEmit = {
          ...savedMessage.toObject(),
          message: decryptMessage(savedMessage.message), // Decrypt for the receiver
      };

      // Emit the message to the receiver's room
      if (req.io) {
          req.io.to(receiverId).emit('receiveMessage', messageToEmit);
          console.log(`Message emitted to ${receiverId}`);
      } else {
          console.error("Socket.io instance not found on req object");
      }

      // Respond with the saved message
      res.status(201).json(messageToEmit); // Send the emitted message back as the response
  } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: 'Failed to send message' });
  }
};



// Controller: Get chat history
const getConversationHistory = async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ timestamp: 1 });

    const decryptedMessages = messages.map((msg) => ({
      ...msg.toObject(),
      message: decryptMessage(msg.message) || '[Decryption failed]',
    }));

    if (!decryptedMessages.length) {
      return res.status(200).json({ message: 'Send the first message to start a conversation.' });
    }

    res.json(decryptedMessages);
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ error: 'Failed to retrieve conversation history' });
  }
};

// Controller: Mark messages as seen
// Controller: Mark messages as seen
const markAsSeen = async (req, res) => {
  const { messageIds } = req.body;

  try {
    const messages = await Message.updateMany(
      { _id: { $in: messageIds } },
      { seen: true, seenAt: new Date() }
    );

    if (!messages.matchedCount) {
      return res.status(404).json({ error: 'No messages found to update' });
    }

    // Emit the message seen event for each message
    messageIds.forEach((messageId) => {
      const updatedMessage = { _id: messageId, seen: true, seenAt: new Date() };
      req.io.to(updatedMessage.senderId).emit('messageSeen', updatedMessage); // Notify the sender
    });

    res.json({ success: true, message: 'Messages marked as seen' });
  } catch (error) {
    console.error('Error marking messages as seen:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Controller: Delete a message
const deleteMessage = async (req, res) => {
  const { id: messageId } = req.params;

  try {
    const message = await Message.findByIdAndDelete(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

// Controller: Fetch receivers with profile images
const getReceiversWithProfileImages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    const contactIds = [...new Set(
      messages.map((msg) =>
        msg.senderId.toString() === userId ? msg.receiverId.toString() : msg.senderId.toString()
      )
    )];

    const contacts = await User.find(
      { _id: { $in: contactIds } },
      { _id: 1, name: 1, profileImageUrl: 1 }
    ).lean();

    const contactsWithIds = contacts.map((contact) => ({
      contactId: contact._id,
      name: contact.name,
      profileImageUrl: contact.profileImageUrl,
    }));

    res.json(contactsWithIds);
  } catch (error) {
    console.error('Error fetching contact profiles:', error);
    res.status(500).json({ error: 'Failed to fetch contact profiles' });
  }
};


module.exports = {sendMessage,getConversationHistory, markAsSeen, deleteMessage, getReceiversWithProfileImages }