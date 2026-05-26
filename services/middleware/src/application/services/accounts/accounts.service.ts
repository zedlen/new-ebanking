import { Injectable, Logger } from '@nestjs/common';
import { AccountRepository } from '@middleware/domain/repositories/account.interface';
import { FavoriteAccountRepository } from '@middleware/domain/repositories/favoriteAccount.interface';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';
import { KubitRequest } from '@middleware/infrastructure/providers/kubit-request';
import { Account } from '@middleware/domain/entities/account.entity';
import { FavoriteAccount } from '@middleware/domain/entities/favoriteAccount.entity';
import {
  PaginatedResult,
  Pagination,
} from '@middleware/domain/interfaces/pagination.interface';
@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);
  constructor(
    private readonly kubitRequest: KubitRequest,
    private readonly accountRepository: AccountRepository,
    private readonly favoritesRepository: FavoriteAccountRepository,
  ) {}

  async syncAccount(
    account: Account,
    headers: Record<string, string>,
  ): Promise<Account | null> {
    if (!account?.id) return null;
    const dbAccount = await this.accountRepository.findOne({
      external_id: account.id,
      app: headers['APP_NAME'],
    });

    const { id, ...accountData } = account;
    if (!dbAccount) {
      return this.accountRepository.save({
        ...accountData,
        external_id: id,
        app: headers['APP_NAME'],
      });
    }
    await this.accountRepository.update(dbAccount.id as string, {
      ...accountData,
      external_id: id,
    });
    return this.accountRepository.get(dbAccount.id as string);
  }

  async fetchUserAccounts(
    { appUrl, apiKey, userToken }: HeadersInfo,
    customerId: string,
    pagination: Pagination,
    headers: Record<string, string>,
  ): Promise<PaginatedResult<Account>> {
    const responseAccountInfo = (await this.kubitRequest.getRequest(
      appUrl,
      `/accounts/customers/${customerId}`,
      apiKey,
      userToken,
      headers,
    )) as { data: Account[] };
    const accounts = responseAccountInfo?.data ?? [];
    await Promise.all(
      accounts.map((account: Account) => {
        return this.syncAccount(account, headers);
      }),
    );
    return this.accountRepository.find({ customer_id: customerId }, pagination);
  }

  async fetchAccountById(
    { appUrl, apiKey, userToken }: HeadersInfo,
    accountId: string,
    headers: Record<string, string>,
  ): Promise<Account | null> {
    const responseAccountInfo = (await this.kubitRequest.getRequest(
      appUrl,
      `/accounts/${accountId}`,
      apiKey,
      userToken,
      headers,
    )) as { data: Account };
    const account = responseAccountInfo?.data ?? {};
    return this.syncAccount(account, headers);
  }

  async fetchAccountByClabe(
    { appUrl, apiKey, userToken }: HeadersInfo,
    clabe: string,
    headers: Record<string, string>,
  ): Promise<Account | null> {
    const responseAccountInfo = (await this.kubitRequest.getRequest(
      appUrl,
      `/accounts/clabes/${clabe}`,
      apiKey,
      userToken,
      headers,
    )) as { data: Account };
    const account = responseAccountInfo?.data ?? {};
    return this.syncAccount(account, headers);
  }

  async createAccount(
    { appUrl, apiKey, userToken }: HeadersInfo,
    customerId: string,
    headers: Record<string, string>,
  ): Promise<Account | null> {
    const responseAccountInfo = (await this.kubitRequest.postRequest(
      appUrl,
      `/accounts?accountType=2&customerId=${customerId}`,
      apiKey,
      userToken,
      {},
      null,
      headers,
    )) as { data: { id: string } };

    const { data: account } = responseAccountInfo;
    if (!account?.id) {
      throw new Error('Account creation failed');
    }
    return this.fetchAccountById(
      { appUrl, apiKey, userToken } as HeadersInfo,
      account.id,
      headers,
    );
  }

  async serachAccountsByQuery(
    query: string,
    headers: Record<string, string>,
  ): Promise<Array<Account>> {
    const accounts = await this.accountRepository.searchByQuery(query);
    const results = await Promise.all(
      accounts.map((account: Account) => {
        return this.syncAccount(account, headers);
      }),
    );
    return results.filter((account): account is Account => !!account);
  }

  async fetchAccountFavorites(
    { appUrl, apiKey, userToken }: HeadersInfo,
    customerId: string,
    headers: Record<string, string>,
  ): Promise<FavoriteAccount[]> {
    const responseAccountInfo = (await this.kubitRequest.getRequest(
      appUrl,
      `/accounts/customers/${customerId}/favorites`,
      apiKey,
      userToken,
      headers,
    )) as { data: FavoriteAccount[] };

    const accounts = responseAccountInfo?.data ?? [];
    const results = await Promise.all(
      accounts.map(async (account: FavoriteAccount) => {
        const favInDb = await this.favoritesRepository.findOne({
          customer_id: account.customer_id,
          account_id: account.account_id,
        });
        if (!favInDb) {
          return this.favoritesRepository.save(account);
        }
        await this.favoritesRepository.update(favInDb.id as string, account);
        return this.favoritesRepository.get(favInDb.id as string);
      }),
    );
    return results.filter((account): account is FavoriteAccount => !!account);
  }

  async fetchProductTypes(
    { appUrl, apiKey, userToken }: HeadersInfo,
    headers: any,
  ) {
    const responseAccountStatements = (await this.kubitRequest.getRequest(
      appUrl,
      `/accounts/products`,
      apiKey,
      userToken,
      headers,
    )) as { data: Array<{ id: string; name: string; type_id: string }> };
    const { data: products = [] } = responseAccountStatements;
    return products;
  }
}
