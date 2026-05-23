import { Injectable } from '@nestjs/common';
import { Account } from '@middleware/domain/entities/account.entity';
import { KubitRequest } from '@middleware/infrastructure/providers/kubit-request';

export type KubitHeaders = {
  appUrl: string;
  apiKey: string;
  userToken: string;
};

@Injectable()
export class EnrichAccountsBalanceService {
  constructor(private readonly kubitRequest: KubitRequest) {}

  async enrich(
    accounts: Account[],
    headers: KubitHeaders,
    requestHeaders?: Record<string, string>,
  ): Promise<Account[]> {
    if (!accounts?.length) return accounts;
    return Promise.all(
      accounts.map(async (account) => {
        try {
          const balance = await this.kubitRequest.getRequest(
            headers.appUrl,
            `/accounts/${account.external_id}/balance`,
            headers.apiKey,
            headers.userToken,
            requestHeaders,
          );
          return {
            ...account,
            amount: balance?.data?.amount ?? account.amount,
          };
        } catch {
          return account;
        }
      }),
    );
  }
}
