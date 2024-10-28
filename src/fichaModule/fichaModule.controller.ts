import {Body, Query, Controller, Delete, Request, Get, Param, Post, NotFoundException, UnauthorizedException, Put, UseInterceptors} from '@nestjs/common';

import * as Dto from './fichaModule.dto';
import {FichaModuleService} from './fichaModule.service';
import {Ficha} from './models/ficha.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from 'src/common/uploads/uploads.service';

@Controller('/')
export class FichaModuleController {
	constructor(private readonly fichaService: FichaModuleService) {}

	@Post()
	@UseInterceptors(FileInterceptor('images', UploadsService.configureMulter(5 * 1024 * 1024, 'fichas'))) //uso del fileinterceptor para subir el archivo
	async create(@Body() createFichaDto: Dto.CreateFichaDto): Promise<Ficha> {
		return this.fichaService.create(createFichaDto);
	}

	@Get()
	async findAll(): Promise<Ficha[]> {
		return this.fichaService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<Ficha> {
		return this.fichaService.findOne(id);
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() updateFichaDto: Dto.UpdateFichaDto): Promise<Ficha> {
		return this.fichaService.update(id, updateFichaDto);
	}

	@Delete(':id')
	async delete(@Param('id') id: string): Promise<void> {
		return this.fichaService.delete(id);
	}
}
