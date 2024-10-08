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
} from '@nestjs/common';
import {UserService} from './user.service';
import {CreateUserDto, UpdateUserDto} from './user.dto';
import {FindUserByIdDto} from 'src/common/dto/id.dto';

@Controller('/users')
export class UserController {
	constructor(private readonly usersService: UserService) {}

	// Obtener todos los usuarios (GET /users)
	@Get()
	async getAllUsers() {
		return this.usersService.findAll();
	}

	// Obtener un usuario por su ID (GET /users/:id)
	@Get('/:id')
	@UsePipes(new ValidationPipe({transform: true}))
	async findById(@Param() params: FindUserByIdDto): Promise<any> {
		return await this.usersService.findById(params.id);
	}

	// Crear un nuevo usuario (POST /users)
	@Post()
	async createUser(@Body() userDto: CreateUserDto): Promise<any> {
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
