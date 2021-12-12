let crypto = require('crypto');

const ALGORITHM = 'aes-256-ctr';
const SECRET = process.env.SECRET_KEY || '12345678901234567890123456789012';
const iv = crypto.randomBytes(16);

export function encrypt(text: String) {
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET, iv);
  const encryptedText = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString('hex')}:${encryptedText.toString('hex')}`;
}

export function decrypt(value: String) {
  const [ivPart, encryptedPart] = value.split(':');
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    SECRET,
    Buffer.from(ivPart, 'hex'),
  );

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString();
}
