const mongoose = require("mongoose");

const connectDB = async () => {
	try {
	// 	const conn = await mongoose.connect(process.env.MONGO_URI,{
    //   tls: true,
    //   tlsCAFile: "global-bundle.pem",
    //   dbName: "versoview",
    //   serverSelectionTimeoutMS: 5000,
    // });
	const conn = await mongoose.connect(process.env.MONGO_URI);
		console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.bold);
	} catch (error) {
		console.error(`Error: ${error.message}`.red.underline.bold);
		process.exit(1);
	}
};

module.exports = { connectDB };
