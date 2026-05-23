import { AuthGuard } from '@middleware/core/auth/guards/auth.guard';
import {
  Controller,
  Get,
  Headers,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MovementsService } from '../services/movements.service';
import { extractHeaders } from '@middleware/domain/utils/extractHeaders';

@Controller({ path: 'movements', version: '1' })
@UseGuards(AuthGuard)
export class MovementController {
  constructor(private readonly movementsService: MovementsService) {}

  @Get('accounts/:accountId/latest')
  getLatestMovements(
    @Headers() headers: Record<string, string>,
    @Param('accountId') accountId: string,
  ) {
    return this.movementsService.getLastestMovements(
      extractHeaders(headers),
      accountId,
      headers,
    );
  }

  @Get('accounts/:accountId/paged')
  getMovements(
    @Headers() headers: Record<string, string>,
    @Param('accountId') accountId: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('type') type: number,
    @Query('status')
    status:
      | 'pending'
      | 'sent'
      | 'scattered'
      | 'canceled'
      | 'returned'
      | 'created'
      | 'applied'
      | 'in_transit',
  ) {
    return this.movementsService.getMovements(
      extractHeaders(headers),
      accountId,
      { offset, limit },
      { startDate, endDate, type, status },
      headers,
    );
  }

  @Get('spei/banks')
  getBanks(@Headers() headers: Record<string, string>) {
    return this.movementsService.getBanks(
      extractHeaders(headers),

      headers,
    );
  }
}
