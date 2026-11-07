import { DatabaseSync } from 'node:sqlite';

export function bazaniOch(yol) {
  const db = new DatabaseSync(yol);

  db.exec(`
    CREATE TABLE IF NOT EXISTS xarajatlar (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      summa   INTEGER NOT NULL,
      izoh    TEXT    NOT NULL,
      sana    TEXT    NOT NULL
    );
    CREATE INDEX IF NOT EXISTS xarajatlar_user_sana ON xarajatlar (user_id, sana);
  `);

  const qoshishSorovi = db.prepare(
    'INSERT INTO xarajatlar (user_id, summa, izoh, sana) VALUES (?, ?, ?, ?) RETURNING id',
  );
  const kunlikSorovi = db.prepare(
    'SELECT id, summa, izoh, sana FROM xarajatlar WHERE user_id = ? AND sana GLOB ? ORDER BY sana, id',
  );
  const oylikSorovi = db.prepare(`
    SELECT izoh, SUM(summa) AS jami
    FROM xarajatlar
    WHERE user_id = ? AND sana GLOB ?
    GROUP BY izoh
    ORDER BY jami DESC, izoh
  `);
  const ochirishSorovi = db.prepare(
    'DELETE FROM xarajatlar WHERE id = ? AND user_id = ? RETURNING id, summa, izoh',
  );

  return {
    qoshish: (userId, summa, izoh, sana) => qoshishSorovi.get(userId, summa, izoh, sana).id,
    // kun: 'YYYY-MM-DD'
    kunlik: (userId, kun) => kunlikSorovi.all(userId, `${kun} *`),
    // oy: 'YYYY-MM'
    oylik: (userId, oy) => oylikSorovi.all(userId, `${oy}-*`),
    // O'chirilgan yozuvni qaytaradi; topilmasa yoki boshqa foydalanuvchiniki bo'lsa, undefined.
    ochirish: (id, userId) => ochirishSorovi.get(id, userId),
    yop: () => db.close(),
  };
}
