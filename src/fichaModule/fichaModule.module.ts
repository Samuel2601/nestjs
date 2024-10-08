import { Module } from '@nestjs/common';
import { FichaModuleController } from './fichaModule.controller';
import { FichaModuleService } from './fichaModule.service';

@Module({
  imports: [],
  providers: [
    FichaModuleService,
  ],
  controllers: [FichaModuleController],
  exports: [FichaModuleService],
})
export class FichaModuleModule {}
