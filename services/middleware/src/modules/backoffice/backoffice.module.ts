import { Module } from '@nestjs/common';
import { ApplicationModule } from '@middleware/application/application.module';

@Module({
  imports: [ApplicationModule],
  controllers: [],
  providers: [],
})
export class BackofficeModule {}
