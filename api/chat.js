export default async function handler(req, res) {
  // 1. Estraiamo tutto ciò che potrebbe arrivare dalle diverse app
  const { domanda, messaggio, dati, prompt } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  // 2. Identifichiamo il testo principale (gestisce nomi di variabili diversi)
  const inputUtente = domanda || messaggio || prompt || "";

  if (!inputUtente && (!dati)) {
    return res.status(400).json({ risposta: "Nessun input ricevuto." });
  }

  // 3. Costruiamo il contesto "Intelligente"
  let promptFinale = "";

  // Se l'app invia i dati dell'archivio (App Congregazione)
  if (dati && (dati.archivio || dati.gruppi || dati.storico)) {
    promptFinale = `
      CONTESTO DATI FORNITI:
      - Archivio: ${JSON.stringify(dati.archivio || [])}
      - Gruppi di Servizio: ${JSON.stringify(dati.gruppi || [])}
      - Storico: ${JSON.stringify(dati.storico || [])}

      Sulla base di questi dati, rispondi alla seguente domanda:
      ${inputUtente}
    `;
  } else {
    // Se è un'altra app senza dati strutturati
    promptFinale = inputUtente;
  }

  try {
    // 4. Chiamata a Gemini 2.5 Flash (Gratuito e veloce)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ text: promptFinale }] 
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          }
        })
      }
    );

    const data = await response.json();

    // 5. Estrazione della risposta e invio all'app
    if (data.candidates && data.candidates[0].content) {
      const testoProdotto = data.candidates[0].content.parts[0].text;
      
      // Rispondiamo con il campo "risposta", così il tuo HTML attuale funziona subito
      res.status(200).json({ risposta: testoProdotto });
    } else {
      console.error("Errore Gemini:", data);
      res.status(500).json({ risposta: "Gemini non ha potuto generare una risposta. Verifica i limiti di quota." });
    }

  } catch (error) {
    console.error("Errore Server:", error);
    res.status(500).json({ risposta: "Errore interno del server durante la richiesta." });
  }
}
