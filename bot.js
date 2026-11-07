import { join } from 'node:path';
import { bazaniOch } from './baza.js';
import { javobTayyorla } from './buyruqlar.js';
import { TelegramXatosi, telegramMijozi } from './telegram.js';

const KUTISH_SONIYASI = 30;
const QAYTA_URINISH_MS = 5_000;

function tokenniOl() {
  try {
    process.loadEnvFile(join(import.meta.dirname, '.env'));
  } catch (xato) {
    if (xato.code !== 'ENOENT') throw xato;
  }
  const token = process.env.BOT_TOKEN?.trim();
  if (!token) {
    console.error('BOT_TOKEN topilmadi. @BotFather bergan tokenni .env fayliga yozing: BOT_TOKEN=...');
    process.exit(1);
  }
  return token;
}

function kutish(ms, signal) {
  return new Promise((tugadi) => {
    const taymer = setTimeout(tugadi, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(taymer);
      tugadi();
    }, { once: true });
  });
}

const telegram = telegramMijozi(tokenniOl());
const baza = bazaniOch(join(import.meta.dirname, 'xarajat.db'));
const toxtatish = new AbortController();

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => toxtatish.abort());
}

async function xabarniQaytaIshla(xabar) {
  // Kanal va guruh xabarlari, shuningdek matnsiz xabarlar (rasm va h.k.) e'tiborsiz qoldiriladi.
  if (xabar?.chat?.type !== 'private' || !xabar.from || typeof xabar.text !== 'string') {
    return;
  }
  await telegram.xabarYubor(xabar.chat.id, javobTayyorla(baza, xabar.from.id, xabar.text));
}

async function ishlat() {
  let offset = 0;
  console.log("Hamyon bot ishga tushdi. To'xtatish uchun Ctrl+C.");

  while (!toxtatish.signal.aborted) {
    let yangiliklar;
    try {
      yangiliklar = await telegram.yangiliklar(offset, KUTISH_SONIYASI, toxtatish.signal);
    } catch (xato) {
      if (toxtatish.signal.aborted) break;
      if (xato instanceof TelegramXatosi && xato.kod === 401) {
        console.error("Token noto'g'ri. .env faylidagi BOT_TOKEN ni tekshiring.");
        process.exitCode = 1;
        break;
      }
      console.error(`Xabarlarni olib bo'lmadi: ${xato.message}`);
      const kutishMs = xato.kutishSoniyasi ? xato.kutishSoniyasi * 1000 : QAYTA_URINISH_MS;
      await kutish(kutishMs, toxtatish.signal);
      continue;
    }

    for (const yangilik of yangiliklar) {
      offset = yangilik.update_id + 1;
      try {
        await xabarniQaytaIshla(yangilik.message);
      } catch (xato) {
        // Bitta muammoli xabar qolganlarini to'sib qo'ymasligi kerak.
        console.error(`Xabar ${yangilik.update_id} xatosi: ${xato.message}`);
      }
    }
  }

  // Ishlangan xabarlarni Telegram'ga tasdiqlaymiz: aks holda qayta ishga tushganda xarajat ikki marta yoziladi.
  if (offset > 0) {
    await telegram.yangiliklar(offset, 0).catch(() => {});
  }
  baza.yop();
  console.log("Bot to'xtatildi.");
}

await ishlat();
