# Teorema D.U.B.I.A. - Digital Twin per Blaptica Dubia

Benvenuto nel tuo sistema AI-Driven AgriTech, CTO!
Questo progetto crea una pipeline completa per la gestione dell'allevamento, connettendo Telegram, Google Sheets e una Dashboard Web (Netlify).

## Architettura (A Costo Zero)
1. **Frontend Input:** Telegram Bot (@DUBIA_TRAKING_bot)
2. **Backend / Database:** Google Sheets + Google Apps Script
3. **Frontend Dashboard:** Netlify Web App (HTML/JS + TailwindCSS)
4. **Middleware:** Netlify Functions (Node.js/Axios)

## Come funziona
1. Scrivi al bot Telegram il peso della colonia (es: "Peso 1845").
2. Netlify Functions riceve il messaggio (Webhook) e lo invia a Google Apps Script.
3. Lo script di Google applica le formule del Teorema D.U.B.I.A. (35% adulti, 65% neanidi, stima sesso e taglie) e salva la riga sul foglio `Censimento`.
4. La Dashboard Web legge i dati da Google Sheets tramite Netlify e disegna i grafici.

## Setup Iniziale
Vedi le istruzioni fornite via chat per l'installazione del backend su Google Sheets. 

Una volta ottenuto il `GOOGLE_SCRIPT_URL`, dovrai configurare Netlify:
- Variabile d'ambiente: `TELEGRAM_BOT_TOKEN`
- Variabile d'ambiente: `GOOGLE_SCRIPT_URL`

Per agganciare il bot a Netlify, bisogna eseguire questo comando (sostituendo YOUR_NETLIFY_URL):
`curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<YOUR_NETLIFY_URL>/.netlify/functions/telegram-webhook"`

## Logica Health Monitoring (Digital Twin)
Il sistema è predisposto per analizzare i delta di crescita. Se il peso rilevato è inferiore al peso teorico calcolato sui mesi precedenti, verranno generati alert (visibili in dashboard o via bot) per segnalare possibili fattori di stress (es. cali termici).
