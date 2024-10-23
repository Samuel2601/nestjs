import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';

@Injectable()
export class CacheService {
  private cache: NodeCache;

  constructor() {
    // stdTTL es el tiempo de vida estándar en segundos (600 = 10 minutos)
    this.cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
  }

  // Guardar datos en la cache
  set(key: string, value: any, ttl?: number): boolean {
    return this.cache.set(key, value, ttl);
  }

  // Obtener datos de la cache
  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  // Eliminar un valor específico de la cache
  del(key: string): number {
    return this.cache.del(key);
  }

  // Limpiar toda la cache
  flushAll(): void {
    this.cache.flushAll();
  }

  // Comprobar si una clave existe en la cache
  has(key: string): boolean {
    return this.cache.has(key);
  }
}
