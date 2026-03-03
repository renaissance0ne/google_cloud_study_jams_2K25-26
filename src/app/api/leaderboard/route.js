// src/app/api/leaderboard/route.js
import { NextResponse } from 'next/server';
import { getLeaderboardRows } from '@/lib/google-sheets';

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

// Custom sort function for time column
const parseTimeValue = (timeStr) => {
  const time = String(timeStr).trim().toUpperCase();
  
  // Handle November dates (e.g. "1N", "2N")
  if (time.endsWith('N')) {
    const day = parseInt(time.slice(0, -1), 10);
    return { sortKey: 200 + (isNaN(day) ? 99 : day) }; // NOV days: 201–231
  }
  
  // Handle October dates (plain numbers)
  const day = parseInt(time, 10);
  return { sortKey: isNaN(day) ? 999 : day }; // OCT days: 1–31
};

const customSort = (a, b) => {
  const timeA = parseTimeValue(a.Time);
  const timeB = parseTimeValue(b.Time);
  return timeA.sortKey - timeB.sortKey;
};

export async function GET() {
  try {
    // Fetch rows from Google Sheets
    const rows = await getLeaderboardRows();

    if (!rows.length) {
      return NextResponse.json({ data: [], headers: [], totalRecords: 0 });
    }

    // Derive headers from the first row's keys (preserves sheet column order)
    const headers = Object.keys(rows[0]);

    // Transform data with auto-detected numeric conversion
    const transformedData = rows.map(row => {
      const transformedRow = {};
      headers.forEach(key => {
        if (isNumericField(key)) {
          transformedRow[key] = parseInt(row[key]) || 0;
        } else {
          transformedRow[key] = row[key];
        }
      });
      return transformedRow;
    });

    // Apply custom sorting
    const sortedData = transformedData.sort(customSort);

    return NextResponse.json({
      data: sortedData,
      headers,
      totalRecords: sortedData.length,
      lastUpdated: new Date().toISOString(),
      source: 'google-sheets',
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