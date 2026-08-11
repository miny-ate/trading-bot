const DERIV_CLIENT_ID = process.env.DERIV_CLIENT_ID || '3434Bcz0PN0zjyY91841d';
const DERIV_REDIRECT_URI = process.env.DERIV_REDIRECT_URI || 'https://ernest.co.ke';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { code, code_verifier, redirect_uri, client_id } = body;
    if (!code || !code_verifier || !redirect_uri || !client_id) return res.status(400).json({ error: 'Missing OAuth callback parameters.' });
    if (client_id !== DERIV_CLIENT_ID || redirect_uri !== DERIV_REDIRECT_URI) return res.status(400).json({ error: 'OAuth client or redirect URI is not configured for this site.' });
    const upstream = await fetch('https://auth.deriv.com/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', client_id: DERIV_CLIENT_ID, code, code_verifier, redirect_uri: DERIV_REDIRECT_URI }) });
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json({ error: data?.error_description || data?.error || 'Deriv token exchange failed.' });
    return res.status(200).json({ access_token: data.access_token, expires_in: data.expires_in, token_type: data.token_type });
  } catch (error) { console.error('OAuth token exchange failed:', error?.message || error); return res.status(500).json({ error: 'OAuth token exchange failed.' }); }
};
