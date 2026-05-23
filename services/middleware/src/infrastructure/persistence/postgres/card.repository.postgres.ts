import {
  Card,
  CardStatusReason,
} from '@middleware/domain/entities/card.entity';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';
import { CardRepository } from '@middleware/domain/repositories/card.interface';
import { Card as CardSchema } from '@middleware/domain/schemas/card.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

function toDomain(card: CardSchema): Card {
  return {
    id: card.id,
    account_id: card.account_id,
    brand: card.brand,
    masked_pan: card.masked_pan,
    creation_date: card.creation_date,
    update_date: card.update_date,
    external_id: card.external_id,
    app: card.app,
    is_multiapp: card.is_multiapp,
    active_function: card.active_function,
    issuing_country: card.issuing_country,
    cardholder_name: card.cardholder_name ?? '',
    product_type: card.product_type ?? '',
    status_reason: card.status_reason as CardStatusReason,
    embossing_setup_id: card.embossing_setup_id ?? '',
    embossing_status: card.embossing_status ?? '',
    profile_id: card.profile_id ?? '',
    alias: card.alias ?? '',
    address: card.address as Record<string, unknown>,
    type: card.type,
    status: card.status,
    metadata: card.metadata as Record<string, unknown>,
    settings: card.settings as Record<string, unknown>,
  };
}

@Injectable()
export class CardPostgresRepository extends CardRepository {
  constructor(
    @InjectRepository(CardSchema)
    private cardModel: Repository<CardSchema>,
  ) {
    super();
  }

  async find(
    params: {
      [key: string]: string | number | boolean;
    },
    pagination: Pagination,
  ): Promise<{ total: number; data: Card[] }> {
    const [data, total] = await this.cardModel.findAndCount({
      where: params,
      skip: pagination.offset,
      take: pagination.limit,
    });
    return { total, data: data.map(toDomain) };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<Card | null> {
    const card = await this.cardModel.findOne({ where: params });
    return card ? toDomain(card) : null;
  }

  async get(id: string): Promise<Card | null> {
    const card = await this.cardModel.findOneBy({ id });
    return card ? toDomain(card) : null;
  }

  async getAll(): Promise<{ total: number; data: Card[] }> {
    const [data, total] = await this.cardModel.findAndCount();
    return { total, data: data.map(toDomain) };
  }

  async save(item: Card): Promise<Card> {
    const card = await this.cardModel.save(item);
    return {
      id: card.id,
      type: card.type,
      active_function: card.active_function,
      masked_pan: card.masked_pan,
      cardholder_name: card.cardholder_name,
      product_type: card.product_type,
      status: card.status,
      status_reason: card.status_reason,
      embossing_setup_id: card.embossing_setup_id,
      embossing_status: card.embossing_status,
      profile_id: card.profile_id,
      account_id: card.account_id,
      brand: card.brand,
      alias: card.alias,
      address: card.address,
      issuing_country: card.issuing_country,
      is_multiapp: card.is_multiapp,
      metadata: card.metadata,
      settings: card.settings,
      creation_date: card.creation_date,
      update_date: card.update_date,
      external_id: card.external_id,
      app: card.app,
    };
  }

  async update(id: string, item: Partial<Card>): Promise<boolean> {
    const card = await this.cardModel.preload({ id, ...item });
    if (!card) {
      return false;
    }
    await this.cardModel.save(card);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.cardModel.delete({ id });
    return true;
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.cardModel.count({ where: params });
  }
}
