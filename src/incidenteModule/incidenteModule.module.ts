import { Module } from '@nestjs/common';
import { IncidenteModuleController } from './incidenteModule.controller';
import { IncidenteModuleService } from './incidenteModule.service';

@Module({
  imports: [],
  providers: [
    IncidenteModuleService,
  ],
  controllers: [IncidenteModuleController],
  exports: [IncidenteModuleService],
})
export class IncidenteModuleModule {}
