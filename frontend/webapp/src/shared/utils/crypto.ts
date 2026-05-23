export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

import type { EncryptedPayload } from '@/shared/types/card'

const strToArrayBuffer = (str: string) => {
  const buf = new ArrayBuffer(str.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < str.length; i++) {
    view[i] = str.charCodeAt(i)
  }
  return buf
}

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  return bytes.buffer
}

const importBase64PrivateKey = async (privateKeyBase64: string) => {
  const binaryDer = strToArrayBuffer(atob(privateKeyBase64))
  return window.crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['decrypt'],
  )
}

const importAesKey = async (raw: ArrayBuffer) =>
  window.crypto.subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 }, false, [
    'decrypt',
  ])

/** Decrypts API payloads (PAN, CVV, PIN) using login RSA + AES envelope. */
export async function decryptApiMessage<T = Record<string, unknown>>(
  data: EncryptedPayload,
  keys: { privateKey: string; encryptionKey: string },
): Promise<T | string | null> {
  if (!data.message || !keys.privateKey || !keys.encryptionKey) {
    return null
  }

  try {
    const privateKey = await importBase64PrivateKey(keys.privateKey)
    const decryptedEnvelope = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      base64ToArrayBuffer(keys.encryptionKey),
    )
    const aesKey = await importAesKey(decryptedEnvelope)
    const iv = base64ToArrayBuffer(data.iv ?? '')
    const plaintext = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      base64ToArrayBuffer(data.message),
    )
    const decoded = new TextDecoder().decode(plaintext)
    try {
      return JSON.parse(decoded) as T
    } catch {
      return decoded
    }
  } catch {
    return null
  }
}

export const generateRsaKeyPair = async (): Promise<{
  publicKey: string
  privateKey: string
}> => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt'],
  )

  const [publicSpki, privatePkcs8] = await Promise.all([
    window.crypto.subtle.exportKey('spki', keyPair.publicKey),
    window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey),
  ])

  return {
    publicKey: arrayBufferToBase64(publicSpki),
    privateKey: arrayBufferToBase64(privatePkcs8),
  }
}
