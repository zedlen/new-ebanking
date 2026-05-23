export interface SPEI {
  concept: string;
  beneficiary_account: string;
  beneficiary_bank: string;
  beneficiary_name: string;
  beneficiary_uid: string;
  beneficiary_account_type: number;
  beneficiary_email: string;
  payer_account: string;
  amount: number;
  numerical_reference: number;
  save_beneficiary_account: boolean;
  alias_beneficiary_account: string;
}
