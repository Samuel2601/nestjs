import {Body, Query, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe, Injectable} from '@nestjs/common';

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

	@Get('/:id')
	@UsePipes(new ValidationPipe({transform: true}))
	async findById(@Param() params: FindUserByIdDto): Promise<any> {
		return await this.rolesService.findById(params.id);
	}

	@Get()
	async getAllRoltefilter(@Query() query): Promise<any> {
		// Obtener los filtros y los campos de populate
		const {filter, populateFields} = this.criterioService.getfilterPopulate(query);
		// Formatear los filtros
		const filterparse = this.criterioService.criterioFormat(this.roleModel, filter);
		const populateFieldsparse = this.criterioService.getPopulateFields(this.roleModel, populateFields); // Obtener los campos de populate
		return this.rolesService.findAllfilter(filterparse, populateFieldsparse);
	}

	@Post('')
	@UsePipes(new ValidationPipe({transform: true}))
	async create(@Body() rolDto: Dto.CreateRoleUserDto): Promise<any> {
		return this.rolesService.createRole(rolDto);
	}

	@Put('/:id')
	@UsePipes(new ValidationPipe({transform: true}))
	async updateRole(@Param() params: FindUserByIdDto, @Body() rolDto: Dto.UpdateRoleUserDto): Promise<any> {
		return this.rolesService.updateRole(params.id, rolDto);
	}

	@Delete('/:id')
	@UsePipes(new ValidationPipe({transform: true}))
	async deleteRole(@Param() params: FindUserByIdDto): Promise<any> {
		return this.rolesService.deleteRole(params.id);
	}

	@Post('batch')
	@UsePipes(new ValidationPipe({transform: true}))
	async createBatch(@Body() rolDto: Dto.CreateRoleUserDto[]): Promise<any> {
		return this.rolesService.createBatch(rolDto);
	}

	@Put('batch')
	@UsePipes(new ValidationPipe({transform: true}))
	async updateBatch(@Body() updateRoleUserDto: Dto.UpdateRoleUserDto[]): Promise<any> {
		return await this.rolesService.updateBatch(updateRoleUserDto);
	}
}
