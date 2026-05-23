export function getTransferErrorMessage(code?: string): string {
  const catalog: Record<string, string> = {
    'CODE-000':
      'No se concretó la operación. Intenta de nuevo.',
    'CODE-001': 'La cuenta de origen no existe.',
    'CODE-002':
      'No es posible generar la transacción con la cuenta de origen seleccionada.',
    'CODE-003': 'No hay fondos suficientes para completar la transacción.',
    'CODE-004':
      'No pudimos procesar la transacción. Contacta a soporte.',
    'CODE-007':
      'No es posible realizar traspasos a la cuenta seleccionada.',
    'CODE-008':
      'No es posible realizar el traspaso (CC distinto).',
    'CODE-016':
      'Error en la configuración de tu cuenta. Contacta a soporte.',
    'CODE-017':
      'No encontramos la configuración de tu cuenta.',
    'CODE-018':
      'Error al realizar el movimiento. Intenta de nuevo.',
  }
  return catalog[code ?? 'CODE-000'] ?? catalog['CODE-000']
}
