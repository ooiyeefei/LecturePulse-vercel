/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    S2_ACCESS_TOKEN: process.env.S2_ACCESS_TOKEN,
  },
}

module.exports = nextConfig