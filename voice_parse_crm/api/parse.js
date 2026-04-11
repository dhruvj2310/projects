// api/parse.js — Vercel Serverless Function
// This file runs on the SERVER. Your API key never reaches the browser.

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { note } = req.body;
  if (!note || typeof note !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid note' });
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const prompt = `You are a CRM data extractor. Today is ${dateStr}.

Extract structured data from this field note and respond ONLY with valid JSON, no markdown, no explanation:

Note: "${note.replace(/"/g, "'")}"

Return this exact JSON structure:
{
  "name": "Contact full name",
  "company": "Company or context if mentioned, else empty string",
  "task": "Key action item — what needs to be done",
  "details": "Quantity, units, or specific details if mentioned",
  "deadline": "Human-readable date like 'Tuesday Apr 15' or 'Tomorrow' or 'Next week'",
  "deadlineDays": <number of days from today — 0=today, 1=tomorrow, 99=no deadline>,
  "followUp": <true if follow-up is mentioned, else false>,
  "priority": "<high if deadline within 2 days | med if within 7 days | low otherwise>",
  "rawNote": "${note.replace(/"/g, "'")}"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,   // ← set this in Vercel dashboard
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return res.status(502).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Parse error:', err);
    return res.status(500).json({ error: 'Failed to parse note' });
  }
}
