/*
https://docs.nestjs.com/controllers#controllers
*/

import {Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe} from '@nestjs/common';
import {ActividadService} from '../services/actividad.service';
import {CreateActividadDto, UpdateActividadDto} from '../fichaModule.dto';
import {FileInterceptor} from '@nestjs/platform-express';
import {UploadsService} from 'src/common/uploads/uploads.service';
import {FindUserByIdDto} from 'src/common/dto/id.dto';
import {AuthGuard} from 'src/userModule/auth/guards/auth.guard';

@Controller('/ficha/actividad')
export class ActividadController {
	constructor(private readonly actividadService: ActividadService) {}

	@Get()
	@UseGuards(AuthGuard)
	async findAll(): Promise<any> {
		return this.actividadService.findAll();
	}

	@Get('/:id')
	@UseGuards(AuthGuard)
	@UsePipes(new ValidationPipe({transform: true}))
	async findOne(@Param() params: FindUserByIdDto): Promise<any> {
		return this.actividadService.findOne(params.id);
	}

	@Post()
	@UseGuards(AuthGuard)
	@UsePipes(new ValidationPipe({transform: true}))
	@UseInterceptors(FileInterceptor('image', UploadsService.configureMulter(5 * 1024 * 1024, 'fichas/actividad')))
	async create(@Body() createActividadDto: CreateActividadDto, @UploadedFile() imageFile: Express.Multer.File): Promise<any> {
		// Si se sube un archivo en `image`, guarda la ruta del archivo
		if (imageFile) {
			createActividadDto.image = `/uploads/fichas/actividad/${imageFile.filename}`;
		}
		return this.actividadService.create(createActividadDto);
	}

	@Put('/:id')
	@UseGuards(AuthGuard)
	@UsePipes(new ValidationPipe({transform: true}))
	@UseInterceptors(FileInterceptor('image', UploadsService.configureMulter(5 * 1024 * 1024, 'fichas/actividad')))
	async update(@Param('id') id: string, @Body() updateActividadDto: UpdateActividadDto, @UploadedFile() imageFile: Express.Multer.File): Promise<any> {
		// Si se sube un archivo en `image`, guarda la ruta del archivo
		if (imageFile) {
			updateActividadDto.image = `/uploads/fichas/actividad/${imageFile.filename}`;
		}

		return this.actividadService.update(id, updateActividadDto);
	}

	@Delete('/:id')
	@UseGuards(AuthGuard)
	@UsePipes(new ValidationPipe({transform: true}))
	async delete(@Param() params: FindUserByIdDto): Promise<any> {
		return this.actividadService.delete(params.id);
	}
}
