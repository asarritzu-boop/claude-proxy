export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { domanda, dati, systemPrompt } = req.body;  // ← aggiunto systemPrompt
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    res.status(500).json({ risposta: '❌ Chiave API Gemini non configurata nel server.' });
    return;
  }

  const inputUtente = domanda || 'Ciao';

  // Costruisce il prompt finale combinando system + dati + domanda
  let promptFinale = '';
  if (systemPrompt) {
    promptFinale += systemPrompt + '\n\n';
  }
  if (dati && Object.keys(dati).length > 0) {
    promptFinale += `Dati: ${JSON.stringify(dati)}\n\n`;
  }
  promptFinale += `Domanda: ${inputUtente}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptFinale }] }]
        })
      }
    );

    const rawText = await response.text();

    if (!response.ok) {
      let errMsg = `Errore API Gemini: status ${response.status}`;
      try {
        const errJson = JSON.parse(rawText);
        errMsg += ` - ${errJson.error?.message || rawText}`;
      } catch (_) { errMsg += ` - ${rawText.substring(0, 200)}`; }
      res.status(500).json({ risposta: `❌ ${errMsg}` });
      return;
    }

    const result = JSON.parse(rawText);
    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      res.status(200).json({ risposta: result.candidates[0].content.parts[0].text });
    } else {
      res.status(500).json({ risposta: '❌ Risposta Gemini vuota o in formato inatteso.' });
    }

  } catch (error) {
    res.status(500).json({ risposta: '❌ Errore di connessione: ' + error.message });
  }
}
