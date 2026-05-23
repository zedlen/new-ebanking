import {
  Controller,
  Get,
  Headers,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from '../services/customers.service';
import { extractHeaders } from '@middleware/domain/utils/extractHeaders';
import { AuthGuard } from '@middleware/core/auth/guards/auth.guard';

@Controller({ path: 'customers', version: '1' })
@UseGuards(AuthGuard)
export class CustomerController {
  constructor(private readonly customersService: CustomersService) {}

  @Get(':customerId/data')
  getCustomerData(
    @Headers() headers: Record<string, string>,
    @Param('customerId') customerId: string,
  ) {
    return this.customersService.getCustomerData(
      extractHeaders(headers),
      customerId,
      headers,
    );
  }

  @Get('')
  getClients(
    @Headers() headers: Record<string, string>,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    const info = extractHeaders(headers);
    return this.customersService.getCustomers(
      info,
      info.userId,
      { offset, limit },
      headers,
    );
  }
}
