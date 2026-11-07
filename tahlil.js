export const NAMUNA = 'Xarajatni shunday yozing: 45000 tushlik';

const ENG_KATTA_SUMMA = 1_000_000_000_000;
const ENG_UZUN_IZOH = 200;
const STANDART_IZOH = 'boshqa';

// Summa matn boshida keladi: 45000 yoki minglik bo'shliqlari bilan 45 000.
const FORMAT = /^(\d{1,3}(?:[  ]\d{3})+|\d+)(?:\s+(.+))?$/su;

export function xarajatniAjrat(matn) {
  const mos = matn.trim().match(FORMAT);
  if (!mos) {
    return { xato: `Tushunmadim. ${NAMUNA}` };
  }

  const summa = Number(mos[1].replace(/\D/g, ''));
  if (summa <= 0) {
    return { xato: `Summa noldan katta bo'lishi kerak. ${NAMUNA}` };
  }
  if (summa > ENG_KATTA_SUMMA) {
    return { xato: "Summa juda katta. Eng ko'pi 1 000 000 000 000 so'm." };
  }

  const izoh = (mos[2] ?? STANDART_IZOH).replace(/\s+/g, ' ').trim().toLowerCase();
  if (izoh.length > ENG_UZUN_IZOH) {
    return { xato: `Izoh juda uzun. Eng ko'pi ${ENG_UZUN_IZOH} belgi.` };
  }

  return { summa, izoh };
}
