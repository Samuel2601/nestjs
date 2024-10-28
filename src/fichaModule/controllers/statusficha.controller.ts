/*
https://docs.nestjs.com/controllers#controllers
*/

import {Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe} from '@nestjs/common';
import {StatusFichaService} from '../services/statusficha.service';
import {CreateStatusDto, UpdateStatusDto} from '../fichaModule.dto';
import {FindUserByIdDto} from 'src/common/dto/id.dto';

@Controller('/ficha/status')
export class StatusfichaController {
	constructor(private readonly statusFichaService: StatusFichaService) {}

	@Get()
	async findAll(): Promise<any> {
		return this.statusFichaService.findAll();
	}

	@Get('/:id')
	@UsePipes(new ValidationPipe({transform: true}))
	async findOne(@Param() params: FindUserByIdDto): Promise<any> {
		return this.statusFichaService.findOne(params.id);
	}

	@Post()
	@UsePipes(new ValidationPipe({transform: true}))
	async create(@Body() createStatusDto: CreateStatusDto): Promise<any> {
		return this.statusFichaService.create(createStatusDto);
	}

	@Put('/:id')
	@UsePipes(new ValidationPipe({transform: true}))
	async update(@Param() params: FindUserByIdDto, @Body() updateStatusDto: UpdateStatusDto): Promise<any> {
		return this.statusFichaService.update(params.id, updateStatusDto);
	}

	@Delete('/:id')
	@UsePipes(new ValidationPipe({transform: true}))
	async delete(@Param() params: FindUserByIdDto): Promise<any> {
		return this.statusFichaService.delete(params.id);
	}
}
