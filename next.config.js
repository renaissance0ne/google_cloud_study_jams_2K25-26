/** @type {import('next').NextConfig} */
const nextConfig = {
    // Set the workspace root to silence the warning
    outputFileTracingRoot: __dirname,
    experimental: {
      serverActions: {
        allowedOrigins: ['localhost:3000', '*.vercel.app'],
      },
    },
    // Add transpile packages for better compatibility
    transpilePackages: ['xlsx']
  }
  
  module.exports = nextConfig