const DERIV_CLIENT_ID = process.env.DERIV_CLIENT_ID || '3434BczOPNUZyjY9I841d';
const DERIV_ACCOUNTS_URL = 'https://api.derivws.com/trading/v1/options/accounts';

export default {
  async fetch(request) {
    if (request.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405 });
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) return Response.json({ error: 'Missing Deriv access token.' }, { status: 401 });
    const upstream = await fetch(DERIV_ACCOUNTS_URL, { headers: { Accept: 'application/json', Authorization: authorization, 'Deriv-App-ID': DERIV_CLIENT_ID } });
    const body = await upstream.text();
    return new Response(body, { status: upstream.status, headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json', 'Cache-Control': 'no-store' } });
  },
};
