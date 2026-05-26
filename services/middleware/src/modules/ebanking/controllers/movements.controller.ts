import { AuthGuard } from '@middleware/core/auth/guards/auth.guard';
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MovementsService } from '../services/movements.service';
import { extractHeaders } from '@middleware/domain/utils/extractHeaders';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import type { SPEI } from '@middleware/domain/repositories/spei.interface';
import type { Transfer } from '@middleware/domain/repositories/transfer.interface';

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

  @Get('spei/orders/saved')
  getSavedSpei(
    @Headers() headers: Record<string, string>,
    @Query('status') status: number,
  ) {
    return this.movementsService.getSavedSpei(
      extractHeaders(headers),
      status,
      headers,
    );
  }

  @Get('transfers/saved')
  getSavedTransfer(
    @Headers() headers: Record<string, string>,
    @Query('status') status: number,
  ) {
    return this.movementsService.getSavedTransfers(
      extractHeaders(headers),
      status,
      headers,
    );
  }

  @Post('spei/bulk')
  @UseInterceptors(FileInterceptor('template'))
  saveSpeiTemplate(
    @Headers() headers: Record<string, string>,
    @Body() data: { payerAccount: string; account_id?: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.movementsService.createSpeiTemplate(
      extractHeaders(headers),
      file,
      data,
      headers,
    );
  }

  @Post('transfers/save/template')
  @UseInterceptors(FileInterceptor('template'))
  saveTransfersTemplate(
    @Headers() headers: Record<string, string>,
    @Body() data: { payerAccount: string; account_id?: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.movementsService.createTransfersTemplate(
      extractHeaders(headers),
      file,
      data,
      headers,
    );
  }

  @Post('spei/bulk/preview')
  @UseInterceptors(FileInterceptor('template'))
  previewSpeiTemplate(
    @Headers() headers: Record<string, string>,
    @Body() data: { payerAccount: string; account_id?: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.movementsService.previewSpeiTemplate(file);
  }

  @Post('transfers/save/template/preview')
  @UseInterceptors(FileInterceptor('template'))
  previewTransfersTemplate(
    @Headers() headers: Record<string, string>,
    @Body() data: { payerAccount: string; account_id?: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.movementsService.previewTransfersTemplate(file);
  }

  @Post('spei/save')
  saveSpei(
    @Headers() headers: Record<string, string>,
    @Body() data: SPEI & { account_id?: string },
  ) {
    return this.movementsService.saveSpei(
      extractHeaders(headers),
      data,
      headers,
    );
  }

  @Post('transfers/save')
  saveTransfer(
    @Headers() headers: Record<string, string>,
    @Body() data: Transfer,
  ) {
    return this.movementsService.saveTransfer(
      extractHeaders(headers),
      data,
      headers,
    );
  }

  @Post('/spei/orders/saved/process')
  @UseGuards(AuthGuard)
  processSavedSpei(
    @Headers() headers: any,
    @Body() data: { selected_order_ids: string[] },
  ) {
    return this.movementsService.processSavedSpei(
      extractHeaders(headers),
      data,
      headers,
    );
  }

  @Post('/transfers/saved/process')
  @UseGuards(AuthGuard)
  processSavedTransfers(
    @Headers() headers: any,
    @Body() data: { selected_order_ids: string[] },
  ) {
    return this.movementsService.processSavedTransfer(
      extractHeaders(headers),
      data,
      headers,
    );
  }

  @Post('spei')
  createSpei(
    @Headers() headers: Record<string, string>,
    @Body() data: SPEI & { account_id?: string },
  ) {
    return this.movementsService.createSpei(
      extractHeaders(headers),
      data,
      headers,
    );
  }

  @Post('transfers')
  createTransfer(
    @Headers() headers: Record<string, string>,
    @Body() data: Transfer,
  ) {
    return this.movementsService.createTransfer(
      extractHeaders(headers),
      data,
      headers,
    );
  }
}
