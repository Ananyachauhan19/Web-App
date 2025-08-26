// Basic Express server with MongoDB connection and fixed login
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
const PORT = 5000;


// Google Sheets setup
const SPREADSHEET_ID = '1Y9eTu0_Avzs8jM_vCk-XDE-Q7xjYyyontO-cLniCGps';
const SHEET_NAME = 'Sheet1'; // Change if your sheet name is different

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json', // Downloaded from Google Cloud Console
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

app.use(cors());
app.use(bodyParser.json());


// --- QR Scan and Highlight Logic ---
async function highlightRow(qrId) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Get all rows
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_NAME,
  });
  const rows = res.data.values;
  if (!rows) return { found: false };

  // Find row index (skip header), search in column I (index 8)
  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][8] === qrId) { // Column I is index 8
      rowIndex = i + 1; // 1-based index for Sheets API
      break;
    }
  }
  console.log('QR_ID:', qrId, 'Row found at:', rowIndex);
  if (rowIndex === -1) return { found: false };

  // Highlight row in yellow
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0, // Usually 0 for the first sheet, change if needed
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
    console.error('Error highlighting row:', err);
  }
  return { found: true };
}

app.post('/api/scan', async (req, res) => {
  const { qrId } = req.body;
  try {
    const result = await highlightRow(qrId);
    if (result.found) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'QR_ID not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fixed credentials
const FIXED_USER = { username: 'admin', password: 'password123' };

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === FIXED_USER.username && password === FIXED_USER.password) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
