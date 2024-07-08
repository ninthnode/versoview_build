/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost","versoview-post-images.s3.us-east-1.amazonaws.com", "versoview-profile-images.s3.us-east-1.amazonaws.com", "source.unsplash.com"],
  },
 
};

export default nextConfig;
