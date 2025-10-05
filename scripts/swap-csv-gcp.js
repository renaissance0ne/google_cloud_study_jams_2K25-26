// scripts/swap-csv-gcp.js
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

const sourceFile = process.argv[2];
const bucketName = process.env.GCS_BUCKET_NAME || 'cloud-jam-leaderboard-data';
const fileName = process.env.CSV_FILE_NAME || 'data.csv';

if (!sourceFile) {
  console.log('Usage: GCS_BUCKET_NAME=your-bucket node scripts/swap-csv-gcp.js <path-to-new-csv>');
  process.exit(1);
}

if (!fs.existsSync(sourceFile)) {
  console.log(`❌ Source file not found: ${sourceFile}`);
  process.exit(1);
}

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: process.env.GCP_CREDENTIALS ? JSON.parse(process.env.GCP_CREDENTIALS) : undefined
});

async function swapCSV() {
  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    // Create backup
    try {
      const [exists] = await file.exists();
      if (exists) {
        const backupFile = bucket.file(`${fileName}.backup`);
        await file.copy(backupFile);
        console.log(`📁 Backup created in bucket: ${fileName}.backup`);
      }
    } catch (backupError) {
      console.log('⚠️ Could not create backup:', backupError.message);
    }

    // Upload new file
    await bucket.upload(sourceFile, {
      destination: fileName,
      metadata: {
        cacheControl: 'no-cache',
      },
    });

    console.log(`✅ CSV swapped successfully in GCP!`);
    console.log(`📁 Bucket: ${bucketName}`);
    console.log(`📁 File: ${fileName}`);
    console.log(`🔄 Leaderboard will update automatically`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

swapCSV();