const { config: loadConfig } = require("dotenv");

loadConfig({
  path: ".env",
});

const config = {
  PORT: parseInt(process.env.PORT, 10) || 3010,
  AWS: {
    AccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    AWSSecretKey: process.env.AWS_SECRET_KEY,
    BucketName: process.env.AWS_S3_BUCKET_NAME,
    BucketProfile: process.env.AWS_S3_BUCKET_PROFILE,
    Region: "us-east-1",
  },
};  

module.exports = config;
