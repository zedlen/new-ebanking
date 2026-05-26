import { AccountService } from '@middleware/application/services/accounts/accounts.service';
import { CardsService } from '@middleware/application/services/cards/cards.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ValidateCustomer } from './validateCustomer.service';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';
import { hideClabe } from '@middleware/domain/utils/hideClabe';
import { LinkCardRequestDTO } from '@middleware/domain/dtos/LinkCardRequest.dto';

@Injectable()
export class CardService {
  constructor(
    private readonly cardService: CardsService,
    private readonly accountService: AccountService,
    private readonly validate: ValidateCustomer,
  ) {}

  async getCards(
    info: HeadersInfo,
    customerId: string,
    headers: Record<string, string>,
  ) {
    const customer = await this.validate.validateCustomerOwnership(
      info,
      customerId,
      headers,
    );
    const accounts = await this.accountService.fetchUserAccounts(
      info,
      customer.external_id,
      { offset: 0, limit: 10 },
      headers,
    );
    const result = await Promise.all(
      accounts.data.map(async (account) => {
        const cards = await this.cardService.fetchAccountCards(
          info,
          account.external_id,
          headers,
        );
        return cards.map((card) => ({ ...hideClabe(account), card }));
      }),
    );
    return result.flat();
  }

  async createVirtualCard(
    info: HeadersInfo,
    customerId: string,
    accountId: string,
    headers: Record<string, string>,
  ) {
    const customer = await this.validate.validateCustomerOwnership(
      info,
      customerId,
      headers,
    );
    const account = await this.accountService.fetchAccountById(
      info,
      accountId,
      headers,
    );
    if (!account) throw new NotFoundException('Account not found');
    if (account.customer_id != customer.external_id)
      throw new ForbiddenException('Account is not assigned to user');
    return this.cardService.createVirtualCard(
      info,
      account.external_id,
      headers,
    );
  }

  async createCard(
    info: HeadersInfo,
    customerId: string,
    body: LinkCardRequestDTO,
    headers: Record<string, string>,
  ) {
    const customer = await this.validate.validateCustomerOwnership(
      info,
      customerId,
      headers,
    );
    const account = await this.accountService.fetchAccountById(
      info,
      body.accountId,
      headers,
    );
    if (!account) throw new NotFoundException('Account not found');
    if (account.customer_id != customer.external_id)
      throw new ForbiddenException('Account is not assigned to user');
    return this.cardService.linkCardOnAccount(
      info,
      account.external_id,
      body.pan,
      headers,
    );
  }

  async changeCardStatus(
    info: HeadersInfo,
    customerId: string,
    body: { card_id: string; status: string; status_reason?: string | null },
    headers: Record<string, string>,
  ) {
    const customer = await this.validate.validateCustomerOwnership(
      info,
      customerId,
      headers,
    );
    const card = await this.cardService.fetchCardById(
      info,
      body.card_id,
      headers,
    );
    if (!card) throw new NotFoundException('Card not found');
    const account = await this.accountService.fetchAccountById(
      info,
      card.account_id,
      headers,
    );
    if (!account) throw new NotFoundException('Account not found');
    if (account.customer_id != customer.external_id)
      throw new ForbiddenException('Account is not assigned to user');
    return this.cardService.changeCardStatus(info, body, headers);
  }

  async getCardData(
    info: HeadersInfo,
    cardId: string,
    headers: Record<string, string>,
  ) {
    const card = await this.cardService.fetchCardById(info, cardId, headers);
    if (!card) throw new NotFoundException('Not found card');
    const account = await this.accountService.fetchAccountById(
      info,
      card.account_id,
      headers,
    );
    if (!account) throw new NotFoundException('Not found account');
    if (account.customer_id != info.userId)
      throw new ForbiddenException('Card account is not from user');
    return this.cardService.getCardData(info, card.external_id, headers);
  }

  async getCardPin(
    info: HeadersInfo,
    cardId: string,
    headers: Record<string, string>,
  ) {
    const card = await this.cardService.fetchCardById(info, cardId, headers);
    if (!card) throw new NotFoundException('Not found card');
    const account = await this.accountService.fetchAccountById(
      info,
      card.account_id,
      headers,
    );
    if (!account) throw new NotFoundException('Not found account');
    if (account.customer_id != info.userId)
      throw new ForbiddenException('Card account is not from user');
    return this.cardService.getCardPin(info, card.external_id, headers);
  }

  async getCardCvv(
    info: HeadersInfo,
    cardId: string,
    headers: Record<string, string>,
  ) {
    const card = await this.cardService.fetchCardById(info, cardId, headers);
    if (!card) throw new NotFoundException('Not found card');
    const account = await this.accountService.fetchAccountById(
      info,
      card.account_id,
      headers,
    );
    if (!account) throw new NotFoundException('Not found account');
    if (account.customer_id != info.userId)
      throw new ForbiddenException('Card account is not from user');
    return this.cardService.getCardDynamicCvv(info, card.external_id, headers);
  }

  async createCardCvv(
    info: HeadersInfo,
    cardId: string,
    headers: Record<string, string>,
  ) {
    const card = await this.cardService.fetchCardById(info, cardId, headers);
    if (!card) throw new NotFoundException('Not found card');
    const account = await this.accountService.fetchAccountById(
      info,
      card.account_id,
      headers,
    );
    if (!account) throw new NotFoundException('Not found account');
    if (account.customer_id != info.userId)
      throw new ForbiddenException('Card account is not from user');
    return this.cardService.generateDynamicCvv(info, card.external_id, headers);
  }
}
