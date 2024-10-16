import {
  Body,
  Query,
  Controller,
  Delete,
  Request,
  Get,
  Param,
  Post,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as Dto from './permiso.dto';
import { PermisoService } from './permiso.service';

@Controller('/permisos')
export class PermisoController {
  constructor(  private readonly permisoService: PermisoService) {}
  
  @Get('init')
  async get() {
    return this.permisoService.onModuleInit();
  }


}
