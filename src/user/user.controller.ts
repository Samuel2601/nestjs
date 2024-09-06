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
} from '@nestjs/common';
import { User } from 'src/models/user.schema';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';

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
  async findById(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Actualizar un usuario (PUT /users/:id)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const updatedUser = await this.usersService.updateUser(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  // Eliminar un usuario (DELETE /users/:id)
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ deleted: boolean }> {
    const result = await this.usersService.deleteUser(id);
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { deleted: true };
  }
}
