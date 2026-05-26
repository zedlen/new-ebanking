import { Module } from '@nestjs/common';
import { ApplicationModule } from '@middleware/application/application.module';
import { ValidateCustomerOwnership } from './services/validateCustomerOwnership';
import { CustomerController } from './controllers/customers.controller';
import { CustomersService } from './services/customers.sevice';
import { AuthModule } from '@middleware/core/auth/auth.module';
import { MovementsService } from './services/movements.service';
import { MovementsController } from './controllers/movements.controller';

@Module({
  imports: [ApplicationModule, AuthModule],
  controllers: [CustomerController, MovementsController],
  providers: [ValidateCustomerOwnership, CustomersService, MovementsService],
})
export class BackofficeModule {}
