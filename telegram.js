const API = 'https://api.telegram.org';
const XABAR_CHEGARASI = 4096;

export class TelegramXatosi extends Error {
  constructor(kod, tavsif, kutishSoniyasi) {
    super(`Telegram xatosi ${kod}: ${tavsif}`);
    this.kod = kod;
    this.kutishSoniyasi = kutishSoniyasi;
  }
}

// Uzun matnni Telegram chegarasiga sig'adigan bo'laklarga qatorlar bo'yicha ajratadi.
export function bolakla(matn, chegara = XABAR_CHEGARASI) {
  const bolaklar = [];
  let joriy = '';
  for (const qator of matn.split('\n')) {
    const yangi = joriy === '' ? qator : `${joriy}\n${qator}`;
    if (yangi.length > chegara && joriy !== '') {
      bolaklar.push(joriy);
      joriy = qator;
    } else {
      joriy = yangi;
    }
  }
  bolaklar.push(joriy);
  return bolaklar;
}

export function telegramMijozi(token) {
  async function sorov(metod, malumot, signal, kutishMs = 15_000) {
    const vaqtTugashi = AbortSignal.timeout(kutishMs);
    const javob = await fetch(`${API}/bot${token}/${metod}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(malumot),
      signal: signal ? AbortSignal.any([signal, vaqtTugashi]) : vaqtTugashi,
    });
    const natija = await javob.json();
    if (!natija.ok) {
      throw new TelegramXatosi(natija.error_code, natija.description, natija.parameters?.retry_after);
    }
    return natija.result;
  }

  async function bittaXabar(chatId, text) {
    try {
      await sorov('sendMessage', { chat_id: chatId, text });
    } catch (xato) {
      if (!(xato instanceof TelegramXatosi) || !xato.kutishSoniyasi) {
        throw xato;
      }
      await new Promise((tugadi) => setTimeout(tugadi, xato.kutishSoniyasi * 1000));
      await sorov('sendMessage', { chat_id: chatId, text });
    }
  }

  return {
    yangiliklar: (offset, kutishSoniyasi, signal) =>
      sorov(
        'getUpdates',
        { offset, timeout: kutishSoniyasi, allowed_updates: ['message'] },
        signal,
        (kutishSoniyasi + 10) * 1000,
      ),
    async xabarYubor(chatId, matn) {
      for (const bolak of bolakla(matn)) {
        await bittaXabar(chatId, bolak);
      }
    },
  };
}
