export interface Transfer {
  payer_account: string;
  beneficiary_account: string;
  amount: number;
  concept: string;
  save_beneficiary_account: boolean;
  alias_beneficiary_account: string;
}
