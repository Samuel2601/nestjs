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
import {User} from 'src/models/user.schema';
import {UserService} from './user.service';
import {CreateUserDto, FindUserByIdDto, UpdateUserDto} from './user.dto';

@Controller('/users')
export class UserController {
	constructor(private readonly usersService: UserService) {}

	// Obtener todos los usuarios (GET /users)
	@Get()
	async getAllUsers(): Promise<User[]> {
		return this.usersService.findAll();
	}

	// Crear un nuevo usuario (POST /users)
	@Post()
	async createUser(@Body() userDto: CreateUserDto) {
		return this.usersService.createUser(userDto);
	}

	// Obtener un usuario por su ID (GET /users/:id)
	@Get('/:id')
	@UsePipes(new ValidationPipe({transform: true}))
	async findById(@Param() params: FindUserByIdDto): Promise<User> {
		const user = await this.usersService.findById(params.id);
		if (!user) {
			throw new NotFoundException(`User with ID ${params.id} not found`);
		}
		return user;
	}

	// Actualizar un usuario (PUT /users/:id)
	@Put(':id')
	@UsePipes(new ValidationPipe({transform: true}))
	async updateUser(@Param() params: FindUserByIdDto, @Body() updateUserDto: UpdateUserDto): Promise<User> {
		const updatedUser = await this.usersService.updateUser(params.id, updateUserDto);
		if (!updatedUser) {
			throw new NotFoundException(`User with ID ${params.id} not found`);
		}
		return updatedUser;
	}

	// Eliminar un usuario (DELETE /users/:id)
	@Delete(':id')
	@UsePipes(new ValidationPipe({transform: true}))
	async deleteUser(@Param() params: FindUserByIdDto): Promise<{deleted: boolean}> {
		const result = await this.usersService.deleteUser(params.id);
		if (!result) {
			throw new NotFoundException(`User with ID ${params.id} not found`);
		}
		return {deleted: true};
	}
}
