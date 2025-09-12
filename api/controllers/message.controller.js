const Message = require("../models/message.model");
const { User } = require("../models/user.model");

const getUnreadMessageCount = async (userId) => {
    const conversations = await Message.aggregate([
        // Match conversations that include the user as a participant
        { $match: { participants: userId } },

        // Unwind the messages array to handle each message individually
        { $unwind: "$messages" },

        // Match only messages that are unread and received by the user
        {
            $match: {
                "messages.read": false,        // Unread messages
                "messages.receiverId": userId // Ensure the user is the receiver
            }
        },

        // Group the results and count the number of unread messages
        { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    // Return the count or 0 if there are no unread messages
    return conversations[0]?.count || 0;
};

const getRecentChats = async (userId) => {
    const chats = await Message.find({
        participants: userId,
    }).sort({ "messages.timestamp": -1 });

    const recentChats = await Promise.all(
        chats.map(async (chat) => {
            // Get details of other participants
            const otherParticipantId = chat.participants.find((id) => id !== userId);
            const otherParticipant = await User.findOne({ _id: otherParticipantId });

            // Count unread messages for the user
            const unreadCount = chat.messages.filter(
                (message) => message.receiverId === userId && !message.read
            ).length;

            // Create a new object with unreadCount appended to user details
            const participantWithUnreadCount = {
                ...otherParticipant.toObject(), // Convert Mongoose document to plain object
                unreadCount, // Add unread count property
            };

            return participantWithUnreadCount;
        })
    );

    return recentChats;
};

const saveMessage = async (senderId, receiverId, message) => {
    let conversation = await Message.findOne({
        participants: { $all: [senderId, receiverId] },
    });

    if (conversation) {
        conversation.messages.push({ senderId, receiverId, message });
    } else {
        conversation = new Message({
            participants: [senderId, receiverId],
            messages: [{ senderId, receiverId, message }],
        });
    }

    await conversation.save();
    return conversation;
};

const markMessagesAsRead = async (conversationId, userId) => {
    await Message.updateMany(
        { _id: conversationId, "messages.receiverId": userId, "messages.read": false },
        { $set: { "messages.$[msg].read": true } },
        { arrayFilters: [{ "msg.read": false }] }
    );
};

module.exports = {
    getUnreadMessageCount,
    getRecentChats,
    saveMessage,
    markMessagesAsRead
};