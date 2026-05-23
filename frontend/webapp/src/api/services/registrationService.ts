import { REGISTRATION_STORAGE_KEY } from '@/shared/constants/registration'
import type {
  LegalEntityRegistrationInput,
  NaturalPersonRegistrationInput,
  PendingRegistration,
  RegistrationStatus,
} from '@/shared/types/registration'

function readAll(): PendingRegistration[] {
  try {
    const raw = localStorage.getItem(REGISTRATION_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PendingRegistration[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(rows: PendingRegistration[]) {
  localStorage.setItem(REGISTRATION_STORAGE_KEY, JSON.stringify(rows))
}

export const registrationService = {
  /**
   * Lists locally stored pending registrations.
   * The legacy app had no backend for this flow; wire to API when available.
   */
  listPending(): PendingRegistration[] {
    return readAll()
      .filter((row) => row.status === 'pending')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  submitLegalEntity(input: LegalEntityRegistrationInput): PendingRegistration {
    const row: PendingRegistration = {
      id: crypto.randomUUID(),
      type: 'legal_entity',
      status: 'pending',
      createdAt: new Date().toISOString(),
      displayName: input.company,
      contactName: input.contactName,
      email: input.email,
      payload: input,
    }
    writeAll([row, ...readAll()])
    return row
  },

  submitNaturalPerson(input: NaturalPersonRegistrationInput): PendingRegistration {
    const row: PendingRegistration = {
      id: crypto.randomUUID(),
      type: 'natural_person',
      status: 'pending',
      createdAt: new Date().toISOString(),
      displayName: input.name,
      contactName: input.contactName,
      email: input.email,
      payload: input,
    }
    writeAll([row, ...readAll()])
    return row
  },

  updateStatus(id: string, status: RegistrationStatus) {
    const rows = readAll().map((row) =>
      row.id === id ? { ...row, status } : row,
    )
    writeAll(rows)
  },
}
