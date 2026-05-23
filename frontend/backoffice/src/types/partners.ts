export enum EntityLayout {
  Partners = "partners",
  Customers = "customers",
  Wallets = "wallets",
  Accounts = "accounts",
}

export enum TypePerson {
  Fisica = 1,
  Moral = 2,
}

export enum EntityStatus {
  Unknown = "0",
  Created = "1",
  Process = "2",
  Approved = "3",
  Rejected = "4",
}

export interface Address {
  id?: number;
  street: string;
  num_ext: string;
  num_int: string;
  reference: string;
  neighborhood: string;
  district: string;
  estate: string;
  cp: string;
}

export interface Clabe {
  id: number;
  payment_provider_id: number;
  account_id: string;
  clabe: string;
  cc: string;
}

export interface Account {
  id: string;
  external_id: string;
  type: TypePerson;
  amount: number;
  currency: string;
  linked_cellphone: unknown;
  customer_id: number | string;
  alias: unknown;
  creation_date: string;
  clabes: Clabe[];
}

export interface AccountsResponse {
  total: number;
  data: Account[];
  info?: {
    image: string;
    name: string;
    taxpayer_type_id: TypePerson;
    customer_id: string;
  };
}

export interface Partner {
  id: string;
  external_id: string;
  rfc?: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_tel?: string;
  taxpayer_type_id: TypePerson;
  status: EntityStatus | string;
  creation_date: string;
  image: string;
  customer_id?: string;
  address?: Address;
  accounts: AccountsResponse;
}

export interface Customer {
  id: string;
  external_id: string;
  company_name: string;
  name?: string;
  ap_paterno?: string;
  ap_materno?: string;
  contact_name: string;
  contact_email: string;
  contact_tel?: string;
  taxpayer_type_id: TypePerson;
  status: EntityStatus | string;
  creation_date: string;
  image: string;
  customer_id?: string;
  address?: Address;
  accounts: AccountsResponse;
}

export interface Wallet extends Customer {}

export interface PaginatedResponse<T> {
  total: number;
  data: T[];
}

export interface PartnerRef {
  id: string;
  company_name: string;
  contact_name: string;
  taxpayer_type_id: TypePerson;
  external_id: string;
  image?: string;
}

export interface CustomerRef {
  id: string;
  company_name: string;
  contact_name: string;
  taxpayer_type_id: TypePerson;
  external_id: string;
  image?: string;
  Partner?: PartnerRef;
}

export interface WalletRef extends CustomerRef {
  Customer?: CustomerRef;
}

export interface AccountSearchResult extends Account {
  Partner?: PartnerRef;
  Customer?: CustomerRef & { Partner?: PartnerRef };
  Wallet?: WalletRef;
}

export interface SearchResults {
  accounts: AccountSearchResult[];
  customers: CustomerRef[];
  wallets: WalletRef[];
  partners: PartnerRef[];
}

export type HierarchyEntity = Partner | Customer | Wallet | Account;
