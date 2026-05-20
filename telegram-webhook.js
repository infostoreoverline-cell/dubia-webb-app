const axios = require('axios');

// Verrà impostato dall'utente tramite environment variables in Netlify
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8746297789:AAGTTrUEs4NTMMWCe9twTWIe8ptRyxdnUb4';
// Verrà impostato dall'utente dopo aver creato il deploy su Google Apps Script
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || '';

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const body = JSON.parse(event.body);
    
    // Telegram webhook validation
    if (!body || !body.message || !body.message.text) {
      return { statusCode: 200, body: 'No message to process' };
    }

    const chatId = body.message.chat.id;
    const text = body.message.text.trim();

    console.log(`Received message from ${chatId}: ${text}`);

    if (text.startsWith('/start')) {
      await sendMessage(chatId, `Benvenuto nel Sistema D.U.B.I.A. CTO! \nPer inserire un nuovo censimento, scrivi il peso in grammi. Esempio: "Peso 1845" o semplicemente "1845".`);
      return { statusCode: 200, body: 'OK' };
    }

    // Estrai peso (accetta "Peso 1845", "peso 1845g", "1845")
    const pesoMatch = text.match(/(?:peso\s*)?(\d+(?:[.,]\d+)?)\s*(?:g|grammi)?/i);
    
    if (pesoMatch) {
      const pesoTotale = parseFloat(pesoMatch[1].replace(',', '.'));
      
      await sendMessage(chatId, `Calcolo biomassa in corso per ${pesoTotale}g... Invio a D.U.B.I.A. Engine (Google Sheets).`);
      
      if (!GOOGLE_SCRIPT_URL) {
         await sendMessage(chatId, `Attenzione CTO: Manca l'URL di Google Sheets. Configuralo in Netlify come GOOGLE_SCRIPT_URL.`);
         return { statusCode: 200, body: 'OK' };
      }

      try {
        const response = await axios.post(GOOGLE_SCRIPT_URL, {
          action: 'insert_censimento',
          coloniaId: 'Generale', // In futuro potremmo estrarlo dal comando
          pesoTotale: pesoTotale
        });

        const resData = response.data;
        if (resData.status === 'success') {
          const d = resData.data;
          const msg = `✅ *Censimento Registrato!*\n\n` +
                      `*Peso Totale:* ${pesoTotale}g\n` +
                      `*Adulti:* ${d.W_adulti}g (F: ${d.N_femmine}, M: ${d.N_maschi})\n` +
                      `*Neanidi:* ${d.W_neanidi}g (Medie: ${d.N_medie}, Baby: ${d.N_baby})`;
          await sendMessage(chatId, msg, 'Markdown');
        } else {
          await sendMessage(chatId, `❌ Errore dal motore DUBIA: ${resData.message}`);
        }
      } catch (err) {
         console.error('Error sending to Google Script:', err);
         await sendMessage(chatId, `❌ Impossibile comunicare con Google Sheets.`);
      }

    } else {
      await sendMessage(chatId, `Comando non riconosciuto. Scrivi "Peso 1845" per inserire un censimento.`);
    }

    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    console.error('Error in webhook handler:', error);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};

async function sendMessage(chatId, text, parseMode = '') {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const payload = { chat_id: chatId, text: text };
  if (parseMode) {
    payload.parse_mode = parseMode;
  }
  await axios.post(url, payload);
}
