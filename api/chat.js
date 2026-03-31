export default async function handler(req, res) {
  // --- ABILITA I PERMESSI PER LE APP ESTERNE (CORS) ---
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permette chiamate da qualsiasi sito
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // --- LOGICA GEMINI ---
  const { domanda, dati } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  const inputUtente = domanda || "Ciao";
  let promptFinale = inputUtente;

  if (dati && (dati.archivio || dati.gruppi)) {
    promptFinale = `DATI: ${JSON.stringify(dati)}. DOMANDA: ${inputUtente}`;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptFinale }] }]
        })
      }
    );

    const result = await response.json();
    
    if (result.candidates && result.candidates[0].content) {
      const testo = result.candidates[0].content.parts[0].text;
      res.status(200).json({ risposta: testo });
    } else {
      res.status(500).json({ risposta: "Errore nella risposta di Gemini." });
    }
  } catch (error) {
    res.status(500).json({ risposta: "Errore di connessione al server." });
  }
}
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
