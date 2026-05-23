import * as crypto from 'node:crypto';

export function generateChecksumFromArrayBuffer(
  arrayBuffer: Buffer,
  algorithm = 'sha256',
  encoding: crypto.BinaryToTextEncoding = 'hex',
): string {
  const buffer = Buffer.from(arrayBuffer);
  const hash = crypto.createHash(algorithm);
  hash.update(buffer);
  return hash.digest(encoding);
}
