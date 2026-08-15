# 🚀 Cineflix WhatsApp Bot - Heroku & Pairing Code Setup Guide

මෙම **WhatsApp Movie Downloader Bot** එක **Heroku** තුළ සාර්ථකව host කර, **Pairing Code (8-Digit Code)** එකක් මඟින් QR scan නොකරම ඉතා පහසුවෙන් ඔබගේ WhatsApp එකට සම්බන්ධ කරගත හැක.

---

## 📱 Pairing Code මඟින් WhatsApp එකට සම්බන්ධ කිරීම (How Pairing Code Works)

1. Heroku හි Bot එක deploy කළ පසු, ඔබගේ Heroku App URL එක open කරන්න (උදා: `https://your-cineflix-bot.herokuapp.com`).
2. එහි ඇති **WhatsApp Pairing Dashboard** වෙබ් පිටුවේ ඔබගේ WhatsApp දුරකථන අංකය (උදා: `94771234567`) ඇතුළත් කර **"Get WhatsApp Pairing Code"** button එක ක්ලික් කරන්න.
3. ඔබට ඉලක්කම් 8ක **Pairing Code** එකක් (උදා: `ABCD-1234`) ලැබෙනු ඇත.
4. ඔබගේ ජංගම දුරකථනයේ **WhatsApp -> Settings -> Linked Devices -> Link a Device -> "Link with phone number instead"** තෝරා අදාළ Pairing Code එක ලබා දෙන්න!

---

## ☁️ Heroku හි Deploy කරන ආකාරය (How to Deploy to Heroku)

### 1. Requirements:
- [Heroku Account](https://heroku.com)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) හෝ GitHub Repo Integration

### 2. Deployment via Heroku CLI (Terminal එකෙන් deploy කිරීමට):

```bash
cd "bot code"

# Heroku වෙත login වීම
heroku login

# නව Heroku App එකක් සෑදීම
heroku create cineflix-whatsapp-bot

# Heroku වෙත code එක push කිරීම
git init
git add .
git commit -m "Deploy Cineflix WhatsApp Bot with Pairing Code"
heroku git:remote -a cineflix-whatsapp-bot
git push heroku main
```

---

## 🍃 MongoDB Database භාවිතා කිරීම (MongoDB Setup)

ඔබට MongoDB Database එකක් සම්බන්ධ කිරීමට අවශ්‍ය නම්:

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) හි free cluster එකක් සාදා connection string එක ගන්න (e.g. `mongodb+srv://username:password@cluster0.mongodb.net/cineflix_bot?retryWrites=true&w=majority`).
2. Heroku Dashboard එකේ **Settings -> Config Vars** වෙත ගොස්:
   - **Key**: `MONGODB_URI`
   - **Value**: `ඔබගේ_MONGODB_CONNECTION_STRING`
3. ඔබ MongoDB URI ලබා නොදුන්නද, bot එක auto built-in storage (Local JSON file system) එක භාවිතයෙන් 100% නිවැරදිව වැඩ කරයි!

---

## 🌐 Movie Website on Vercel

ඔබගේ Movie React Frontend එක **Vercel** හි 1-Click deploy කිරීම සඳහා root directory එකේ [vercel.json](file:///e:/CHAMA%20OFC/new%20movi%20web/vercel.json) සාදා සූදානම් කර ඇත.

1. [Vercel.com](https://vercel.com) වෙත යන්න.
2. Root directory එක හෝ GitHub repository එක import කරන්න.
3. Build Command: `npm run build`, Output Directory: `dist`.
