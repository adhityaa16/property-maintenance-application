const router = require('express').Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Apply authentication middleware to all chat routes
router.use(authenticate);

// Get chat history between two users
router.get('/history/:user_id', chatController.getChatHistory);

// Get maintenance request chat history
router.get('/maintenance/:maintenance_id', chatController.getMaintenanceChat);

// Get property chat history
router.get('/property/:property_id', chatController.getPropertyChat);

// Get unread messages count
router.get('/unread', chatController.getUnreadCount);

// Mark messages as read
router.put('/read/:sender_id', chatController.markAsRead);

// Get recent chats
router.get('/recent', chatController.getRecentChats);

module.exports = router;
