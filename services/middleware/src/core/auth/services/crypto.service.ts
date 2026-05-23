import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'node:crypto';

@Injectable()
export class CryptoService {
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const salt =
      this.configService.get<string>('SECRET_KEY') ?? 'dev-secret-key';
    this.key = crypto.createHash('sha256').update(String(salt)).digest();
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    return this.toBase64Url(Buffer.concat([iv, encrypted]));
  }

  decrypt(ivCiphertextB64: string): string {
    const ivCiphertext = this.fromBase64Url(ivCiphertextB64);
    const iv = ivCiphertext.subarray(0, 16);
    const ciphertext = ivCiphertext.subarray(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return decrypted.toString('utf-8');
  }

  private toBase64Url(buf: Buffer): string {
    return buf
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private fromBase64Url(str: string): Buffer {
    let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    if (pad) b64 += '='.repeat(4 - pad);
    return Buffer.from(b64, 'base64');
  }
}
