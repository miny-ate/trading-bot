// Design philosophy: keep OAuth mechanics invisible and calm — the Ernest landing page remains focused while secure redirect state is handled deterministically.

export const DERIV_AUTHORIZATION_ENDPOINT = "https://auth.deriv.com/oauth2/auth";
export const DERIV_CLIENT_ID = import.meta.env.VITE_DERIV_CLIENT_ID || "3434Bcz0PN0zjyY91841d";
export const DERIV_REDIRECT_URI = "https://ernest.co.ke";
export const DERIV_SCOPE = "trade payment";
export const OAUTH_REQUEST_STORAGE_KEY = "ernest_deriv_oauth_request";

const RANDOM_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
function randomString(length: number) { const values = new Uint8Array(length); crypto.getRandomValues(values); return Array.from(values, (value) => RANDOM_ALPHABET[value % RANDOM_ALPHABET.length]).join(""); }
function base64UrlEncode(bytes: Uint8Array) { let binary = ""; bytes.forEach((byte: number) => { binary += String.fromCharCode(byte); }); return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
async function createCodeChallenge(verifier: string) { const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)); return base64UrlEncode(new Uint8Array(digest)); }

export async function beginDerivOAuth({ signup = false } = {}) {
  if (!crypto?.subtle) throw new Error("Secure OAuth is not available in this browser.");
  const codeVerifier = randomString(64);
  const state = randomString(32);
  const codeChallenge = await createCodeChallenge(codeVerifier);
  sessionStorage.setItem(OAUTH_REQUEST_STORAGE_KEY, JSON.stringify({ state, codeVerifier, redirectUri: DERIV_REDIRECT_URI, createdAt: Date.now() }));
  const params = new URLSearchParams({ response_type: "code", client_id: DERIV_CLIENT_ID, redirect_uri: DERIV_REDIRECT_URI, scope: DERIV_SCOPE, state, code_challenge: codeChallenge, code_challenge_method: "S256" });
  if (signup) params.set("prompt", "registration");
  window.location.assign(`${DERIV_AUTHORIZATION_ENDPOINT}?${params.toString()}`);
}

export function getStoredOAuthRequest() {
  try { const raw = sessionStorage.getItem(OAUTH_REQUEST_STORAGE_KEY); if (!raw) return null; const parsed = JSON.parse(raw); if (!parsed.state || !parsed.codeVerifier || !parsed.redirectUri) return null; return parsed; } catch { return null; }
}
export function clearOAuthRequest() { sessionStorage.removeItem(OAUTH_REQUEST_STORAGE_KEY); }
