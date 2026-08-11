const DERIV_CLIENT_ID = process.env.DERIV_CLIENT_ID || '3434BczOPNUZyjY9I841d';
const DERIV_REDIRECT_URI = process.env.DERIV_REDIRECT_URI || 'https://ernest.co.ke';

export default {
  async fetch(request) {
    if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
    try {
      const body = await request.json();
      const { code, code_verifier, redirect_uri, client_id } = body || {};
      if (!code || !code_verifier || !redirect_uri || !client_id) return Response.json({ error: 'Missing OAuth callback parameters.' }, { status: 400 });
      if (client_id !== DERIV_CLIENT_ID || redirect_uri !== DERIV_REDIRECT_URI) return Response.json({ error: 'OAuth client or redirect URI is not configured for this site.' }, { status: 400 });
      const upstream = await fetch('https://auth.deriv.com/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', client_id: DERIV_CLIENT_ID, code, code_verifier, redirect_uri: DERIV_REDIRECT_URI }) });
      const data = await upstream.json();
      if (!upstream.ok) return Response.json({ error: data?.error_description || data?.error || 'Deriv token exchange failed.' }, { status: upstream.status });
      return Response.json({ access_token: data.access_token, expires_in: data.expires_in, token_type: data.token_type });
    } catch (error) { console.error('OAuth token exchange failed:', error?.message || error); return Response.json({ error: 'OAuth token exchange failed.' }, { status: 500 }); }
  },
};
