require('dotenv').config();
const dns = require('dns');

// Override local Windows DNS SRV lookup issues for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.log('DNS setServers note:', dnsErr.message);
}

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config.json');

// Express App Setup
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Global state variables
let sock = null;
let isConnected = false;
let latestQRImage = null;
let dbStatus = 'Firebase Realtime DB (Live Sync)';

const FIREBASE_DB_URL = 'https://sutable-99848-default-rtdb.firebaseio.com';

// Helper function to load movies from Firebase RTDB with fallbacks
async function loadMovies() {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/movies.json`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const arr = Object.entries(data).map(([key, val]) => ({
          id: val.id || key,
          ...val
        })).filter(Boolean);
        if (arr.length > 0) return arr;
      }
    }
  } catch (rtdbErr) {
    console.warn('Firebase RTDB fetch note:', rtdbErr.message);
  }

  // Fallback to local JSON
  try {
    const moviesPath = path.resolve(__dirname, config.moviesJsonPath || '../src/data/initialMovies.json');
    if (fs.existsSync(moviesPath)) {
      const data = fs.readFileSync(moviesPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading local JSON movies:', err.message);
  }
  return [];
}

async function startBot() {
  const logger = pino({ level: 'silent' });
  const authFolder = path.join(__dirname, 'auth_info_baileys');
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  const { version } = await fetchLatestBaileysVersion();

  console.log(`\n==================================================`);
  console.log(` 🎬 CINEFLIX WHATSAPP BOT (Live Firebase RTDB) `);
  console.log(` Baileys Version: ${version.join('.')}`);
  console.log(` Database Mode: ${dbStatus}`);
  console.log(`==================================================\n`);

  sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    generateHighQualityLinkPreview: true,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        latestQRImage = await QRCode.toDataURL(qr);
        console.log('⚡ New Web QR Code generated! View live at http://localhost:3001');
      } catch (qrErr) {
        console.error('Error generating web QR image:', qrErr);
      }
    }

    if (connection === 'close') {
      isConnected = false;
      latestQRImage = null;
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`⚠️ Connection closed (code ${statusCode}), reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(startBot, 3000);
      }
    } else if (connection === 'open') {
      isConnected = true;
      latestQRImage = null;
      console.log('✅ WhatsApp Bot Connected Successfully!');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg || !msg.message || msg.key.fromMe) return;

      const from = msg.key.remoteJid;
      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        '';

      const cleanText = text.trim();
      if (!cleanText) return;

      if (cleanText.toLowerCase() === '.ping' || cleanText.toLowerCase() === '.info') {
        await sock.sendMessage(from, { text: config.messages.welcome }, { quoted: msg });
        return;
      }

      if (cleanText.startsWith('.') || cleanText.length > 3) {
        await handleMovieDownloadRequest(sock, from, cleanText, msg);
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });
}

async function handleMovieDownloadRequest(sock, from, input, msg) {
  const movies = await loadMovies();
  const searchPattern = input.startsWith('.') ? input.slice(1).trim() : input.trim();
  
  const parts = searchPattern.split(/\s+/);
  const potentialCode = parts[0];
  
  let targetMovie = null;
  let targetDownload = null;
  let requestedRes = '720p';

  if (searchPattern.includes('480p')) requestedRes = '480p';
  if (searchPattern.includes('720p')) requestedRes = '720p';
  if (searchPattern.includes('1080p')) requestedRes = '1080p';

  targetMovie = movies.find(m => m.id === potentialCode || input.includes(m.id));

  if (!targetMovie) {
    const queryWithoutRes = searchPattern.replace(/480p|720p|1080p/gi, '').trim().toLowerCase();
    targetMovie = movies.find(m => {
      const titleLower = (m.title || '').toLowerCase();
      return titleLower.includes(queryWithoutRes) || queryWithoutRes.includes(titleLower);
    });
  }

  if (!targetMovie) {
    if (input.startsWith('.')) {
      await sock.sendMessage(from, { text: config.messages.notFound }, { quoted: msg });
    }
    return;
  }

  if (targetMovie.downloads && targetMovie.downloads.length > 0) {
    targetDownload = targetMovie.downloads.find(d => d.res === requestedRes) || targetMovie.downloads[0];
  }

  const downloadUrl = targetDownload?.srv2 || targetDownload?.srv1 || targetDownload?.url;
  const qualityText = targetDownload?.res || requestedRes;
  const movieTitle = targetMovie.title;
  const movieYear = targetMovie.year ? `(${targetMovie.year})` : '';

  const statusText = `⏳ Sending *${movieTitle} ${movieYear} (${qualityText})* with Sinhala Subtitles | සිංහල උපසිරැසි සමඟ...`;
  
  await sock.sendMessage(from, { text: statusText }, { quoted: msg });
  await sock.sendMessage(from, { text: '✅' });

  try {
    if (downloadUrl && downloadUrl !== '#') {
      const fileName = `${movieTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${qualityText}.mp4`;
      
      await sock.sendMessage(
        from,
        {
          document: { url: downloadUrl },
          mimetype: 'video/mp4',
          fileName: fileName,
          caption: `🎬 *${movieTitle} ${movieYear}*\n\n📁 Quality: ${qualityText}\n📦 Size: ${targetDownload?.size || 'HD'}\n🗣 Subtitle: ${targetMovie.subBy || 'Sinhala Subtitles'}\n\n🌐 Downloaded via Cineflix: ${process.env.WEBSITE_URL || config.websiteUrl}`
        },
        { quoted: msg }
      );

      await sock.sendMessage(from, {
        text: config.messages.downloadSuccess
          .replace('{title}', movieTitle)
          .replace('{quality}', qualityText)
      });
    } else {
      const altNotice = `ℹ️ *${movieTitle} (${qualityText})*\n\nDirect WhatsApp streaming file link for this quality is set to mirror mode.\n\n🔗 Telegram Bot Download: ${targetDownload?.tgLink || 'https://t.me/Cineflix_cloud_Bot'}\n🌐 Web Stream & Download: ${process.env.WEBSITE_URL || config.websiteUrl}`;
      await sock.sendMessage(from, { text: altNotice }, { quoted: msg });
    }
  } catch (downloadErr) {
    console.error('Error delivering movie file:', downloadErr.message);
    await sock.sendMessage(from, { text: config.messages.error }, { quoted: msg });
  }
}

// REST API Endpoints for Web Dashboard
app.get('/api/status', (req, res) => {
  res.json({
    connected: isConnected,
    database: dbStatus,
    bot: config.botName,
    timestamp: new Date()
  });
});

app.get('/api/qr', (req, res) => {
  res.json({
    connected: isConnected,
    qrImage: latestQRImage
  });
});

app.post('/api/pair', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!sock) {
      return res.status(503).json({ error: 'Bot socket is initializing, please try again in 5 seconds.' });
    }

    const code = await sock.requestPairingCode(cleanPhone);
    console.log(`📱 Generated Pairing Code [${code}] for phone [${cleanPhone}]`);
    return res.json({ success: true, code });
  } catch (err) {
    console.error('Error generating pairing code:', err.message);
    return res.status(500).json({ error: 'Failed to generate pairing code: ' + err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🌐 Cineflix Bot Server & Web QR/Pairing Dashboard running on port ${PORT}`);
});

startBot();
