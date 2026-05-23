export interface PasswordRules {
  length: boolean
  uppercase: boolean
  number: boolean
  special: boolean
}

export function validatePasswordRules(password: string): PasswordRules {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>-]/.test(password),
  }
}

export function isPasswordValid(rules: PasswordRules): boolean {
  return rules.length && rules.uppercase && rules.number && rules.special
}
