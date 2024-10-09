import {Body, Query, Controller, Delete, Request, Get, Param, Post, NotFoundException, UnauthorizedException, Put, UsePipes, ValidationPipe, Injectable} from '@nestjs/common';

import * as Dto from './role.dto';
import {RoleService} from './role.service';
import {FindUserByIdDto} from 'src/common/dto/id.dto';
import {RoleUser} from '../models/roleuser.schema';
import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {CriterioService} from 'src/common/dto/params&populate/criterioFormat.service';

@Controller('/roles')
@Injectable()
export class RoleController {
	constructor(
		private readonly rolesService: RoleService,
		@InjectModel(RoleUser.name) private roleModel: Model<RoleUser>,
		private readonly criterioService: CriterioService,
	) {}

	@Get(':id')
	@UsePipes(new ValidationPipe({transform: true}))
	async findById(@Param() params: FindUserByIdDto) {
		return this.rolesService.findById(params.id);
	}

	@Get()
	async findAllfilter(@Query() query) {
		// Obtener los filtros y los campos de populate
		const {filter, populateFields} = this.criterioService.getfilterPopulate(query);
		// Formatear los filtros
		const filterparse = this.criterioService.criterioFormat(this.roleModel, filter);
		const populateFieldsparse = this.criterioService.getPopulateFields(this.roleModel, populateFields); // Obtener los campos de populate
		return this.rolesService.findAllfilter(filterparse, populateFieldsparse);
	}

	@Put(':id')
	@UsePipes(new ValidationPipe({transform: true}))
	async actualizarRole(@Param() params: FindUserByIdDto, @Body() rolDto: Dto.UpdateRoleUserDto) {
		return this.rolesService.actualizarRole(params.id, rolDto);
	}

	@Delete(':id')
	@UsePipes(new ValidationPipe({transform: true}))
	async eliminarRole(@Param() params: FindUserByIdDto) {
		return this.rolesService.eliminarRole(params.id);
	}

	@Post('')
	@UsePipes(new ValidationPipe({transform: true}))
	async registrarRolesMasivo(@Body() rolDto: Dto.CreateRoleUserDto[]) {
		return this.rolesService.createBatch(rolDto);
  }
  
  @Put('batch')
	@UsePipes(new ValidationPipe({transform: true}))
	async updateBatch(@Body() updateRoleUserDto: Dto.UpdateRoleUserDto[]): Promise<any> {
		return await this.rolesService.updateBatch(updateRoleUserDto);
	}
}
