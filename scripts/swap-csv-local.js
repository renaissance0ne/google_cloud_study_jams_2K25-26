// scripts/swap-csv-local.js
const fs = require('fs');
const path = require('path');

const sourceFile = process.argv[2];
const targetFile = path.join(__dirname, '../public/data.csv');

if (!sourceFile) {
  console.log('Usage: node scripts/swap-csv-local.js <path-to-new-csv>');
  process.exit(1);
}

if (!fs.existsSync(sourceFile)) {
  console.log(`❌ Source file not found: ${sourceFile}`);
  process.exit(1);
}

try {
  // Create backup
  if (fs.existsSync(targetFile)) {
    const backupFile = path.join(__dirname, '../public/data-backup.csv');
    fs.copyFileSync(targetFile, backupFile);
    console.log(`📁 Backup created: ${backupFile}`);
  }

  // Copy new file
  fs.copyFileSync(sourceFile, targetFile);
  console.log(`✅ CSV swapped successfully!`);
  console.log(`📁 New file: ${targetFile}`);
  console.log(`🔄 Leaderboard will update automatically`);
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
  process.exit(1);
}