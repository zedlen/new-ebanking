import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CardService } from '../services/cards.service';
import { AuthGuard } from '@middleware/core/auth/guards/auth.guard';
import { extractHeaders } from '@middleware/domain/utils/extractHeaders';
import { ZodPipe } from '@middleware/application/pipes/zod.pipe';
import {
  type LinkCardRequestDTO,
  LinkCardRequestSchema,
} from '@middleware/domain/dtos/LinkCardRequest.dto';
import {
  type ChangeCardStatusRequestDTO,
  ChangeCardStatusRequestSchema,
} from '@middleware/domain/dtos/ChangeCardStatus.dto';

@Controller({ path: 'cards', version: '1' })
@UseGuards(AuthGuard)
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  getCards(@Headers() headers: Record<string, string>) {
    const info = extractHeaders(headers);
    return this.cardService.getCards(info, info.userId, headers);
  }

  @Get(':cardId/data')
  getCardData(
    @Headers() headers: Record<string, string>,
    @Param('cardId') cardId: string,
  ) {
    return this.cardService.getCardData(
      extractHeaders(headers),
      cardId,
      headers,
    );
  }

  @Get(':cardId/pin')
  getCardPin(
    @Headers() headers: Record<string, string>,
    @Param('cardId') cardId: string,
  ) {
    return this.cardService.getCardPin(
      extractHeaders(headers),
      cardId,
      headers,
    );
  }

  @Get(':cardId/cvv')
  getCardCvv(
    @Headers() headers: Record<string, string>,
    @Param('cardId') cardId: string,
  ) {
    return this.cardService.getCardCvv(
      extractHeaders(headers),
      cardId,
      headers,
    );
  }

  @Post(':cardId/cvv')
  generateCardCvv(
    @Headers() headers: Record<string, string>,
    @Param('cardId') cardId: string,
  ) {
    return this.cardService.createCardCvv(
      extractHeaders(headers),
      cardId,
      headers,
    );
  }

  @Post('virtual')
  createVirtualCard(
    @Headers() headers: Record<string, string>,
    @Body() body: { accountId: string },
  ) {
    const info = extractHeaders(headers);
    return this.cardService.createVirtualCard(
      info,
      info.userId,
      body.accountId,
      headers,
    );
  }

  @Post()
  linkCard(
    @Headers() headers: Record<string, string>,
    @Body(new ZodPipe(LinkCardRequestSchema)) data: LinkCardRequestDTO,
  ) {
    const info = extractHeaders(headers);
    return this.cardService.createCard(info, info.userId, data, headers);
  }

  @Patch(':cardId')
  changeCardStatus(
    @Headers() headers: Record<string, string>,
    @Body(new ZodPipe(ChangeCardStatusRequestSchema))
    data: ChangeCardStatusRequestDTO,
    @Param('cardId') cardId: string,
  ) {
    const info = extractHeaders(headers);
    return this.cardService.changeCardStatus(
      info,
      info.userId,
      { ...data, card_id: cardId },
      headers,
    );
  }

  @Get('/customer/:customerId')
  getCustomerCards(
    @Headers() headers: Record<string, string>,
    @Param('customerId') customerId: string,
  ) {
    return this.cardService.getCards(
      extractHeaders(headers),
      customerId,
      headers,
    );
  }

  @Post('/customer/:customerId')
  linkCustomerCard(
    @Headers() headers: Record<string, string>,
    @Body(new ZodPipe(LinkCardRequestSchema)) data: LinkCardRequestDTO,
    @Param('customerId') customerId: string,
  ) {
    return this.cardService.createCard(
      extractHeaders(headers),
      customerId,
      data,
      headers,
    );
  }

  @Patch('/customer/:customerId/:cardId')
  changeCustomerCardStatus(
    @Headers() headers: Record<string, string>,
    @Body(new ZodPipe(ChangeCardStatusRequestSchema))
    data: ChangeCardStatusRequestDTO,
    @Param('cardId') cardId: string,
    @Param('customerId') customerId: string,
  ) {
    return this.cardService.changeCardStatus(
      extractHeaders(headers),
      customerId,
      { ...data, card_id: cardId },
      headers,
    );
  }
}
