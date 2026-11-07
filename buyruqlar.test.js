import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { bazaniOch } from './baza.js';
import { javobTayyorla, toshkentVaqti } from './buyruqlar.js';
import { bolakla } from './telegram.js';

const ALI = 111;
const VALI = 222;
const VAQT = '2026-11-04 14:30:00';
let baza;

beforeEach(() => {
  baza = bazaniOch(':memory:');
});

test("toshkentVaqti UTC+5 ga o'tkazadi va kun chegarasini to'g'ri oladi", () => {
  assert.equal(toshkentVaqti(new Date('2026-11-04T20:00:00Z')), '2026-11-05 01:00:00');
  assert.equal(toshkentVaqti(new Date('2026-12-31T19:00:00Z')), '2027-01-01 00:00:00');
});

test("xarajat yoziladi va /bugun ro'yxat bilan jamini ko'rsatadi", () => {
  assert.equal(javobTayyorla(baza, ALI, '45000 tushlik', VAQT), "Yozildi: #1 | 45 000 so'm | tushlik");
  javobTayyorla(baza, ALI, '5000', VAQT);
  const javob = javobTayyorla(baza, ALI, '/bugun', VAQT);
  assert.match(javob, /#1 \| 14:30 \| 45 000 so'm \| tushlik/);
  assert.match(javob, /#2 \| 14:30 \| 5 000 so'm \| boshqa/);
  assert.match(javob, /Jami: 50 000 so'm/);
});

test("/bugun boshqa kunni qo'shmaydi", () => {
  javobTayyorla(baza, ALI, '1000 kecha', '2026-11-03 23:59:59');
  assert.equal(javobTayyorla(baza, ALI, '/bugun', VAQT), 'Bugun xarajat yozilmagan.');
});

test("/oy joriy oyni izohlar bo'yicha yig'adi", () => {
  javobTayyorla(baza, ALI, '10000 Non', '2026-11-01 00:00:00');
  javobTayyorla(baza, ALI, '20000 non', '2026-11-04 10:00:00');
  javobTayyorla(baza, ALI, '50000 taksi', '2026-11-04 11:00:00');
  javobTayyorla(baza, ALI, '999000 eski', '2026-10-31 23:59:59');
  assert.equal(
    javobTayyorla(baza, ALI, '/oy', VAQT),
    "2026-yil noyabr:\ntaksi: 50 000 so'm\nnon: 30 000 so'm\n\nJami: 80 000 so'm",
  );
});

test("foydalanuvchilar bir-birining xarajatini ko'rmaydi", () => {
  javobTayyorla(baza, ALI, '45000 tushlik', VAQT);
  assert.equal(javobTayyorla(baza, VALI, '/bugun', VAQT), 'Bugun xarajat yozilmagan.');
  assert.equal(javobTayyorla(baza, VALI, '/oy', VAQT), '2026-yil noyabr: xarajat yozilmagan.');
});

test("/ochir faqat o'z xarajatini o'chiradi", () => {
  javobTayyorla(baza, ALI, '45000 tushlik', VAQT);
  assert.match(javobTayyorla(baza, VALI, '/ochir 1', VAQT), /topilmadi/);
  assert.match(javobTayyorla(baza, ALI, '/bugun', VAQT), /tushlik/);

  assert.equal(javobTayyorla(baza, ALI, '/ochir 1', VAQT), "O'chirildi: #1 | 45 000 so'm | tushlik");
  assert.equal(javobTayyorla(baza, ALI, '/bugun', VAQT), 'Bugun xarajat yozilmagan.');
  assert.match(javobTayyorla(baza, ALI, '/ochir 1', VAQT), /topilmadi/);
});

test("/ochir noto'g'ri argumentda hech narsani o'chirmaydi", () => {
  javobTayyorla(baza, ALI, '45000 tushlik', VAQT);
  for (const matn of ['/ochir', '/ochir abc', '/ochir -1', '/ochir 1 OR 1=1']) {
    assert.match(javobTayyorla(baza, ALI, matn, VAQT), /masalan: \/ochir 12/);
  }
  assert.match(javobTayyorla(baza, ALI, '/ochir 99999999999999999999', VAQT), /topilmadi/);
  assert.match(javobTayyorla(baza, ALI, '/bugun', VAQT), /tushlik/);
});

test('buyruqlar xarajat sifatida yozilmaydi', () => {
  assert.match(javobTayyorla(baza, ALI, '/start', VAQT), /Hamyon/);
  assert.match(javobTayyorla(baza, ALI, '/nomalum', VAQT), /Bunday buyruq yo'q/);
  assert.match(javobTayyorla(baza, ALI, '/BUGUN@hamyon_bot', VAQT), /yozilmagan/);
  assert.equal(baza.kunlik(ALI, '2026-11-04').length, 0);
});

test('izohdagi SQL matni oddiy matn sifatida saqlanadi', () => {
  javobTayyorla(baza, ALI, "100 '; drop table xarajatlar; --", VAQT);
  assert.match(javobTayyorla(baza, ALI, '/bugun', VAQT), /drop table xarajatlar/);
});

test('bolakla uzun matnni qatorlarini buzmasdan ajratadi', () => {
  const qatorlar = Array.from({ length: 500 }, (_, i) => `#${i} ${'x'.repeat(50)}`);
  const matn = qatorlar.join('\n');
  const bolaklar = bolakla(matn);
  assert.ok(bolaklar.length > 1);
  assert.ok(bolaklar.every((b) => b.length <= 4096));
  assert.equal(bolaklar.join('\n'), matn);
  assert.deepEqual(bolakla('qisqa'), ['qisqa']);
});
