import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AffiliationService } from '../services/affiliations.service';
import { extractHeaders } from '@middleware/domain/utils/extractHeaders';
import { AuthGuard } from '@middleware/core/auth/guards/auth.guard';
import { ZodPipe } from '@middleware/application/pipes/zod.pipe';
import {
  type AffiliationRequestDTO,
  AffiliationRequestSchema,
} from '@middleware/domain/dtos/AffiliationRequest.dto';

@Controller({ path: 'affiliations', version: '1' })
export class AffiliationController {
  constructor(private readonly affiliationService: AffiliationService) {}
  @Get()
  @UseGuards(AuthGuard)
  getUserAffiliations(
    @Headers() headers: Record<string, string>,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('query') query: string,
  ) {
    return this.affiliationService.getUserAffiliations(
      extractHeaders(headers),
      { limit, offset },
      headers,
      query,
    );
  }

  @Post('sync')
  @UseGuards(AuthGuard)
  syncUserAffiliations(@Headers() headers: Record<string, string>) {
    return this.affiliationService.syncAffiliations(
      extractHeaders(headers),
      headers,
    );
  }

  @Get('requests')
  @UseGuards(AuthGuard)
  getAffiliationsRequests(
    @Headers() headers: Record<string, string>,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    return this.affiliationService.getAffiliationRequests(
      extractHeaders(headers),
      { limit, offset },
    );
  }

  @Patch('requests/:affiliationId/approve')
  approveAffiliationRequest(
    @Headers() headers: any,
    @Query('affiliationId') affiliationId: string,
  ) {
    return this.affiliationService.approveAffiliationRequest(
      extractHeaders(headers),
      affiliationId,
      headers,
    );
  }

  @Patch('requests/:affiliationId/reject')
  rejectAffiliationRequest(
    @Headers() headers: any,
    @Query('affiliationId') affiliationId: string,
  ) {
    return this.affiliationService.rejectAffiliationRequest(
      extractHeaders(headers),
      affiliationId,
    );
  }

  @Patch('requests/:affiliationId')
  updateAffiliationRequest(
    @Headers() headers: any,
    @Body(new ZodPipe(AffiliationRequestSchema)) data: AffiliationRequestDTO,
    @Query('affiliationId') affiliationId: string,
  ) {
    return this.affiliationService.editAffiliation(
      extractHeaders(headers),
      affiliationId,
      data,
    );
  }

  @Post('/create/:appName')
  createAffiliationRequest(
    @Body(new ZodPipe(AffiliationRequestSchema)) data: AffiliationRequestDTO,
    @Param('appName') appName: string,
  ) {
    return this.affiliationService.createAffiliationRequest(appName, data);
  }

  // validate code
  @Get('/validate/:appName')
  validateAffiliationCode(
    @Query('code') code: string,
    @Param('appName') appName: string,
  ) {
    return this.affiliationService.validateAffiliationCode(appName, code);
  }
}
