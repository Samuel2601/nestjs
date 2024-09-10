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
  Put,
} from '@nestjs/common';

import * as Dto from './role.dto';
import { RoleService } from './role.service';

@Controller('/')
export class RoleController {
  constructor(private readonly rolesService: RoleService) {}

  @Get(':id')
  async obtenerRole(@Param('id') id: string) {
    return this.rolesService.obtenerRole(id);
  }

  @Get()
  async obtenerRolesPorCriterio(@Query() query) {
    return this.rolesService.obtenerRolesPorCriterio(query);
  }

  @Put(':id')
  async actualizarRole(@Param('id') id: string, @Body() data) {
    return this.rolesService.actualizarRole(id, data);
  }

  @Delete(':id')
  async eliminarRole(@Param('id') id: string) {
    return this.rolesService.eliminarRole(id);
  }

  @Post('bulk')
  async registrarRolesMasivo(@Body() body) {
    const { datos, update } = body;
    return this.rolesService.registrarRolesMasivo(datos, update);
  }

}
