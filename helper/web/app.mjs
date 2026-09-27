import { ORIGIN, identity, controller, validateChallenge } from '/security.mjs';
const $ = id => document.getElementById(id);
let csrf, pending, expires = 0, lastRequest = 0, working = false, timer;
const status = message => { $('status').textContent = message; };
function clearToken() { $('token').value = ''; $('copy').disabled = true; expires = 0; clearInterval(timer); $('expiry').textContent = 'No active token on this page.'; }
function clearPending() { pending = undefined; $('message').value = ''; $('signature').value = ''; $('sign').disabled = true; $('submit').disabled = true; $('purpose').textContent = 'No signature requested.'; }
async function call(path, body) {
  const wait = 2150 - (Date.now() - lastRequest);
  if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
  lastRequest = Date.now();
  const response = await fetch(path, { method: 'POST', headers: { 'content-type':'application/json', 'x-noesis-csrf':csrf }, body: JSON.stringify(body), cache:'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.code || 'REQUEST_FAILED');
  return data;
}
async function action(fn) {
  if (working) return;
  working = true;
  try { await fn(); } catch (error) {
    const safe = typeof error.message === 'string' && /^[A-Z0-9_]{1,80}$/.test(error.message) ? error.message : 'Wallet or network request failed or was declined.';
    status(safe + ' Read the troubleshooting guide before retrying.');
  } finally { working = false; }
}
$('connect').onclick = () => action(async () => {
  if (!window.ethereum?.request) throw new Error('OPEN_IN_A_WALLET_ENABLED_BROWSER');
  const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
  $('wallet').value = controller(accounts[0]); clearPending();
  status('Wallet connected. Enter your NFT ID, then prepare research access.');
});
async function prepare(kind) {
  clearPending();
  const expectedIdentity = identity($('agent').value.trim()), expectedController = controller($('wallet').value.trim());
  const result = await call('/local/prepare', { kind, agentId: expectedIdentity.agentId, controller: expectedController });
  if (JSON.stringify(result.expected.identity) !== JSON.stringify(expectedIdentity) || result.expected.controller !== expectedController || result.expected.kind !== kind) throw new Error('UNSAFE_RESPONSE');
  validateChallenge(result.challenge, result.expected);
  pending = result;
  $('message').value = result.challenge.message;
  $('purpose').textContent = (kind === 'enroll' ? 'Enroll this existing NFT with NOESIS. ' : 'Allow research reads for 15 minutes. ') + 'Challenge expires: ' + result.challenge.expiresAt;
  $('sign').disabled = false; $('submit').disabled = false;
  status('Review the exact message, NFT ID, holder, service origin and scope before signing.');
}
$('prepare').onclick = () => action(() => prepare('research'));
$('enroll').onclick = () => action(() => prepare('enroll'));
async function complete(signature) {
  if (!pending) throw new Error('PREPARE_A_NEW_CHALLENGE');
  validateChallenge(pending.challenge, pending.expected);
  const result = await call('/local/complete', { challengeId: pending.challenge.challengeId, signature });
  clearPending();
  if (result.enrolled) { status('Enrollment accepted. Now prepare research access.'); return; }
  clearToken(); $('token').value = result.accessToken; expires = Date.parse(result.expiresAt); $('copy').disabled = false;
  $('expiry').textContent = 'Expires: ' + result.expiresAt + '. No automatic renewal.';
  timer = setInterval(() => { if (Date.now() >= expires) { clearToken(); status('Token expired. Prepare a new research session.'); } }, 1000);
  status('Copy the token into the secure connector credential field in Muse, never into chat.');
}
$('sign').onclick = () => action(async () => {
  if (!pending || !window.ethereum?.request) throw new Error('PREPARE_A_CHALLENGE_AND_CONNECT_WALLET');
  validateChallenge(pending.challenge, pending.expected);
  const accounts = await window.ethereum.request({method:'eth_accounts'});
  if (!accounts.length || controller(accounts[0]) !== pending.expected.controller) throw new Error('WALLET_CHANGED');
  // personal_sign accepts hexadecimal encoding of the message bytes, not a hash.
  const bytes = new TextEncoder().encode(pending.challenge.message);
  const hex = '0x' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  const signature = await window.ethereum.request({method:'personal_sign',params:[hex,pending.expected.controller]});
  await complete(signature);
});
$('submit').onclick = () => action(() => complete($('signature').value.trim()));
$('copy').onclick = () => action(async () => {
  if (!expires || Date.now() >= expires) { clearToken(); throw new Error('TOKEN_EXPIRED'); }
  await navigator.clipboard.writeText($('token').value);
  status('Copied. Paste only into the secure connector credential field. Clear your clipboard afterwards.');
});
$('revoke').onclick = () => action(async () => {
  await call('/local/logout', {}); clearPending(); clearToken();
  status('Access revoked. Remove the old credential from Muse and clear your clipboard.');
});
for (const id of ['agent','wallet']) $(id).addEventListener('input', clearPending);
window.addEventListener('pagehide', () => { clearPending(); clearToken(); });
try {
  const response = await fetch('/local/config', {cache:'no-store'}), config = await response.json();
  if (!response.ok || config.serviceOrigin !== ORIGIN || !/^[a-f0-9]{64}$/.test(config.csrf)) throw new Error();
  csrf = config.csrf; status('Ready. Connect your wallet or enter the current holder address.');
} catch { status('Local helper unavailable. Restart it and open the printed address.'); }
