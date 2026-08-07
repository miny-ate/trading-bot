export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, code_verifier, redirect_uri, client_id } = req.body || {};

    if (!code || !code_verifier || !redirect_uri || !client_id) {
      return res.status(400).json({
        error: 'Missing OAuth callback parameters.'
      });
    }

    const upstream = await fetch(
      'https://auth.deriv.com/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id,
          code,
          code_verifier,
          redirect_uri
        })
      }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error:
          data?.error_description ||
          data?.error ||
          'Deriv token exchange failed.'
      });
    }

    return res.status(200).json({
      access_token: data.access_token,
      expires_in: data.expires_in,
      token_type: data.token_type
    });

  } catch (error) {
    console.error(
      'OAuth token exchange failed:',
      error.message
    );

    return res.status(500).json({
      error: 'OAuth token exchange failed.'
    });
  }
}
