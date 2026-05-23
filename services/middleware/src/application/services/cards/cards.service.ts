import { CardRepository } from '@middleware/domain/repositories/card.interface';
import { Card } from '@middleware/domain/entities/card.entity';
import { KubitRequest } from '@middleware/infrastructure/providers/kubit-request';
import { Injectable, Logger } from '@nestjs/common';
import { HeadersInfo } from '@middleware/domain/repositories/headers.interface';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';

type EncryptedPayload = {
  message?: string;
  iv?: string;
};

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);
  constructor(
    private readonly kubitRequest: KubitRequest,
    private readonly cardRepository: CardRepository,
  ) {}

  async syncCard(
    card: Card,
    headers: Record<string, string>,
  ): Promise<Card | null> {
    if (!card?.id) return null;

    const dbCard = await this.cardRepository.findOne({
      external_id: card.id,
      app: headers['APP_NAME'],
    });
    const { id, ...cardData } = card;
    if (!dbCard) {
      return this.cardRepository.save({ ...cardData, external_id: id });
    }
    await this.cardRepository.update(dbCard.id as string, {
      ...cardData,
      external_id: id,
    });
    return this.cardRepository.get(dbCard.id as string);
  }

  async fetchAccountCards(
    { appUrl, apiKey, userToken }: HeadersInfo,
    accountId: string,
    headers: Record<string, string>,
  ): Promise<Card[]> {
    const response = (await this.kubitRequest.getRequest(
      appUrl,
      `/cards/accounts/${accountId}/cards`,
      apiKey,
      userToken,
      headers,
    )) as { data: Card[] };
    const cards = response?.data ?? [];
    const results = await Promise.all(
      cards.map((card: Card) => {
        return this.syncCard(card, headers);
      }),
    );
    return results.filter((card): card is Card => !!card);
  }

  async fetchCardById(
    { appUrl, apiKey, userToken }: HeadersInfo,
    cardId: string,
    headers: Record<string, string>,
  ): Promise<Card | null> {
    const response = (await this.kubitRequest.getRequest(
      appUrl,
      `/cards/${cardId}`,
      apiKey,
      userToken,
      headers,
    )) as { data: Card };
    const card = response?.data ?? [];

    return this.syncCard(card, headers);
  }

  findCards(
    params: { [key: string]: string | number | boolean },
    pagination: Pagination,
  ) {
    return this.cardRepository.find(params, pagination);
  }

  findCard(params: { [key: string]: string | number | boolean }) {
    return this.cardRepository.findOne(params);
  }

  async getCardData(
    { appUrl, apiKey, userToken }: HeadersInfo,
    cardId: string,
    headers: Record<string, string>,
  ) {
    const response = (await this.kubitRequest.getRequest(
      appUrl,
      `/cards/${cardId}/data`,
      apiKey,
      userToken,
      headers,
    )) as { data: EncryptedPayload };
    return response;
  }

  async getCardPin(
    { appUrl, apiKey, userToken }: HeadersInfo,
    cardId: string,
    headers: Record<string, string>,
  ) {
    const response = (await this.kubitRequest.getRequest(
      appUrl,
      `/cards/${cardId}/pin`,
      apiKey,
      userToken,
      headers,
    )) as { data: EncryptedPayload };
    return response;
  }

  async generateDynamicCvv(
    { appUrl, apiKey, userToken }: HeadersInfo,
    cardId: string,
    headers: Record<string, string>,
  ) {
    const response = (await this.kubitRequest.postRequest(
      appUrl,
      `/cards/${cardId}/dynamic-cvv`,
      apiKey,
      userToken,
      {},
      null,
      headers,
    )) as { data: EncryptedPayload };
    return response;
  }

  async getCardDynamicCvv(
    { appUrl, apiKey, userToken }: HeadersInfo,
    cardId: string,
    headers: Record<string, string>,
  ) {
    const response = (await this.kubitRequest.getRequest(
      appUrl,
      `/cards/${cardId}/dynamic-cvv`,
      apiKey,
      userToken,
      headers,
    )) as { data: EncryptedPayload };
    return response;
  }

  async getCardByPan(
    { appUrl, apiKey, userToken }: HeadersInfo,
    pan: string,
    headers: Record<string, string>,
  ): Promise<Card | null> {
    const response = (await this.kubitRequest.getRequest(
      appUrl,
      `/cards/pan/${pan}`,
      apiKey,
      userToken,
      headers,
    )) as { data: Card };
    const { data: card } = response;
    if (!card) return null;
    return card;
  }
}
