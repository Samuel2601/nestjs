import { Module } from '@nestjs/common';
import { EmailModuleController } from './emailModule.controller';
import { EmailModuleService } from './emailModule.service';

@Module({
  imports: [],
  providers: [
    EmailModuleService,
  ],
  controllers: [EmailModuleController],
  exports: [EmailModuleService],
})
export class EmailModuleModule {}
