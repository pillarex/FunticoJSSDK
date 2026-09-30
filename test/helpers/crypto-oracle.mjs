// Independent model of the Funtico backend encryption/signing scheme, written with node:crypto.
// It shares nothing with the SDK's Web Crypto CryptoHelper; the SDK must agree with it.
import crypto from 'node:crypto';

export const SERVER_IV = Buffer.from('1234567890123456', 'utf8');

export function serverKey(key) {
  let k = String(key);
  if (k.length > 16) return k.slice(0, 16);
  const pad = k.length > 0 ? k.charAt(0) : '0';
  while (k.length < 16) k += pad;
  return k;
}

export function serverEncrypt(plainText, key) {
  const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(serverKey(key), 'utf8'), SERVER_IV);
  return Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]).toString('base64');
}

/** Throws on a wrong key (on /Rooms/end-room-sp the API then answers HTTP 500 "Padding is invalid and cannot be removed"). */
export function serverDecrypt(base64, key) {
  const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(serverKey(key), 'utf8'), SERVER_IV);
  return Buffer.concat([decipher.update(Buffer.from(base64, 'base64')), decipher.final()]).toString('utf8');
}

export function serverHmac(message, key) {
  return crypto.createHmac('sha256', Buffer.from(key, 'utf8')).update(message, 'utf8').digest('hex');
}

/** Key derivations for the encrypted payloads (EndRoomSP, ResultTournament_Client, CompleteCampaignLevel). */
export function payloadAesKey(id, secretKey) {
  return id.substring(0, 8) + secretKey.substring(0, 8);
}

export function payloadHmacKey(secretKey) {
  return secretKey.substring(8);
}

/** Key for saved-session data. */
export function sessionKey(userId, secretKey) {
  return userId.toString(16).padStart(8, '0') + secretKey.slice(-8);
}
