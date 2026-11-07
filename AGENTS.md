# Hamyon bot: loyiha qoidalari

Telegram bot xarajatlarni yozib boradi. Foydalanuvchi «45000 tushlik» yozsa, xarajat saqlanadi.

## Texnik cheklovlar

- Faqat Node.js (22.13 yoki yangiroq) va uning ichki modullari. **Kutubxona o'rnatilmaydi:** `package.json` da `dependencies` bo'lmaydi.
- Baza: `node:sqlite`, `xarajat.db` fayli, `xarajatlar` jadvali.
- Telegram API bilan ichki `fetch` orqali, long polling (`getUpdates`) bilan ishlanadi.
- Kod ES modul (`import`) ko'rinishida yoziladi. Nomlar va foydalanuvchiga chiqadigan matnlar o'zbekcha (lotin).

## Fayllar

| Fayl | Vazifasi |
|---|---|
| `bot.js` | Kirish nuqtasi: tokenni o'qiydi, xabarlarni kutadi, javob yuboradi |
| `telegram.js` | Telegram API so'rovlari va uzun matnni bo'laklash |
| `baza.js` | Barcha SQL shu yerda |
| `tahlil.js` | Xarajat matnini summa va izohga ajratish |
| `buyruqlar.js` | Buyruqlar va javob matnlari; tarmoqqa chiqmaydi |

## Xulq-atvor qoidalari

- **Ajratilganlik:** har bir SQL so'rov `user_id` bo'yicha cheklanadi. Foydalanuvchi boshqa birovning xarajatini ko'rmaydi va o'chira olmaydi.
- **Chatlar:** bot faqat shaxsiy chatda ishlaydi; guruh xabarlari e'tiborsiz qoldiriladi.
- **Vaqt:** sana hamisha `Asia/Tashkent` bo'yicha, `YYYY-MM-DD HH:MM:SS` matni sifatida saqlanadi.
- **Summa:** butun son, so'mda, 1 dan 1 000 000 000 000 gacha.
- **Izoh:** kichik harflarga o'tkaziladi, ko'pi bilan 200 belgi; bo'sh bo'lsa «boshqa».
- **Matn formati:** `45000 tushlik`, `45 000 tushlik`, `45000` qabul qilinadi. `tushlik 45000`, manfiy, nol va kasr rad etiladi.
- **Buyruqlar:**
  - `/start`: qisqa yo'riqnoma.
  - `/bugun`: bugungi har bir xarajat (raqami bilan) va jami.
  - `/oy`: joriy kalendar oy jami va izohlar bo'yicha yig'indi.
  - `/ochir 12`: 12-raqamli xarajatni o'chiradi.
- Javoblar `parse_mode` siz, oddiy matn sifatida yuboriladi, chunki izohda foydalanuvchi matni bor.

## Maxfiylik

- `BOT_TOKEN` faqat `.env` da turadi. Uni kodga, logga yoki javoblarga chiqarmang.
- `.env` va `xarajat.db` Git'ga qo'shilmaydi. Yangi sozlama qo'shilsa, `.env.example` ham yangilanadi.

## Tekshirish

- O'zgarishdan keyin `npm test` ishlatiladi. Testlar tarmoqqa chiqmaydi va vaqtinchalik (`:memory:`) bazada ishlaydi.
- Yangi qoida yoki buyruq qo'shilsa, unga test ham yoziladi.
- Botni ishga tushirish: `npm start`.
