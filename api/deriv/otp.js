const DERIV_CLIENT_ID = '3434BczOPNUZyjY9I841d';
const DERIV_OTP_BASE = 'https://api.derivws.com/trading/v1/options/accounts';

export default {
  async fetch(request) {
    if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) return Response.json({ error: 'Missing Deriv access token.' }, { status: 401 });
    let payload;
    try { payload = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body.' }, { status: 400 }); }
    const accountId = typeof payload?.account_id === 'string' ? payload.account_id.trim() : '';
    if (!accountId || !/^[A-Za-z0-9_-]{4,64}$/.test(accountId)) return Response.json({ error: 'A valid Deriv account_id is required.' }, { status: 400 });
    const upstream = await fetch(`${DERIV_OTP_BASE}/${encodeURIComponent(accountId)}/otp`, { method: 'POST', headers: { Accept: 'application/json', Authorization: authorization, 'Deriv-App-ID': DERIV_CLIENT_ID } });
    const body = await upstream.text();
    return new Response(body, { status: upstream.status, headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json', 'Cache-Control': 'no-store' } });
  },
};
