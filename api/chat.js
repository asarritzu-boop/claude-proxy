export default async function handler(req, res) {
  // 1. Recuperiamo il prompt che arriva dal tuo HTML
  const { prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  try {
    // 2. Chiamiamo l'API di Gemini (Modello Flash, veloce e gratuito)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    
    // 3. Estraiamo solo il testo della risposta
    const textOutput = data.candidates[0].content.parts[0].text;

    // 4. Rimandiamo il testo al tuo sito
    res.status(200).json({ risposta: textOutput });

  } catch (error) {
    res.status(500).json({ error: "Errore nella comunicazione con Gemini" });
  }
}
