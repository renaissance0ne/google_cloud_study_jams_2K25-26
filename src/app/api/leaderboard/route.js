// src/app/api/leaderboard/route.js
import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { promises as fs } from 'fs';
import path from 'path';

// Auto-detect numeric fields
const isNumericField = (fieldName) => {
  const numericPatterns = [
    /^#/,                    // Starts with #
    /^total/i,               // Starts with "total"
    /count$/i,               // Ends with "count"
    /^number/i,              // Starts with "number"
  ];
  
  // Exclude string fields that contain these keywords
  const excludePatterns = [
    /names of/i,             // "Names of Completed..."
    /url/i,                  // URLs
    /email/i,                // Emails
    /status/i,               // Status fields
  ];
  
  // Don't treat as numeric if it matches exclude patterns
  if (excludePatterns.some(pattern => pattern.test(fieldName))) {
    return false;
  }
  
  return numericPatterns.some(pattern => pattern.test(fieldName));
};

// Function to read CSV from local file
const readLocalCSV = async () => {
  const CSV_FILE_PATH = path.join(process.cwd(), 'public', 'data.csv');
  return await fs.readFile(CSV_FILE_PATH, 'utf-8');
};

// Function to read CSV from GCP Storage (when deployed)
const readGCPCSV = async () => {
  const { Storage } = await import('@google-cloud/storage');
  
  const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: process.env.GCP_CREDENTIALS ? JSON.parse(process.env.GCP_CREDENTIALS) : undefined
  });

  const bucketName = process.env.GCS_BUCKET_NAME || 'cloud-jam-leaderboard-data';
  const fileName = process.env.CSV_FILE_NAME || 'data.csv';
  
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);
  
  const [fileContents] = await file.download();
  return fileContents.toString('utf-8');
};

export async function GET() {
  try {
    let csvString;
    let dataSource = 'unknown';
    
    // Determine if we're running locally or on GCP
    if (process.env.GCP_PROJECT_ID && process.env.GCS_BUCKET_NAME) {
      csvString = await readGCPCSV();
      dataSource = 'gcp';
    } else {
      csvString = await readLocalCSV();
      dataSource = 'local-csv';
    }
    
    // Parse CSV to JSON
    const result = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });
    
    // Get headers from CSV
    const headers = result.meta.fields || [];
    
    // Transform data with auto-detected numeric conversion
    const transformedData = result.data.map(row => {
      const transformedRow = {};
      Object.keys(row).forEach(key => {
        if (isNumericField(key)) {
          transformedRow[key] = parseInt(row[key]) || 0;
        } else {
          transformedRow[key] = row[key];
        }
      });
      return transformedRow;
    });
    
    return NextResponse.json({
      data: transformedData,
      headers: headers,
      totalRecords: transformedData.length,
      lastUpdated: new Date().toISOString(),
      source: dataSource
    });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch data',
      message: error.message,
      details: error.stack
    }, { status: 500 });
  }
}