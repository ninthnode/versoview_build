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
const genreRoutesV1 = require("./routes/v1/genre.route");
const s3Router = require("./routes/v1/s3");
const messageRouter = require("./routes/v1/message.route");
const searchRouter = require("./routes/v1/search.route");
const rateLimit = require("express-rate-limit");
const fs = require("node:fs");
const path = require("node:path");
const { exec } = require("node:child_process");
const Message = require("./models/message.model");
const morgan = require("morgan");
const limiter = rateLimit({
	windowMs: 30 * 1000, // 30 seconds
	max: 10000, // Limit each IP to 100 requests per `window` (here, per 30 seconds)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const folderPath = path.join(__dirname, "uploads");
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

// Serve static files from the public directory
app.use("/public", express.static(path.join(__dirname, "../public")));
app.use(morgan("dev"));
// const des = path.join(__dirname, "../public");

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
	console.log("User connected:", socket.id);

	socket.on("register", (userId) => {
		users[userId] = socket.id;
		console.log("User registered:", userId);
	});

	socket.on("private_message", async ({ senderId, receiverId, message }) => {
		console.log("SID, RID : ", senderId, receiverId);
		console.log(users);
		const receiverSocketId = users[receiverId];
		console.log("Receiver socket id: ", receiverSocketId);

		try {
			let conversation = await Message.findOne({
				participants: { $all: [senderId, receiverId] },
			});
			if (conversation) {
				conversation.messages.push({ senderId, message });
			} else {
				conversation = new Message({
					participants: [senderId, receiverId],
					messages: [{ senderId, message }],
				});
			}

			await conversation.save();
			console.log("Message saved to database");
		} catch (error) {
			console.error("Error saving message to database:", error);
		}

		if (receiverSocketId) {
			io.to(receiverSocketId).emit("dm", { senderId, receiverId, message });
		}
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

// console.log(users)

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// app.use(cors({origin :["https://versoview-ui.vercel.app" , "http://localhost:3000"]}));
app.use(cors());
app.options("*", cors());
app.use("/api/v1/s3", s3Router);

app.get("/", (req, res) => {
	res.send("Server is running....");
});

app.use("/api/v1/admin/", adminRoutesV1);
app.use("/api/v1/users/", userRoutesV1);
app.use("/api/v1/channel/", channelRoutesV1);
app.use("/api/v1/post/", postRoutesV1);
app.use("/api/v1/genre/", genreRoutesV1);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/search", searchRouter);
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
