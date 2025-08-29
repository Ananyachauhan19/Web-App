const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const fs = require('fs');
const mongoose = require('mongoose');
// MongoDB connection
const MONGO_URI = 'mongodb+srv://ananyachauhan112005:ananya123@cluster0.ie7dvub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Replace <db_password> with your actual password
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();
const PORT = process.env.PORT || 5000;


// Google Sheets setup
const SPREADSHEET_ID = '1Y9eTu0_Avzs8jM_vCk-XDE-Q7xjYyyontO-cLniCGps';
const SHEET_NAME = 'Sheet1'; 

// Prefer credentials from environment (Render Secret or env var), with fallbacks
let googleAuthConfig;
try {
  if (process.env.GOOGLE_CREDENTIALS) {
    // GOOGLE_CREDENTIALS should be a JSON string of the service account
    const parsed = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    // Normalize private_key newlines if they are escaped (\\n -> \n)
    if (parsed.private_key && parsed.private_key.includes('\\n')) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }
    googleAuthConfig = { credentials: parsed, scopes: ['https://www.googleapis.com/auth/spreadsheets'] };
    console.log('GoogleAuth using credentials from GOOGLE_CREDENTIALS env var');
  } else if (fs.existsSync('/etc/secrets/credentials.json')) {
    googleAuthConfig = { keyFile: '/etc/secrets/credentials.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] };
    console.log('GoogleAuth using key file at /etc/secrets/credentials.json');
  } else if (fs.existsSync('credentials.json')) {
    googleAuthConfig = { keyFile: 'credentials.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] };
    console.log('GoogleAuth using local credentials.json file');
  } else {
    console.warn('No Google credentials found. Set GOOGLE_CREDENTIALS env var or provide credentials.json.');
    googleAuthConfig = { scopes: ['https://www.googleapis.com/auth/spreadsheets'] };
  }
} catch (e) {
  console.error('Failed to parse GOOGLE_CREDENTIALS env var:', e);
  googleAuthConfig = { scopes: ['https://www.googleapis.com/auth/spreadsheets'] };
}

const auth = new google.auth.GoogleAuth(googleAuthConfig);

app.use(cors());
app.use(bodyParser.json());


// --- QR Scan and Highlight Logic ---
async function highlightRow(qrId) {
  console.log('Starting highlightRow for qrId:', qrId);
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Lookup sheetId for the given SHEET_NAME
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = meta.data.sheets?.find(s => s.properties?.title === SHEET_NAME);
  const sheetId = sheet?.properties?.sheetId;
  if (sheetId === undefined) {
    console.error('Sheet not found with name:', SHEET_NAME);
    return { found: false };
  }

  // Get all rows
  console.log('Fetching sheet values for range:', SHEET_NAME);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_NAME,
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.warn('No values returned from sheet');
    return { found: false };
  }

  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][8] === qrId) { 
      rowIndex = i + 1; 
      break;
    }
  }
  console.log('QR_ID:', qrId, 'Row found at:', rowIndex);
  if (rowIndex === -1) return { found: false };

  
  try {
  console.log('Sending batchUpdate to highlight row:', rowIndex, 'in sheetId:', sheetId);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
        sheetId, 
                startRowIndex: rowIndex - 1,
                endRowIndex: rowIndex,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 1, green: 1, blue: 0 },
                },
              },
              fields: 'userEnteredFormat.backgroundColor',
            },
          },
        ],
      },
    });
    console.log('Row', rowIndex, 'highlighted successfully.');
  } catch (err) {
    console.error('Error highlighting row via batchUpdate:', err.response?.data || err.message || err);
  }
  return { found: true };
}

app.post('/api/scan', async (req, res) => {
  const { qrId } = req.body;
  if (!qrId) {
    return res.status(400).json({ success: false, message: 'qrId is required' });
  }
  try {
    const result = await highlightRow(qrId);
    if (result.found) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'QR_ID not found' });
    }
  } catch (err) {
    console.error('Error in /api/scan:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


const FIXED_USER = { username: 'admin', password: 'password123' };

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === FIXED_USER.username && password === FIXED_USER.password) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});