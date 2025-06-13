import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    const params = new URLSearchParams({
      client_id: '1383108267420553246',
      client_secret: 'EfKWFW1jtqWMOwGFwUdcYTXlGdSosqu8',
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'https://o-auth2-tan.vercel.app/api/callback',
    });

    // Exchange code for access token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokenJson = await tokenRes.json();
    const access_token = tokenJson.access_token;

    if (!access_token) {
      return res.status(400).json({ error: 'Failed to get access token' });
    }

    // Get user info
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userJson = await userRes.json();
    const username = `${userJson.username}#${userJson.discriminator}`;

    // Send to webhook
    const webhookURL = 'https://discord.com/api/webhooks/1335480654921469962/f1Aixgi0LwOK9iG690d2gMJNNQLXa9LtTw6nVnbPJtcgewKTk4b0B2OqkntLaDDFgQpA';
    await fetch(webhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: `User authorized: ${username}` }),
    });

    // Send success response
    res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
