import { TAXPAYER_TYPE_ID } from '@/shared/constants/banking'

/** Persona física (`taxpayer_type_id === 1`). */
export const physicalPersonOnly = [TAXPAYER_TYPE_ID.PHYSICAL] as const

/** Persona moral (`taxpayer_type_id === 2`). */
export const legalEntityOnly = [TAXPAYER_TYPE_ID.LEGAL] as const
