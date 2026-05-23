import { Account } from '../entities/account.entity';

export const hideClabe = (account: Account) => {
  if (account.clabes) {
    account.clabes = account.clabes.map((clabe) => {
      clabe.clabe = '****************';
      return clabe;
    });
  }
  return account;
};
