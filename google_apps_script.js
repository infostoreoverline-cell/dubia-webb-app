/**
 * TEOREMA D.U.B.I.A. - Google Apps Script Backend
 * Questo script funge da ricevitore (webhook) per i dati inviati da Telegram o Netlify.
 * Calcola automaticamente i parametri demografici in base al peso totale inserito.
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheetName = data.sheetName || 'Censimento';
    const action = data.action;

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Foglio non trovato: ' + sheetName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'insert_censimento') {
      const date = new Date();
      const coloniaId = data.coloniaId || 'Generale';
      const pesoTotale = parseFloat(data.pesoTotale);

      if (isNaN(pesoTotale)) throw new Error('Peso totale non valido.');

      // --- LOGICA TEOREMA D.U.B.I.A. ---
      
      // 1. Ripartizione di Base
      const W_adulti = pesoTotale * 0.35;
      const W_neanidi = pesoTotale * 0.65;

      // 2. Sezione Riproduttiva (Adulti)
      const mf = 2.5; // Massa media femmina
      const mm = 1.5; // Massa media maschio
      const Sf = 0.77; // Fattore sesso femmine
      const Sm = 0.23; // Fattore sesso maschi
      
      const N_femmine = Math.round((W_adulti * Sf) / mf);
      const N_maschi = Math.round((W_adulti * Sm) / mm);

      // 3. Modello Piramidale Neanidi (Ingrasso)
      const m_med = 0.8; // Massa media taglie medie
      const m_baby = 0.1; // Massa media baby
      
      const N_medie = Math.round((W_neanidi * 0.70) / m_med);
      const N_baby = Math.round((W_neanidi * 0.30) / m_baby);

      // 4. Inserimento dati nel foglio (Data, Colonia, Peso, W_ad, W_nean, F, M, Medie, Baby)
      sheet.appendRow([date, coloniaId, pesoTotale, W_adulti, W_neanidi, N_femmine, N_maschi, N_medie, N_baby]);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Censimento registrato. Calcolo D.U.B.I.A. completato.',
        data: {
          W_adulti: W_adulti.toFixed(2),
          W_neanidi: W_neanidi.toFixed(2),
          N_femmine: N_femmine,
          N_maschi: N_maschi,
          N_medie: N_medie,
          N_baby: N_baby
        }
      })).setMimeType(ContentService.MimeType.JSON);

    } else if (action === 'get_data') {
       // Logica per estrarre i dati per la dashboard
       const dataRange = sheet.getDataRange();
       const values = dataRange.getValues();
       return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          data: values
       })).setMimeType(ContentService.MimeType.JSON);
    } else {
        throw new Error('Azione non riconosciuta.');
    }

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// --- MODULO AGGIUNTIVO: CRM VENDITE E HEALTH MONITORING ---

function checkHealthAndSales(sheet, lastWeight) {
  // 1. Health Monitoring (Teorico vs Reale)
  // Supponiamo un tasso di crescita atteso del 10% mensile.
  // Qui analizziamo le ultime due righe del censimento.
  
  const data = sheet.getDataRange().getValues();
  if (data.length > 2) {
    const prevRow = data[data.length - 2];
    const prevWeight = prevRow[2]; // Colonna C: Peso
    
    // Calcolo Delta
    const delta = ((lastWeight - prevWeight) / prevWeight) * 100;
    
    let alertMsg = null;
    if (delta < 0) {
      alertMsg = `⚠️ ALERT HEALTH: Biomassa in calo del ${Math.abs(delta).toFixed(1)}%. Possibile stress termico o inbreeding.`;
    }
    
    return alertMsg;
  }
  return null;
}

// Nota: la funzione sopra è concettuale per illustrare come estendere il GScript
// per fare alert in tempo reale via webhook/telegram in futuro.
