const jwt = require("jsonwebtoken");
const fs = require("fs").promises;
const path = require("path");

const generateToken = async (id, username, time = "90d") => {
  const filePath = path.resolve(__dirname, "../jwtRS256.pem");
 
  // Read the file
  const cert = await fs.readFile(filePath);
  return jwt.sign({ id , username}, cert, {
    expiresIn: time,
    algorithm: "RS256",
  });
};

module.exports = { generateToken };
