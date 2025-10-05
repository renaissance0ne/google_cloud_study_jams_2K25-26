/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', // For Docker deployment
    experimental: {
      serverActions: true,
    },
    env: {
      GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
      GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME,
      CSV_FILE_NAME: process.env.CSV_FILE_NAME,
    }
  }
  
  module.exports = nextConfig