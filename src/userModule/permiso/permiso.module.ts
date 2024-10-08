import { Module } from '@nestjs/common';
import { PermisoController } from './permiso.controller';
import { PermisoService } from './permiso.service';

@Module({
  imports: [],
  providers: [
    PermisoService,
  ],
  controllers: [PermisoController],
  exports: [PermisoService],
})
export class PermisoModule {}
