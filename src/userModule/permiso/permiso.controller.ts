import {Body, Query, Controller, Delete, Request, Get, Param, Post, Put, NotFoundException, UnauthorizedException, HttpStatus, UsePipes, ValidationPipe} from '@nestjs/common';

import * as Dto from './permiso.dto';
import {PermisoService} from './permiso.service';
import {CriterioService} from 'src/common/dto/params&populate/criterioFormat.service';
import {Permission} from '../models/permiso.schema';
import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {FindUserByIdDto} from 'src/common/dto/id.dto';

@Controller('/permisos')
export class PermisoController {
	constructor(
		private readonly permisoService: PermisoService,
		@InjectModel(Permission.name) private roleModel: Model<Permission>,
		private readonly criterioService: CriterioService,
	) {}

	// Inicializa los permisos en la base de datos
	@Get('init')
	async initializePermissions() {
		return await this.permisoService.onModuleInit();
	}

	// Obtener todos los permisos con opción de filtrado
	@Get()
	async findAll(@Query() query): Promise<any> {
		// Obtener los filtros y los campos de populate
		const {filter, populateFields} = this.criterioService.getfilterPopulate(query);
		// Formatear los filtros
		const filterparse = this.criterioService.criterioFormat(this.roleModel, filter);
		const populateFieldsparse = this.criterioService.getPopulateFields(this.roleModel, populateFields); // Obtener los campos de populate
		return await this.permisoService.findAllfilter(filterparse, populateFieldsparse);
	}

	// Obtener un permiso por su ID
	@Get(':id')
	@UsePipes(new ValidationPipe({transform: true}))
	async findById(@Param() params: FindUserByIdDto): Promise<any> {
		return await this.permisoService.findById(params.id);
	}

	// Crear un nuevo permiso
	@Post()
	@UsePipes(new ValidationPipe({transform: true}))
	async createPermission(@Body() createPermissionDto: Dto.CreatePermissionDto): Promise<any> {
		return await this.permisoService.createPermiso(createPermissionDto);
	}

	// Actualizar un permiso existente
	@Put('/:id')
	@UsePipes(new ValidationPipe({transform: true}))
	async updatePermission(@Param() params: FindUserByIdDto, @Body() updatePermissionDto: Dto.UpdatePermissionDto): Promise<any> {
		return await this.permisoService.updateRole(params.id, updatePermissionDto);
	}

	// Eliminar un permiso por su ID
	@Delete(':id')
	@UsePipes(new ValidationPipe({transform: true}))
	async deletePermission(@Param() params: FindUserByIdDto): Promise<any> {
		return await this.permisoService.deleteRole(params.id);
	}

	// Crear permisos en lote
	@Post('batch')
	@UsePipes(new ValidationPipe({transform: true}))
	async createBatchPermissions(@Body() createPermissionsDto: Dto.CreatePermissionDto[]): Promise<any> {
		return await this.permisoService.createBatch(createPermissionsDto);
	}

	// Actualizar permisos en lote
	@Put('batch')
	@UsePipes(new ValidationPipe({transform: true}))
	async updateBatchPermissions(@Body() updatePermissionsDto: Dto.UpdatePermissionDto[]): Promise<any> {
		return await this.permisoService.updateBatch(updatePermissionsDto);
	}
}
