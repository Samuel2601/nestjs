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
	UseInterceptors,
	UploadedFile,
	UploadedFiles,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';

import * as Dto from '../fichaModule.dto';
import {FichaModuleService} from '../services/fichaModule.service';
import {Ficha} from '../models/ficha.schema';
import {FileInterceptor, FilesInterceptor} from '@nestjs/platform-express';
import {UploadsService} from 'src/common/uploads/uploads.service';
import {CriterioService} from 'src/common/dto/params&populate/criterioFormat.service';
import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {FindUserByIdDto} from 'src/common/dto/id.dto';

@Controller('/ficha')
export class FichaModuleController {
	constructor(
		private readonly fichaService: FichaModuleService,
		private readonly criterioService: CriterioService,
		@InjectModel(Ficha.name) private fichaModel: Model<Ficha>,
	) {}

	@Get()
	async findAll(@Query() query): Promise<any> {
		// Obtener los filtros y los campos de populate
		const {filter, populateFields} = this.criterioService.getfilterPopulate(query);
		// Formatear los filtros
		const filterparse = this.criterioService.criterioFormat(this.fichaModel, filter);
		const populateFieldsparse = this.criterioService.getPopulateFields(this.fichaModel, populateFields); // Obtener los campos de populate

		return this.fichaService.findAll(filterparse, populateFieldsparse);
	}

	@Get('/:id')
	@UsePipes(new ValidationPipe({transform: true}))
	async findOne(@Param() params: FindUserByIdDto): Promise<Ficha> {
		return this.fichaService.findOne(params.id);
	}

	@Post()
	@UseInterceptors(
		FileInterceptor('marcador', UploadsService.configureMulter(5 * 1024 * 1024, 'fichas/marcador')),
		FilesInterceptor('images', 5, UploadsService.configureMulter(5 * 1024 * 1024, 'fichas')),
	) //uso del fileinterceptor para subir el archivo
	async create(@Body() createFichaDto: Dto.CreateFichaDto, @UploadedFile() marcadorFile: Express.Multer.File, @UploadedFiles() imagesFiles: Express.Multer.File[]): Promise<Ficha> {
		// Si se sube un archivo en `marcador`, guarda la ruta del archivo
		if (marcadorFile) {
			createFichaDto.marcador = `/uploads/fichas/marcador/${marcadorFile.filename}`;
		}

		// Guarda las rutas de los archivos subidos en `images`
		if (imagesFiles && imagesFiles.length > 0) {
			createFichaDto.images = imagesFiles.map((file) => `/uploads/fichas/${file.filename}`);
		}
		return await this.fichaService.create(createFichaDto);
	}

	@Put('/:id')
	@UsePipes(new ValidationPipe({transform: true}))
	@UseInterceptors(
		FileInterceptor('marcador', UploadsService.configureMulter(5 * 1024 * 1024, 'fichas/marcador')),
		FilesInterceptor('images', 5, UploadsService.configureMulter(5 * 1024 * 1024, 'fichas')),
	)
	async update(
		@Param() params: FindUserByIdDto,
		@Body() updateFichaDto: Dto.UpdateFichaDto,
		@UploadedFile() marcadorFile: Express.Multer.File,
		@UploadedFiles() imagesFiles: Express.Multer.File[],
	): Promise<Ficha> {
		// Si se sube un archivo en `marcador`, guarda la ruta del archivo
		if (marcadorFile) {
			updateFichaDto.marcador = `/uploads/fichas/marcador/${marcadorFile.filename}`;
		}

		// Guarda las rutas de los archivos subidos en `images`
		if (imagesFiles && imagesFiles.length > 0) {
			updateFichaDto.images = imagesFiles.map((file) => `/uploads/fichas/${file.filename}`);
		}

		return await this.fichaService.update(params.id, updateFichaDto);
	}

	@Delete('/:id')
	@UsePipes(new ValidationPipe({transform: true}))
	async delete(@Param() params: FindUserByIdDto): Promise<void> {
		return this.fichaService.delete(params.id);
	}
}
