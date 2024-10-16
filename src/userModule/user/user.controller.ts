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
	UsePipes,
	ValidationPipe,
	UseInterceptors,
	UploadedFile,
} from '@nestjs/common';
import {UserService} from './user.service';
import {CreateUserDto, UpdateUserDto} from './user.dto';
import {FindUserByIdDto} from 'src/common/dto/id.dto';
import {InjectModel} from '@nestjs/mongoose';
import {User} from '../models/user.schema';
import {CriterioService} from 'src/common/dto/params&populate/criterioFormat.service';
import {Model} from 'mongoose';
import {FileInterceptor} from '@nestjs/platform-express';
import {UploadsService} from 'src/common/uploads/uploads.service';

@Controller('/users')
export class UserController {
	constructor(
		private readonly usersService: UserService,
		@InjectModel(User.name) private roleModel: Model<User>,
		private readonly criterioService: CriterioService,
	) {}

	// Obtener un usuario por su ID (GET /users/:id)
	@Get('/:id')
	@UsePipes(new ValidationPipe({transform: true}))
	async findById(@Param() params: FindUserByIdDto): Promise<any> {
		return await this.usersService.findById(params.id);
	}

	// Obtener todos los usuarios (GET /users)
	@Get()
	async getAllUsersfilter(@Query() query) {
		// Obtener los filtros y los campos de populate
		const {filter, populateFields} = this.criterioService.getfilterPopulate(query);
		// Formatear los filtros
		const filterparse = this.criterioService.criterioFormat(this.roleModel, filter);
		const populateFieldsparse = this.criterioService.getPopulateFields(this.roleModel, populateFields); // Obtener los campos de populate

		return this.usersService.findAllfilter(filterparse, populateFieldsparse);
	}

	// Crear un nuevo usuario (POST /users)
	@Post()
	@UsePipes(new ValidationPipe({transform: true}))
	@UseInterceptors(FileInterceptor('photo', UploadsService.configureMulter(5 * 1024 * 1024, 'users'))) //uso del fileinterceptor para subir el archivo
	async createUser(@Body() userDto: CreateUserDto, @UploadedFile() file: Express.Multer.File): Promise<any> {
		if (file) {
			userDto.photo = file.filename;
		}
		return await this.usersService.createUser(userDto);
	}

	// Actualizar un usuario (PUT /users/:id)
	@Put('/:id')
	@UsePipes(new ValidationPipe({transform: true}))
	async updateUser(@Param() params: FindUserByIdDto, @Body() updateUserDto: UpdateUserDto): Promise<any> {
		return await this.usersService.updateUser(params.id, updateUserDto);
	}

	// Eliminar un usuario (DELETE /users/:id)
	@Delete('/:id')
	@UsePipes(new ValidationPipe({transform: true}))
	async deleteUser(@Param() params: FindUserByIdDto): Promise<any> {
		return await this.usersService.deleteUser(params.id);
	}

	@Post('batch')
	@UsePipes(new ValidationPipe({transform: true}))
	async createBatch(@Body() createUsersDto: CreateUserDto[]): Promise<any> {
		return await this.usersService.createBatch(createUsersDto);
	}

	@Put('batch')
	@UsePipes(new ValidationPipe({transform: true}))
	async updateBatch(@Body() updateUsersDto: UpdateUserDto[]): Promise<any> {
		return await this.usersService.updateBatch(updateUsersDto);
	}
}
