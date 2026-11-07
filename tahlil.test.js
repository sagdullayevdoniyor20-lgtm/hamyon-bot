import assert from 'node:assert/strict';
import { test } from 'node:test';
import { xarajatniAjrat } from './tahlil.js';

test("to'g'ri formatlar qabul qilinadi", () => {
  assert.deepEqual(xarajatniAjrat('45000 tushlik'), { summa: 45000, izoh: 'tushlik' });
  assert.deepEqual(xarajatniAjrat('45 000 tushlik'), { summa: 45000, izoh: 'tushlik' });
  assert.deepEqual(xarajatniAjrat('1 250 000 ijara haqi'), { summa: 1250000, izoh: 'ijara haqi' });
  assert.deepEqual(xarajatniAjrat('45 000'), { summa: 45000, izoh: 'boshqa' });
  assert.deepEqual(xarajatniAjrat('45000'), { summa: 45000, izoh: 'boshqa' });
});

test('izoh tartibga keltiriladi', () => {
  assert.deepEqual(xarajatniAjrat('  5000   Katta\n  NON '), { summa: 5000, izoh: 'katta non' });
});

test("noto'g'ri formatlar rad etiladi", () => {
  for (const matn of ['tushlik 45000', 'tushlik', '', '-100 non', '0 non', '45000.5 non', '45,5 non']) {
    assert.ok(xarajatniAjrat(matn).xato, `rad etilishi kerak edi: "${matn}"`);
  }
});

test('chegaralar tekshiriladi', () => {
  assert.equal(xarajatniAjrat('1000000000000 uy').summa, 1_000_000_000_000);
  assert.ok(xarajatniAjrat('1000000000001 uy').xato);
  assert.equal(xarajatniAjrat(`1 ${'a'.repeat(200)}`).summa, 1);
  assert.ok(xarajatniAjrat(`1 ${'a'.repeat(201)}`).xato);
});
