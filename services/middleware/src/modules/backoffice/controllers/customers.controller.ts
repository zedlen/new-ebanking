import {
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from '../services/customers.sevice';
import { AuthGuard } from '@middleware/core/auth/guards/auth.guard';
import { extractHeaders } from '@middleware/domain/utils/extractHeaders';

@Controller({ version: '1' })
@UseGuards(AuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomersService) {}

  @Get('partners')
  getUserPartners(
    @Headers() headers: Record<string, string>,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    const pagination = { limit, offset };
    const info = extractHeaders(headers);
    return this.customerService.getUserPartners(
      info,
      info.userId,
      pagination,
      headers,
    );
  }

  @Get('partners/:partnerId/customers')
  getPartnerCustomer(
    @Headers() headers: Record<string, string>,
    @Param('partnerId') partnerId: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    const pagination = { limit, offset };
    const info = extractHeaders(headers);
    return this.customerService.getCustomers(
      info,
      partnerId,
      pagination,
      headers,
    );
  }

  @Get('partners/:partnerId/customers/:customerid/wallets')
  getCustomerWallets(
    @Headers() headers: Record<string, string>,
    @Param('customerid') customerid: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    const pagination = { limit, offset };
    const info = extractHeaders(headers);
    return this.customerService.getCustomers(
      info,
      customerid,
      pagination,
      headers,
    );
  }

  @Post('partners/sync-all')
  syncAllData(@Headers() headers: Record<string, string>) {
    return this.customerService.syncAllData(extractHeaders(headers), headers);
  }
}
