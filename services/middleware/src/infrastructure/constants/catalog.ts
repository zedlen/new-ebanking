export const MOVEMENT_TYPE = [
  '',
  'SPEI',
  'SPEI',
  'Traspaso',
  'Compra',
  'Retiro',
  'Comisión',
  'Comisión por operación',
];

export const MOVEMENT_STATUS: Record<string, string> = {
  applied: 'Liquidada',
  stoped: 'Detenido/Holdeado',
  created: 'Creado',
  pending: 'Pendiente de envio',
  sent: 'En proceso',
  scattered: 'Liquidada',
  canceled: 'Cancelada',
  returned: 'Devuelto',
  in_transit: 'Enviada',
};

export const ACCOUNT_TYPE = [null, 'Cuenta', 'Subcuenta'];

export const TAXPAYER_TYPE = [null, 'Fisica', 'Moral'];

export const CUSTOMER_STATUS = [
  '',
  'Creado',
  'En Revisión',
  'Aprobado',
  'Rechazado',
];
