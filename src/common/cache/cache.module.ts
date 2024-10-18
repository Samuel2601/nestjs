// src/cache/cache.module.ts
import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';

@Module({
  providers: [CacheService],
  exports: [CacheService], // Hacer que el servicio de caché sea accesible por otros módulos
})
export class CacheModule {}
