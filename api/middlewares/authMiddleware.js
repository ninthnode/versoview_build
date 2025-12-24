const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { User } = require("../models/user.model");
const fs = require("fs");
const path = require("path");

module.exports.protectUser = asyncHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		try {
			token = req.headers.authorization.split(" ")[1];

			// Ensure the certificate is loaded correctly
			const cert = fs.readFileSync(path.join(__dirname, "../jwtRS256.pem"));

			// Verify the token using the public key
			const decoded = jwt.verify(token, cert, { algorithms: ["RS256"] });

			// Fetch the user from the database using id to avoid mismatches after username changes
			req.user = await User.findOne({
				_id: decoded.id,
				userType: { $in: ["user", "publisher"] },
			});

			// Check if the user exists
			if (!req.user) {
				return res.status(401).json({ status: 401, message: "Not authorized" });
			}

			// Call next middleware or route handler
			next();
		} catch (error) {
			console.error("Token verification or user lookup failed:", error);
			return res
				.status(401)
				.json({
					status: 401,
					message: "Token verification or user lookup failed Not authorized",
				});
		}
	} else {
		return res.status(401).json({ status: 401, message: "Not authorized" });
	}
});

// Allows logged-out users through while attaching req.user when a valid token
// Silently fails if token is invalid/missing (truly optional)
module.exports.attachUserIfPresent = asyncHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		try {
			token = req.headers.authorization.split(" ")[1];
			const cert = fs.readFileSync(path.join(__dirname, "../jwtRS256.pem"));
			const decoded = jwt.verify(token, cert, { algorithms: ["RS256"] });

			const user = await User.findOne({
				_id: decoded.id,
				userType: { $in: ["user", "publisher"] },
			});

			// Only set req.user if user is found
			if (user) {
				req.user = user;
			}
			// If user not found, just continue without req.user (don't return error)
			// This makes auth truly optional
		} catch (error) {
			// Silently fail - don't set req.user and continue
			// This allows endpoints to work with or without valid auth
			console.error("Optional token verification failed (continuing without auth):", error.message);
		}
	}

	// Proceed whether user is attached or not
	next();
});

module.exports.protectAdmin = asyncHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		try {
			token = req.headers.authorization.split(" ")[1];

			const cert = fs.readFileSync("jwtRS256.pem"); // get private key

			const decoded = jwt.verify(token, cert, { algorithms: ["RS256"] });

			req.user = await User.findOne({ _id: decoded.id, userType: "admin" });

			if (req.user === null) {
				res.status(401);
				throw new Error("Not authorized");
			}
			next();
		} catch (error) {
			res.status(401);
			throw new Error("Not authorized");
		}
	}

	if (!token) {
		res.status(401);
		throw new Error("Not authorized");
	}
});
