export enum OnboardingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class OnboardingStatusValidator {
  /**
   * Define las transiciones válidas entre estados
   */
  private static readonly VALID_TRANSITIONS: Record<
    OnboardingStatus,
    OnboardingStatus[]
  > = {
    [OnboardingStatus.PENDING]: [
      OnboardingStatus.APPROVED,
      OnboardingStatus.REJECTED,
    ],
    [OnboardingStatus.APPROVED]: [],
    [OnboardingStatus.REJECTED]: [OnboardingStatus.APPROVED], // Solo puede ir a approved, NO a pending
  };

  /**
   * Valida si una transición de estado es permitida
   * @param currentStatus Estado actual
   * @param newStatus Nuevo estado propuesto
   * @returns true si la transición es válida, false en caso contrario
   */
  static isValidTransition(
    currentStatus: OnboardingStatus,
    newStatus: OnboardingStatus,
  ): boolean {
    if (currentStatus === newStatus) {
      return true; // Mismo estado siempre es válido
    }

    const allowedTransitions = this.VALID_TRANSITIONS[currentStatus];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Obtiene los estados permitidos desde un estado actual
   * @param currentStatus Estado actual
   * @returns Array de estados permitidos
   */
  static getAllowedTransitions(
    currentStatus: OnboardingStatus,
  ): OnboardingStatus[] {
    return this.VALID_TRANSITIONS[currentStatus] || [];
  }

  /**
   * Genera mensaje de error descriptivo para transición inválida
   * @param currentStatus Estado actual
   * @param newStatus Nuevo estado propuesto
   * @returns Mensaje de error
   */
  static getTransitionErrorMessage(
    currentStatus: OnboardingStatus,
    newStatus: OnboardingStatus,
  ): string {
    const allowedTransitions = this.getAllowedTransitions(currentStatus);

    if (currentStatus === OnboardingStatus.APPROVED) {
      return 'Un onboarding aprobado no puede cambiar de estado';
    }

    if (
      currentStatus === OnboardingStatus.REJECTED &&
      newStatus === OnboardingStatus.PENDING
    ) {
      return 'Un onboarding rechazado no puede volver al estado pendiente';
    }

    return `Transición inválida de '${currentStatus}' a '${newStatus}'. Estados permitidos: [${allowedTransitions.join(', ')}]`;
  }
}
