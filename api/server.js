const express = require("express");
const dotenv = require("dotenv");
require("colors");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("node:http");
const { connectDB } = require("./config/db");
const adminRoutesV1 = require("./routes/v1/admin.route");
const userRoutesV1 = require("./routes/v1/user.route");
const channelRoutesV1 = require("./routes/v1/channel.route");
const postRoutesV1 = require("./routes/v1/post.route");
const editionRoutesV1 = require("./routes/v1/edition.route");
const genreRoutesV1 = require("./routes/v1/genre.route");
const s3Router = require("./routes/v1/s3");
const messageRouter = require("./routes/v1/message.route");
const searchRouter = require("./routes/v1/search.route");
const versoRewardsRouter = require("./routes/v1/verso-rewards.route");
const rateLimit = require("express-rate-limit");
const fs = require("node:fs");
const path = require("path");
const { exec } = require("node:child_process");
const Message = require("./models/message.model");
const morgan = require("morgan");
const limiter = rateLimit({
	windowMs: 30 * 1000, // 30 seconds
	max: 10000, // Limit each IP to 100 requests per `window` (here, per 30 seconds)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const { User } = require("./models/user.model");


// fs.chmod(folderPath, 0o700, (err) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
// });

const {
	notFoundError,
	errorHandler,
} = require("./middlewares/errorHandlerMiddleware");
const { extendErrors } = require("ajv/dist/compile/errors");
const app = express();


app.use(morgan("dev"));

dotenv.config();
connectDB();

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

const users = {};

io.on("connection", (socket) => {
	socket.on("register", (userId) => {
		users[userId] = socket.id;
		console.log("User registered:", userId);
	});

	socket.on("private_message", async ({ senderId, receiverId, message }) => {
		const receiverSocketId = users[receiverId];

		try {
			let conversation = await Message.findOne({
				participants: { $all: [senderId, receiverId] },
			});
			if (conversation) {
				conversation.messages.push({ senderId,receiverId, message });
			} else {
				conversation = new Message({
					participants: [senderId, receiverId],
					messages: [{ senderId,receiverId, message }],
				});
			}

			await conversation.save();

			const receiverSocketId = users[receiverId];
			const senderSocketId = users[senderId];

			const chats = await Message.find({
				participants: receiverId,
			  }).sort({ "messages.timestamp": -1 });
		
			  const recentChats = await Promise.all(
				chats.map(async (chat) => {
				
				  // Get details of other participants
				  const otherParticipantId = chat.participants.find((id) => id !== receiverId);
				  const otherParticipant = await User.findOne({ _id: otherParticipantId });
		  
				  // Count unread messages for the user
				  const unreadCount = chat.messages.filter(
					(message) => message.receiverId == receiverId && !message.read
				  ).length;
		  
				 // Create a new object with unreadCount appended to user details
				 const participantWithUnreadCount = {
				  ...otherParticipant.toObject(), // Convert Mongoose document to plain object
				  unreadCount, // Add unread count property
				};
		
				return participantWithUnreadCount;
				})
			  );
			const senderchats = await Message.find({
				participants: senderId,
			  }).sort({ "messages.timestamp": -1 });
		
			  const senderRecentChats = await Promise.all(
				senderchats.map(async (chat) => {
				
				  // Get details of other participants
				  const otherParticipantId = chat.participants.find((id) => id !== senderId);
				  const otherParticipant = await User.findOne({ _id: otherParticipantId });

				  const participantWithUnreadCount = {
				  ...otherParticipant.toObject(), // Convert Mongoose document to plain object
				};
		
				return participantWithUnreadCount;
				})
			  );

			  if(senderSocketId){
				  io.to(senderSocketId).emit("recentChats", senderRecentChats);

			  }
			  if (receiverSocketId) {
				const unreadCount = await getUnreadMessageCount(receiverId);

				  io.to(receiverSocketId).emit("unreadCount", unreadCount);
				  io.to(receiverSocketId).emit("recentChats", recentChats);
			} else {
				console.log("Receiver is not connected:", receiverId);
			}

		} catch (error) {
			console.error("Error saving message to database:", error);
		}
		
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("dm", { senderId, receiverId, message });
		}
	});
	socket.on("recentChats", async (userId) => {
		const chats = await Message.find({
			participants: userId,
		  }).sort({ "messages.timestamp": -1 });
	
		  const recentChats = await Promise.all(
			chats.map(async (chat) => {
			  const lastMessage = chat.messages[chat.messages.length - 1];
	  
			  // Get details of other participants
			  const otherParticipantId = chat.participants.find((id) => id !== userId);
			  const otherParticipant = await User.findOne({ _id: otherParticipantId });
	  
			  // Count unread messages for the user
			  const unreadCount = chat.messages.filter(
				(message) => message.senderId !== userId && !message.read
			  ).length;
	  
			 // Create a new object with unreadCount appended to user details
			 const participantWithUnreadCount = {
			  ...otherParticipant.toObject(), // Convert Mongoose document to plain object
			  unreadCount, // Add unread count property
			};
	
			return participantWithUnreadCount;
			})
		  );
		  socket.emit("recentChats", recentChats);
	});
	socket.on("disconnect", () => {
		for (const userId in users) {
			if (users[userId] === socket.id) {
				delete users[userId];
				break;
			}
		}
		console.log("User disconnected:", socket.id);
	});
});
const getUnreadMessageCount = async (userId) => {
    const conversations = await Message.aggregate([
        { $match: { participants: userId } },
        { $unwind: "$messages" },
        {
            $match: {
                "messages.read": false,        // Unread messages
                "messages.receiverId": userId // Ensure the user is the receiver
            }
        },

        { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    return conversations[0]?.count || 0;
};

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "5mb" })); // Ensure body parsing is enabled
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(limiter);

// app.use(cors({origin :["https://versoview-frontend-7bz1wofvj-trikara.vercel.app" , "http://localhost:3000"]}));
app.use(cors());
app.options("*", cors());
app.use("/api/v1/s3", s3Router);

app.get("/", (req, res) => {
	res.send("Server is running....");
});

// Serve static files from the static directory
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api/v1/admin/", adminRoutesV1);
app.use("/api/v1/users/", userRoutesV1);
app.use("/api/v1/channel/", channelRoutesV1);
app.use("/api/v1/post/", postRoutesV1);
app.use("/api/v1/editions/", editionRoutesV1);
app.use("/api/v1/genre/", genreRoutesV1);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/verso-rewards", versoRewardsRouter);
app.use(notFoundError);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

server.listen(
	PORT,
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`
			.green.bold,
	),
);
