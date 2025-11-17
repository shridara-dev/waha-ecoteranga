const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

let client;
let qrCodeData = '';
let isReady = false;

// Initialiser le client WhatsApp
function initWhatsApp() {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', async (qr) => {
    console.log('📱 QR Code reçu');
    qrCodeData = qr;
    try {
      const qrImage = await qrcode.toDataURL(qr);
      console.log('✅ QR Code disponible sur /qr');
    } catch (err) {
      console.error('Erreur QR:', err);
    }
  });

  client.on('ready', () => {
    console.log('✅ WhatsApp connecté !');
    isReady = true;
  });

  client.on('authenticated', () => {
    console.log('✅ Authentifié');
  });

  client.on('auth_failure', () => {
    console.log('❌ Échec authentification');
  });

  client.initialize();
}

// Routes API
app.get('/', (req, res) => {
  res.json({
    status: 'WAHA pour EcoTeranga',
    whatsapp: isReady ? 'Connected' : 'Waiting for QR scan',
    endpoints: {
      qr: '/qr',
      status: '/status',
      send: 'POST /api/sendText'
    }
  });
});

app.get('/qr', async (req, res) => {
  if (isReady) {
    return res.json({ status: 'already_connected' });
  }
  if (!qrCodeData) {
    return res.json({ status: 'waiting', message: 'QR code en génération...' });
  }
  try {
    const qrImage = await qrcode.toDataURL(qrCodeData);
    res.send(`<html><body><h1>Scannez ce QR Code avec WhatsApp</h1><img src="${qrImage}"/></body></html>`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/status', (req, res) => {
  res.json({
    connected: isReady,
    qrReady: !!qrCodeData
  });
});

app.post('/api/sendText', async (req, res) => {
  if (!isReady) {
    return res.status(400).json({ error: 'WhatsApp not ready' });
  }
  
  const { chatId, text } = req.body;
  
  try {
    await client.sendMessage(chatId, text);
    res.json({ success: true, message: 'Message envoyé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur port ${port}`);
  console.log('📱 Initialisation WhatsApp...');
  initWhatsApp();
});
