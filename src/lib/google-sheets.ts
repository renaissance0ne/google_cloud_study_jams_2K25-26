import { google } from 'googleapis';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CertificateData {
  name: string;
  date: string;
  certLink: string;
  isValid: boolean;
}

export interface CertLinkResult {
  certLink: string | null;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

function getAuthClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !privateKey) {
    throw new Error(
      'Missing Google credentials. Ensure GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY are set in .env.local'
    );
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

// ─── Sheet helpers ─────────────────────────────────────────────────────────────

async function getSheetRows(): Promise<Record<string, string>[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const tabName = process.env.GOOGLE_SHEET_TAB_NAME ?? 'Leaderboard';

  if (!sheetId) {
    throw new Error('Missing GOOGLE_SHEET_ID in .env.local');
  }

  const auth = getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: tabName,
  });

  const rows = response.data.values;
  if (!rows || rows.length < 2) return [];

  // First row is the header
  const headers = rows[0] as string[];
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, i) => {
      record[header] = (row[i] as string) ?? '';
    });
    return record;
  });
}

// ─── Format the Time column value into a readable date ────────────────────────

function formatDate(timeVal: string): string {
  if (!timeVal) return 'N/A';
  const t = timeVal.trim().toUpperCase();
  if (t.endsWith('N')) {
    const day = t.slice(0, -1);
    return `${day} November 2025`;
  }
  const day = parseInt(t, 10);
  return isNaN(day) ? timeVal : `${day} October 2025`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch all rows from the leaderboard sheet.
 * Used by: app/api/leaderboard/route.js
 */
export async function getLeaderboardRows(): Promise<Record<string, string>[]> {
  return getSheetRows();
}

/**
 * Look up a certificate by its unique UUID or UploadThing file key.
 * Used by: app/verify/[uuid]/page.js
 *
 * Matches against:
 *   1. A dedicated "UUID" column (if it exists), OR
 *   2. The file key embedded in the "Cert Link" column URL
 *      e.g. https://utfs.io/f/<fileKey>  →  match on fileKey
 */
export async function getCertificateByUuid(
  uuid: string
): Promise<CertificateData | null> {
  try {
    const rows = await getSheetRows();
    const token = uuid.trim().toLowerCase();
    const row = rows.find((r) => {
      // 1. Explicit UUID column
      if (r['UUID']?.trim().toLowerCase() === token) return true;
      // 2. UploadThing file key in Cert Link URL
      const certLink = r['Cert Link']?.trim() ?? '';
      const fileKey = certLink.split('/f/').pop()?.toLowerCase() ?? '';
      return fileKey === token;
    });

    if (!row) return null;

    const certLink = row['Cert Link']?.trim();
    if (!certLink) return null;

    return {
      name: row['Name']?.trim() ?? 'Unknown',
      date: formatDate(row['Time']),
      certLink,
      isValid: true,
    };
  } catch (err) {
    console.error('[google-sheets] getCertificateByUuid error:', err);
    return null;
  }
}

/**
 * Look up a participant's certificate link by their email.
 * Used by: app/api/certificate/route.ts → participant details page
 *
 * Expected Google Sheet columns: Email | Cert Link
 */
export async function getCertLinkByEmail(
  email: string
): Promise<CertLinkResult> {
  try {
    const rows = await getSheetRows();
    const row = rows.find(
      (r) => r['Email']?.trim().toLowerCase() === email.trim().toLowerCase()
    );

    return { certLink: row?.['Cert Link']?.trim() ?? null };
  } catch (err) {
    console.error('[google-sheets] getCertLinkByEmail error:', err);
    return { certLink: null };
  }
}
