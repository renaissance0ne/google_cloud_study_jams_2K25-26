/** @type {import('next').NextConfig} */
const nextConfig = {
    // Remove output: 'standalone' for Vercel deployment
    experimental: {
      serverActions: {
        allowedOrigins: ['localhost:3000', '*.vercel.app'],
      },
    },
    env: {
      GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
      GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME,
      CSV_FILE_NAME: process.env.CSV_FILE_NAME,
    },
    // Add transpile packages for better compatibility
    transpilePackages: ['xlsx']
  }
  
  module.exports = nextConfig