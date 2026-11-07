import { NAMUNA, xarajatniAjrat } from './tahlil.js';

const OYLAR = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
];

const YORIQNOMA = `Salom! Men Hamyon botman, xarajatlaringizni hisoblab boraman.

${NAMUNA}

Buyruqlar:
/bugun - bugungi xarajatlar
/oy - shu oy hisoboti
/ochir 12 - 12-raqamli xarajatni o'chirish`;

const toshkentFormati = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tashkent',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

// Natija: 'YYYY-MM-DD HH:MM:SS', Toshkent vaqti bilan.
export function toshkentVaqti(sana = new Date()) {
  const q = Object.fromEntries(toshkentFormati.formatToParts(sana).map((p) => [p.type, p.value]));
  return `${q.year}-${q.month}-${q.day} ${q.hour}:${q.minute}:${q.second}`;
}

function somda(summa) {
  return `${String(summa).replace(/\B(?=(\d{3})+$)/g, ' ')} so'm`;
}

function jamisi(qatorlar, ustun) {
  return qatorlar.reduce((yigindi, qator) => yigindi + qator[ustun], 0);
}

function bugun(baza, userId, vaqt) {
  const kun = vaqt.slice(0, 10);
  const xarajatlar = baza.kunlik(userId, kun);
  if (xarajatlar.length === 0) {
    return 'Bugun xarajat yozilmagan.';
  }

  const qatorlar = xarajatlar.map(
    (x) => `#${x.id} | ${x.sana.slice(11, 16)} | ${somda(x.summa)} | ${x.izoh}`,
  );
  return [`Bugungi xarajatlar (${kun}):`, ...qatorlar, '', `Jami: ${somda(jamisi(xarajatlar, 'summa'))}`].join('\n');
}

function oy(baza, userId, vaqt) {
  const [yil, oyRaqami] = vaqt.split('-');
  const nomi = `${yil}-yil ${OYLAR[Number(oyRaqami) - 1]}`;
  const guruhlar = baza.oylik(userId, `${yil}-${oyRaqami}`);
  if (guruhlar.length === 0) {
    return `${nomi}: xarajat yozilmagan.`;
  }

  const qatorlar = guruhlar.map((g) => `${g.izoh}: ${somda(g.jami)}`);
  return [`${nomi}:`, ...qatorlar, '', `Jami: ${somda(jamisi(guruhlar, 'jami'))}`].join('\n');
}

function ochir(baza, userId, argument) {
  if (!/^\d+$/.test(argument)) {
    return "Raqamini ham yozing, masalan: /ochir 12\nRaqamlarni /bugun ko'rsatadi.";
  }
  const ochirilgan = baza.ochirish(Number(argument), userId);
  if (!ochirilgan) {
    return `#${argument} raqamli xarajatingiz topilmadi.`;
  }
  return `O'chirildi: #${ochirilgan.id} | ${somda(ochirilgan.summa)} | ${ochirilgan.izoh}`;
}

function xarajatYoz(baza, userId, matn, vaqt) {
  const natija = xarajatniAjrat(matn);
  if (natija.xato) {
    return natija.xato;
  }
  const id = baza.qoshish(userId, natija.summa, natija.izoh, vaqt);
  return `Yozildi: #${id} | ${somda(natija.summa)} | ${natija.izoh}`;
}

// Kelgan matnga javob matnini qaytaradi. /bugun@botnomi ko'rinishi ham tushuniladi.
export function javobTayyorla(baza, userId, matn, vaqt = toshkentVaqti()) {
  const buyruq = matn.trim().match(/^\/([a-z_]+)(?:@\w+)?(?:\s+(.*))?$/isu);
  if (!buyruq) {
    return xarajatYoz(baza, userId, matn, vaqt);
  }

  const argument = (buyruq[2] ?? '').trim();
  switch (buyruq[1].toLowerCase()) {
    case 'start':
      return YORIQNOMA;
    case 'bugun':
      return bugun(baza, userId, vaqt);
    case 'oy':
      return oy(baza, userId, vaqt);
    case 'ochir':
      return ochir(baza, userId, argument);
    default:
      return `Bunday buyruq yo'q.\n\n${YORIQNOMA}`;
  }
}
