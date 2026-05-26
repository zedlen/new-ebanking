import {
  Controller,
  Get,
  Headers,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MovementsService } from '../services/movements.service';
import { AuthGuard } from '@middleware/core/auth/guards/auth.guard';
import { extractHeaders } from '@middleware/domain/utils/extractHeaders';

@Controller({ version: '1' })
@UseGuards(AuthGuard)
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Get('partners/:partnerId/accounts/:accountId/movements')
  getPartnerMovements(
    @Headers() headers: Record<string, string>,
    @Param('partnerId') partnerId: string,
    @Param('accountId') accountId: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    const pagination = { limit, offset };

    return this.movementsService.getAccountMovements(
      extractHeaders(headers),
      partnerId,
      accountId,
      pagination,
      headers,
    );
  }

  @Get(
    'partners/:partnerId/customers/:customerId/accounts/:accountId/movements',
  )
  getCustomerMovements(
    @Headers() headers: Record<string, string>,
    @Param('customerId') customerId: string,
    @Param('accountId') accountId: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    const pagination = { limit, offset };

    return this.movementsService.getAccountMovements(
      extractHeaders(headers),
      customerId,
      accountId,
      pagination,
      headers,
    );
  }

  @Get(
    'partners/:partnerId/customers/:customerId/wallets/:walletId/accounts/:accountId/movements',
  )
  getWalletMovements(
    @Headers() headers: Record<string, string>,
    @Param('walletId') walletId: string,
    @Param('accountId') accountId: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    const pagination = { limit, offset };

    return this.movementsService.getAccountMovements(
      extractHeaders(headers),
      walletId,
      accountId,
      pagination,
      headers,
    );
  }

  @Get('partners/:partnerId/accounts/:accountId/movements/:movementId')
  getPartnerMovement(
    @Headers() headers: Record<string, string>,
    @Param('partnerId') partnerId: string,
    @Param('accountId') accountId: string,
    @Param('movementId') movementId: string,
  ) {
    return this.movementsService.getMovementDetail(
      extractHeaders(headers),
      partnerId,
      accountId,
      movementId,
      headers,
    );
  }

  @Get(
    'partners/:partnerId/customers/:customerId/accounts/:accountId/movements/:movementId',
  )
  getCustomerMovement(
    @Headers() headers: Record<string, string>,
    @Param('customerId') customerId: string,
    @Param('accountId') accountId: string,
    @Param('movementId') movementId: string,
  ) {
    return this.movementsService.getMovementDetail(
      extractHeaders(headers),
      customerId,
      accountId,
      movementId,
      headers,
    );
  }

  @Get(
    'partners/:partnerId/customers/:customerId/wallets/:walletId/accounts/:accountId/movements/:movementId',
  )
  getWalletMovement(
    @Headers() headers: Record<string, string>,
    @Param('walletId') walletId: string,
    @Param('accountId') accountId: string,
    @Param('movementId') movementId: string,
  ) {
    return this.movementsService.getMovementDetail(
      extractHeaders(headers),
      walletId,
      accountId,
      movementId,
      headers,
    );
  }
}
