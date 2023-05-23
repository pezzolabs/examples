/** @type {import('next').NextConfig} */
const nextConfig = {}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not defined')
}

if (!process.env.PEZZO_API_KEY) {
  throw new Error('PEZZO_API_KEY environment variable is not defined')
}

module.exports = nextConfig
