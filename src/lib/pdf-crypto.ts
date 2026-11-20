/**
 * PDF standard security, revision 3 (128-bit RC4).
 * Enough for a viewer to ask for a password. It is not modern encryption,
 * and a determined attacker can still attack the file offline.
 */

const PAD = new Uint8Array([
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41, 0x64, 0x00, 0x4e, 0x56, 0xff, 0xfa, 0x01, 0x08,
  0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80, 0x2f, 0x0c, 0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a,
]);

const MD5_SHIFTS = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14,
  20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6,
  10, 15, 21,
];

function md5Constants(): Uint32Array {
  const table = new Uint32Array(64);
  for (let i = 0; i < 64; i++) table[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000);
  return table;
}

const MD5_K = md5Constants();

export function md5(message: Uint8Array): Uint8Array {
  const length = message.length;
  const bitLength = length * 8;
  const paddedLength = ((length + 8) >> 6 << 6) + 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(message);
  padded[length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, bitLength >>> 0, true);
  view.setUint32(paddedLength - 4, Math.floor(bitLength / 0x100000000), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;
  const words = new Uint32Array(16);

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let i = 0; i < 16; i++) words[i] = view.getUint32(offset + i * 4, true);
    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;
    for (let i = 0; i < 64; i++) {
      let f = 0;
      let g = 0;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) & 15;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) & 15;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) & 15;
      }
      const sum = (f + a + MD5_K[i] + words[g]) >>> 0;
      const rotated = ((sum << MD5_SHIFTS[i]) | (sum >>> (32 - MD5_SHIFTS[i]))) >>> 0;
      a = d;
      d = c;
      c = b;
      b = (b + rotated) >>> 0;
    }
    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  const digest = new Uint8Array(16);
  const out = new DataView(digest.buffer);
  out.setUint32(0, a0, true);
  out.setUint32(4, b0, true);
  out.setUint32(8, c0, true);
  out.setUint32(12, d0, true);
  return digest;
}

export function rc4(key: Uint8Array, data: Uint8Array): Uint8Array {
  const s = new Uint8Array(256);
  for (let i = 0; i < 256; i++) s[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key[i % key.length]) & 255;
    const swap = s[i];
    s[i] = s[j];
    s[j] = swap;
  }
  const out = new Uint8Array(data.length);
  let i = 0;
  j = 0;
  for (let k = 0; k < data.length; k++) {
    i = (i + 1) & 255;
    j = (j + s[i]) & 255;
    const swap = s[i];
    s[i] = s[j];
    s[j] = swap;
    out[k] = data[k] ^ s[(s[i] + s[j]) & 255];
  }
  return out;
}

/** Same byte mapping PDF.js uses for revision 2–4 passwords: one byte per character. */
export function passwordBytes(password: string): Uint8Array {
  const out = new Uint8Array(password.length);
  for (let i = 0; i < password.length; i++) out[i] = password.charCodeAt(i) & 0xff;
  return out;
}

export function padPassword(password: Uint8Array): Uint8Array {
  const out = new Uint8Array(32);
  const n = Math.min(32, password.length);
  out.set(password.subarray(0, n));
  out.set(PAD.subarray(0, 32 - n), n);
  return out;
}

function xorKey(key: Uint8Array, round: number): Uint8Array {
  const out = new Uint8Array(key.length);
  for (let i = 0; i < key.length; i++) out[i] = key[i] ^ round;
  return out;
}

/** Algorithm 3: owner key, with the owner password equal to the user password. */
export function ownerKey(password: Uint8Array): Uint8Array {
  const padded = padPassword(password);
  let hash = md5(padded);
  for (let i = 0; i < 50; i++) hash = md5(hash);
  const key = hash.subarray(0, 16);
  let value = padPassword(password);
  value = rc4(key, value);
  for (let round = 1; round <= 19; round++) value = rc4(xorKey(key, round), value);
  return value;
}

/** Algorithm 2: file encryption key. Permissions are the signed integer stored in /P. */
export function fileKey(password: Uint8Array, owner: Uint8Array, permissions: number, fileId: Uint8Array): Uint8Array {
  const padded = padPassword(password);
  const material = new Uint8Array(padded.length + owner.length + 4 + fileId.length);
  material.set(padded, 0);
  material.set(owner, padded.length);
  const view = new DataView(material.buffer);
  view.setInt32(padded.length + owner.length, permissions, true);
  material.set(fileId, padded.length + owner.length + 4);
  let hash = md5(material);
  for (let i = 0; i < 50; i++) hash = md5(hash.subarray(0, 16));
  return hash.subarray(0, 16);
}

/** Algorithm 5, revision 3: 16-byte user check, padded to 32 bytes. */
export function userKey(encryptionKey: Uint8Array, fileId: Uint8Array): Uint8Array {
  const material = new Uint8Array(32 + fileId.length);
  material.set(PAD, 0);
  material.set(fileId, 32);
  let value = md5(material);
  value = rc4(encryptionKey, value);
  for (let round = 1; round <= 19; round++) value = rc4(xorKey(encryptionKey, round), value);
  const out = new Uint8Array(32);
  out.set(value);
  return out;
}

/** Algorithm 1: per-object RC4 key. */
export function objectKey(encryptionKey: Uint8Array, objectNumber: number, generation: number): Uint8Array {
  const extra = new Uint8Array(encryptionKey.length + 5);
  extra.set(encryptionKey);
  extra[encryptionKey.length] = objectNumber & 255;
  extra[encryptionKey.length + 1] = (objectNumber >>> 8) & 255;
  extra[encryptionKey.length + 2] = (objectNumber >>> 16) & 255;
  extra[encryptionKey.length + 3] = generation & 255;
  extra[encryptionKey.length + 4] = (generation >>> 8) & 255;
  return md5(extra).subarray(0, Math.min(encryptionKey.length + 5, 16));
}

export function toHex(bytes: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
  return hex.toUpperCase();
}
