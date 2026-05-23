export interface MovementsFilter {
  startDate?: string;
  endDate?: string;
  type?: number;
  status?:
    | 'pending'
    | 'sent'
    | 'scattered'
    | 'canceled'
    | 'returned'
    | 'created'
    | 'applied'
    | 'in_transit';
}
