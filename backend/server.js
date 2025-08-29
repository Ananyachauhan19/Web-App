const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const mongoose = require('mongoose');

// MongoDB connection
const MONGO_URI = 'mongodb+srv://ananyachauhan112005:ananya123@cluster0.ie7dvub.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();
const PORT = 5000;

const SPREADSHEET_ID = '1Y9eTu0_Avzs8jM_vCk-XDE-Q7xjYyyontO-cLniCGps';
const SHEET_NAME = 'Sheet1';

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

app.use(cors({
  origin: [
    'https://web-app-p658.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(bodyParser.json());

async function highlightRow(qrId) {
  try {
    console.log('Authenticating with Google Sheets API...');
    const client = await auth.getClient();
    console.log('Authentication successful');
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Get all rows
    console.log('Fetching data from Google Sheet...');
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME,
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in sheet');
      return { found: false, message: 'No data in sheet' };
    }

    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i] && rows[i][8] === qrId) { // Check QR ID in column I (index 8)
        rowIndex = i + 1;
        break;
      }
    }
    console.log('QR_ID:', qrId, 'Row found at:', rowIndex);
    if (rowIndex === -1) {
      console.log('QR_ID not found in sheet');
      return { found: false, message: 'QR_ID not found' };
    }

    // Highlight the row
    console.log('Highlighting row:', rowIndex);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: rowIndex - 1,
                endRowIndex: rowIndex,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 1, green: 1, blue: 0 }, // Yellow
                },
              },
              fields: 'userEnteredFormat.backgroundColor',
            },
          },
        ],
      },
    });
    console.log('Row', rowIndex, 'highlighted successfully.');
    return { found: true };
  } catch (err) {
    console.error('Error in highlightRow:', {
      message: err.message,
      stack: err.stack,
      errors: err.errors || 'No additional error details',
      response: err.response ? err.response.data : 'No response data',
    });
    throw err;
  }
}

app.post('/api/scan', async (req, res) => {
  const { qrId } = req.body;
  console.log('Received /api/scan request with body:', req.body);
  if (!qrId) {
    console.log('No qrId provided in request');
    return res.status(400).json({ success: false, message: 'qrId is required' });
  }
  try {
    const result = await highlightRow(qrId);
    if (result.found) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: result.message || 'QR_ID not found' });
    }
  } catch (err) {
    console.error('Error in /api/scan:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
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
  console.log(`Server running on http://localhost:${PORT}`);
});