import {
  Controller,
  Get,
  Headers,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccountsService } from '../services/accounts.service';
import { extractHeaders } from '@middleware/domain/utils/extractHeaders';
import { AuthGuard } from '@middleware/core/auth/guards/auth.guard';

@Controller({ path: 'accounts', version: '1' })
@UseGuards(AuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  getAccounts(
    @Headers() headers: Record<string, string>,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    return this.accountsService.getMyAccounts(
      extractHeaders(headers),
      { offset, limit },
      headers,
    );
  }

  @Get(':accountId')
  getAccount(
    @Headers() headers: Record<string, string>,
    @Param('accountId') accountId: string,
  ) {
    return this.accountsService.getMyAccount(
      extractHeaders(headers),
      accountId,
      headers,
    );
  }

  @Get('customer/:customerId')
  getCustomerAccounts(
    @Headers() headers: Record<string, string>,
    @Param('customerId') customerId: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    return this.accountsService.getCustomerAccounts(
      extractHeaders(headers),
      customerId,
      { offset, limit },
      headers,
    );
  }

  @Get('customers/:customerId/favorites')
  getFavorites(@Headers() headers: Record<string, string>) {
    return this.accountsService.getFavorites(extractHeaders(headers), headers);
  }
}
