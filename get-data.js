const axios = require('axios');

// Verrà impostato dall'utente dopo aver creato il deploy su Google Apps Script
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || '';

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!GOOGLE_SCRIPT_URL) {
      return { 
          statusCode: 200, 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'warning', message: 'GOOGLE_SCRIPT_URL non configurato', data: [] }) 
      };
  }

  try {
      const response = await axios.post(GOOGLE_SCRIPT_URL, {
          action: 'get_data',
          sheetName: 'Censimento'
      });

      return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response.data)
      };
  } catch (error) {
      console.error('Error fetching data from Google Sheets:', error);
      return { statusCode: 500, body: 'Error fetching data' };
  }
};
