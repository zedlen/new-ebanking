import { Module } from '@nestjs/common';
import { ApplicationModule } from '@middleware/application/application.module';
import { AccountsController } from './controllers/accounts.controller';
import { AccountsService } from './services/accounts.service';
import { AuthModule } from '@middleware/core/auth/auth.module';
import { CustomerController } from './controllers/customers.controller';
import { CustomersService } from './services/customers.service';
import { MovementController } from './controllers/movements.controller';
import { MovementsService } from './services/movements.service';
import { ValidateCustomer } from './services/validateCustomer.service';

@Module({
  imports: [ApplicationModule, AuthModule],
  controllers: [AccountsController, CustomerController, MovementController],
  providers: [
    AccountsService,
    CustomersService,
    MovementsService,
    ValidateCustomer,
  ],
})
export class EbankingModule {}
