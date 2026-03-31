export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ errore: "Metodo non consentito" });
  }

  const { domanda, dati } = req.body;

  const risposta = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `${domanda}\n\nDati: ${JSON.stringify(dati)}`
      }]
    })
  });

  const data = await risposta.json();
  res.status(200).json({ 
    risposta: data.content[0].text 
  });
}
