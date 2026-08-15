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
  makeCacheableSignalKeyStore,
  initAuthCreds,
  BufferJSON,
  proto
} = require('@whiskeysockets/baileys');
const mongoose = require('mongoose');
const pino = require('pino');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
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
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mongoose Schema for Baileys WhatsApp Session Persistence in MongoDB Atlas (Heroku Safe)
const baileysAuthSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  data: { type: Object, required: true }
}, { timestamps: true, collection: 'baileys_auth' });

const BaileysAuth = mongoose.models.BaileysAuth || mongoose.model('BaileysAuth', baileysAuthSchema);

async function useMongoDBAuthState() {
  const readData = async (file) => {
    try {
      const doc = await BaileysAuth.findById(file).lean();
      if (doc && doc.data) {
        return JSON.parse(JSON.stringify(doc.data), BufferJSON.reviver);
      }
    } catch (e) {
      console.error(`MongoDB read note [${file}]:`, e.message);
    }
    return null;
  };

  const writeData = async (file, data) => {
    try {
      const serialized = JSON.parse(JSON.stringify(data, BufferJSON.replacer));
      await BaileysAuth.findByIdAndUpdate(
        file,
        { _id: file, data: serialized },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.error(`MongoDB write note [${file}]:`, e.message);
    }
  };

  const removeData = async (file) => {
    try {
      await BaileysAuth.findByIdAndDelete(file);
    } catch (e) {
      console.error(`MongoDB remove note [${file}]:`, e.message);
    }
  };

  const creds = (await readData('creds')) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const file = `${category}-${id}`;
              if (value) {
                tasks.push(writeData(file, value));
              } else {
                tasks.push(removeData(file));
              }
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    saveCreds: async () => {
      await writeData('creds', creds);
    }
  };
}

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
  const { version } = await fetchLatestBaileysVersion();

  let authState;
  const DEFAULT_MONGO_URI = 'mongodb+srv://ccransika_db_user:Pc1u7xrzGEn4LJvw@cluster0.sntej6n.mongodb.net/cineflix_bot?retryWrites=true&w=majority';
  const mongoUri = process.env.MONGODB_URI || config.mongodbUri || DEFAULT_MONGO_URI;

  if (mongoUri && mongoUri.trim() !== '' && !mongoUri.includes('YOUR_MONGODB_ATLAS_URI')) {
    try {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log('🍃 Connected to MongoDB Atlas for WhatsApp Session Persistence!');
      }
      authState = await useMongoDBAuthState();
      dbStatus = 'MongoDB Atlas Session Storage + Firebase RTDB Movies';
    } catch (mongoErr) {
      console.warn('⚠️ MongoDB connection failed, falling back to local files:', mongoErr.message);
      const authFolder = path.join(__dirname, 'auth_info_baileys');
      authState = await useMultiFileAuthState(authFolder);
    }
  } else {
    console.log('📁 Using local auth_info_baileys folder for session storage.');
    const authFolder = path.join(__dirname, 'auth_info_baileys');
    authState = await useMultiFileAuthState(authFolder);
  }

  const { state, saveCreds } = authState;

  console.log(`\n==================================================`);
  console.log(` 🎬 CINEFLIX WHATSAPP BOT (Live Firebase RTDB & MongoDB Auth) `);
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

      console.log(`📩 Received WhatsApp Message from [${from}]: "${cleanText}"`);

      if (cleanText.toLowerCase() === '.ping' || cleanText.toLowerCase() === '.info') {
        await sock.sendMessage(from, { text: config.messages.welcome }, { quoted: msg });
        return;
      }

      // Process any request containing a movie title or code
      await handleMovieDownloadRequest(sock, from, cleanText, msg);
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });
}

// Automatic Bot Queue Worker for Website Direct Phone Delivery matching Screenshots
async function processFirebaseBotQueue() {
  if (!sock || !isConnected) return;

  try {
    const res = await fetch(`${FIREBASE_DB_URL}/bot_requests.json`);
    if (!res.ok) return;

    const data = await res.json();
    if (!data || typeof data !== 'object') return;

    const pendingRequests = Object.entries(data)
      .map(([key, val]) => ({ reqId: key, ...val }))
      .filter(r => r.status === 'pending');

    for (let i = 0; i < pendingRequests.length; i++) {
      const req = pendingRequests[i];
      const jid = `${req.phone}@s.whatsapp.net`;
      const userName = req.userName || 'Gavesh';
      const movieTitle = req.movieTitle || 'Movie';
      const movieYear = req.movieYear ? `(${req.movieYear})` : '';
      const qualityText = req.quality || '720p';

      console.log(`🚀 Processing Direct WhatsApp Request for [${userName}] (${req.phone}): ${movieTitle}`);

      // Mark request as processing immediately in Firebase RTDB to prevent repeat loops
      await fetch(`${FIREBASE_DB_URL}/bot_requests/${req.reqId}/status.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify('processing')
      });

      // Step 1: Enqueued notice matching Screenshot 2
      const msg1 = `🎬 *${movieTitle}* පේළිමට එක් කරන ලදී.\n👤 *නම:* ${userName}\n🔢 *ඔබගේ වාරය:* පේළිමේ 1 වෙනියා\n\nඔබගේ වාරය පැමිණි විගස බාගත කිරීම ආරම්භ කරනු ඇත.`;
      await sock.sendMessage(jid, { text: msg1 });
      await delay(2000);

      // Step 2: Server downloading notice matching Screenshot 2
      const msg2 = `👋 *ආයුබෝවන් ${userName}*, ඔබගේ *${movieTitle} ${movieYear}* චිත්‍රපටය මේ මොහොතේ අපගේ සර්වර් වෙත බාගත කිරීම ආරම්භ විය. කරුණාකර රැඳී සිටින්න... ⏳`;
      await sock.sendMessage(jid, { text: msg2 });
      await delay(2500);

      // Step 3: Downloaded notice matching Screenshot 1 & 2
      const msg3 = `📦 *${movieTitle}* සාර්ථකව ලබා ගත්තා. දැන් එය ඔබගේ WhatsApp වෙත එවමින් පවති. (ෆයිල් සයිස් එක අනුව මෙය WhatsApp වෙත පැමිණීමට සුළු වේලාවක් ගත විය හැක) 🚀`;
      await sock.sendMessage(jid, { text: msg3 });
      await delay(2000);

      // Fetch movie download details from database
      const movies = await loadMovies();
      const targetMovie = movies.find(m => m.id === req.movieId || (m.title && m.title.toLowerCase().includes(movieTitle.toLowerCase())));
      const targetDownload = targetMovie?.downloads?.find(d => d.res === qualityText) || targetMovie?.downloads?.[0];
      const downloadUrl = targetDownload?.srv1 || targetDownload?.srv2 || targetDownload?.url || targetMovie?.subUrl;
      const fileSize = targetDownload?.size || '216 MB';

      // Step 4: Uploading notice matching Screenshot 1 & 2
      const msg4 = `📊 *ෆයිල් එකේ ප්‍රමාණය:* ${fileSize}\n🚀 දැන් මෙය ඔබගේ WhatsApp එකට උඩුගත වෙමින් පවති. කරුණාකර රැඳී සිටින්න...`;
      await sock.sendMessage(jid, { text: msg4 });
      await delay(2000);

      // Step 5: Deliver Document File (.mp4) or Direct Download Link
      let documentSent = false;
      if (downloadUrl && downloadUrl !== '#' && downloadUrl.startsWith('http')) {
        const isDirectFile = downloadUrl.match(/\.(mp4|mkv|avi|mov|zip|rar|srt)$/i) || downloadUrl.includes('/download') || downloadUrl.includes('direct');
        if (isDirectFile) {
          try {
            const fileName = `${movieTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${qualityText}.mp4`;
            await sock.sendMessage(
              jid,
              {
                document: { url: downloadUrl },
                mimetype: 'video/mp4',
                fileName: fileName,
                caption: `🎬 *${movieTitle} ${movieYear}*\n\n📁 Quality: ${qualityText}\n📦 Size: ${fileSize}\n🗣 Subtitle: Cineflix Sinhala Subtitles (${process.env.WEBSITE_URL || config.websiteUrl})\n\n🌐 Downloaded via Cineflix: ${process.env.WEBSITE_URL || config.websiteUrl}`
              }
            );
            documentSent = true;
          } catch (docErr) {
            console.error('Error sending document in queue worker:', docErr.message);
          }
        }
      }

      if (!documentSent) {
        const linkNotice = `🎬 *${movieTitle} ${movieYear} (${qualityText})*\n\n🗣 Subtitle: Cineflix Sinhala Subtitles (${process.env.WEBSITE_URL || config.websiteUrl})\n📥 *Direct Server Download Link:*\n🔗 ${downloadUrl || targetDownload?.tgLink || 'https://t.me/Cineflix_cloud_Bot'}\n\n🍿 *Watch Online & Download Web:* ${process.env.WEBSITE_URL || config.websiteUrl}`;
        await sock.sendMessage(jid, { text: linkNotice });
      }
      await delay(1500);

      // Step 6: Successfully sent notice matching Screenshot 1
      const msg6 = `✅ *${movieTitle} successfully sent!*\n👤 *Requested by:* ${userName}`;
      await sock.sendMessage(jid, { text: msg6 });
      await delay(1500);

      // Step 7: Final thank you notice matching Screenshot 1
      const msg7 = `✅ *ආයුබෝවන් ${userName}*, ඔබ ඉල්ලුම් කළ *${movieTitle}* චිත්‍රපටය සාර්ථකව ඒවා අවසන්! අපගේ සේවාව ලබාගැනීම පිළිබඳව ස්තූතියි. 🎬\n\nසිංහල හෝ Tamil Subtitles Play වීමට නම් MX Player / VLC Player භාවිත කර Movie එක බලන්න.\n\nගැටලුවක් ඇත්නම් Cineflix Admin කෙනෙකු අමතන්න. 😊\n\n🌐 ${process.env.WEBSITE_URL || config.websiteUrl}`;
      await sock.sendMessage(jid, { text: msg7 });

      // Update status in Firebase RTDB to completed
      await fetch(`${FIREBASE_DB_URL}/bot_requests/${req.reqId}/status.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify('completed')
      });
    }
  } catch (queueErr) {
    console.error('Queue worker error:', queueErr.message);
  }
}

// Run queue worker every 6 seconds
setInterval(processFirebaseBotQueue, 6000);

async function handleMovieDownloadRequest(sock, from, input, msg) {
  const movies = await loadMovies();
  if (!movies || movies.length === 0) return;

  let targetMovie = null;
  const lowerInput = input.toLowerCase();

  // 1. Extract explicit "Movie Code: [code]" or "-[key]" pattern from website message
  const codeMatch = input.match(/Movie Code:\s*([^\s]+)/i) || input.match(/(-[a-zA-Z0-9_-]{10,})/i);
  if (codeMatch && codeMatch[1]) {
    const matchedCode = codeMatch[1].trim();
    targetMovie = movies.find(m => m.id === matchedCode || m.id === matchedCode.replace(/^-/, ''));
  }

  // 2. Direct ID string match
  if (!targetMovie) {
    targetMovie = movies.find(m => m.id && input.includes(String(m.id)));
  }

  // 3. Title fuzzy match
  if (!targetMovie) {
    const queryWithoutRes = lowerInput
      .replace(/hi cineflix!|i want to download|via whatsapp|movie code:|\./gi, '')
      .replace(/480p|720p|1080p/gi, '')
      .replace(/\(\d{4}\)/g, '')
      .trim();

    if (queryWithoutRes.length >= 2) {
      targetMovie = movies.find(m => {
        const titleLower = (m.title || '').toLowerCase();
        return titleLower.includes(queryWithoutRes) || queryWithoutRes.includes(titleLower);
      });
    }
  }

  if (!targetMovie) {
    if (input.startsWith('.')) {
      await sock.sendMessage(from, { text: config.messages.notFound }, { quoted: msg });
    }
    return;
  }

  // Determine requested resolution
  let requestedRes = '720p';
  if (lowerInput.includes('480p')) requestedRes = '480p';
  if (lowerInput.includes('720p')) requestedRes = '720p';
  if (lowerInput.includes('1080p')) requestedRes = '1080p';

  let targetDownload = null;
  if (targetMovie.downloads && targetMovie.downloads.length > 0) {
    targetDownload = targetMovie.downloads.find(d => d.res === requestedRes) || targetMovie.downloads[0];
  }

  const downloadUrl = targetDownload?.srv1 || targetDownload?.srv2 || targetDownload?.url || targetMovie.subUrl;
  const qualityText = targetDownload?.res || requestedRes;
  const movieTitle = targetMovie.title;
  const movieYear = targetMovie.year ? `(${targetMovie.year})` : '';

  const statusText = `⏳ Sending *${movieTitle} ${movieYear} (${qualityText})* with Sinhala Subtitles | සිංහල උපසිරැසි සමඟ...`;
  
  await sock.sendMessage(from, { text: statusText }, { quoted: msg });
  await sock.sendMessage(from, { text: '✅' });

  try {
    // If direct downloadable video file
    if (downloadUrl && downloadUrl !== '#' && downloadUrl.startsWith('http')) {
      const isDirectFile = downloadUrl.match(/\.(mp4|mkv|avi|mov|zip|rar|srt)$/i) || downloadUrl.includes('/download') || downloadUrl.includes('direct');
      if (isDirectFile) {
        const fileName = `${movieTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${qualityText}.mp4`;
        
        await sock.sendMessage(
          from,
          {
            document: { url: downloadUrl },
            mimetype: 'video/mp4',
            fileName: fileName,
            caption: `🎬 *${movieTitle} ${movieYear}*\n\n📁 Quality: ${qualityText}\n📦 Size: ${targetDownload?.size || 'HD'}\n🗣 Subtitle: Cineflix Sinhala Subtitles (${process.env.WEBSITE_URL || config.websiteUrl})\n\n🌐 Downloaded via Cineflix: ${process.env.WEBSITE_URL || config.websiteUrl}`
          },
          { quoted: msg }
        );

        await sock.sendMessage(from, {
          text: config.messages.downloadSuccess
            .replace('{title}', movieTitle)
            .replace('{quality}', qualityText)
        });
        return;
      }
    }

    // Direct text link delivery for web download links / mirror servers
    const linkNotice = `🎬 *${movieTitle} ${movieYear} (${qualityText})*\n\n🗣 Subtitle: Cineflix Sinhala Subtitles (${process.env.WEBSITE_URL || config.websiteUrl})\n📥 *Direct Server Download Link:*\n🔗 ${downloadUrl || targetDownload?.tgLink || 'https://t.me/Cineflix_cloud_Bot'}\n\n🍿 *Watch Online & Download Web:* ${process.env.WEBSITE_URL || config.websiteUrl}`;
    await sock.sendMessage(from, { text: linkNotice }, { quoted: msg });
  } catch (downloadErr) {
    console.error('Error delivering movie file:', downloadErr.message);
    const fallbackMsg = `🎬 *${movieTitle} ${movieYear} (${qualityText})*\n\n🗣 Subtitle: Cineflix Sinhala Subtitles (${process.env.WEBSITE_URL || config.websiteUrl})\n📥 *Download Link:*\n🔗 ${downloadUrl || targetDownload?.tgLink || config.websiteUrl}\n\n🌐 Cineflix Web: ${process.env.WEBSITE_URL || config.websiteUrl}`;
    await sock.sendMessage(from, { text: fallbackMsg }, { quoted: msg });
  }
}

// Secure Authorization Middleware for Heroku Bot API Endpoints
const secureBotAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.key;
  const SECRET_KEY = process.env.BOT_SECRET_KEY || 'cflx_bot_secure_2026';
  if (!apiKey || apiKey !== SECRET_KEY) {
    return res.status(403).json({ error: 'Unauthorized access to Cineflix Bot API endpoints.' });
  }
  next();
};

// REST API Endpoints for Web Dashboard & Pairing
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
