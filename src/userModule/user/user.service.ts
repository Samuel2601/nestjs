import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {User} from 'src/userModule/models/user.schema';
import {CreateUserDto, UpdateUserDto} from './user.dto';
import * as bcrypt from 'bcrypt';
import {apiResponse} from 'src/common/helpers/apiResponse';
import {RoleService} from '../role/role.service';
/**
 * Esta clase maneja las operaciones CRUD para los usuarios.
 */
@Injectable()
export class UserService {
	/**
	 * Constructor del servicio de usuarios.
	 * @param userModel Modelo inyectado de Mongoose para los usuarios.
	 */
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		private readonly roleService: RoleService,
	) {}

	/**
	 * Crea un nuevo usuario en la base de datos.
	 * La contraseña se cifra utilizando bcrypt.
	 * @param data DTO que contiene los datos para crear un nuevo usuario.
	 * @returns Promesa que resuelve con el nuevo usuario creado.
	 */
	async createUser(data: CreateUserDto): Promise<any> {
		try {
			if (data.password) {
				data.password = await bcrypt.hash(data.password, 10); // Hash de la contraseña
			}
			// Si no se proporciona un rol, intenta obtener el rol por defecto
			if (!data.role) {
				const defaultRole = await this.roleService.getDefaultRole();
				if (defaultRole) {
					data.role = defaultRole._id.toString(); // Asigna el ID del rol por defecto al usuario
				} else {
					return apiResponse(400, 'No se encontró un rol por defecto.', null, null);
				}
			}
			const newUser = new this.userModel(data);
			const user = await newUser.save();
			return apiResponse(201, 'Usuario creado con éxito.', user, null);
		} catch (error) {
			console.error(error);

			// Devuelve un mensaje específico según el error
			const errorMessage = error.code === 11000 ? 'El usuario ya existe.' : 'Error al crear el usuario.';

			return apiResponse(500, errorMessage, null, error);
		}
	}

	/**
	 * Encuentra un usuario por su ID.
	 * @param id ID del usuario a buscar.
	 * @returns Promesa que resuelve con el usuario encontrado o null si no existe.
	 */
	async findById(id: string): Promise<any> {
		try {
			const user = await this.userModel.findById(id).populate('role').exec();
			if (!user) {
				//throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
				return apiResponse(404, 'Usuario no encontrado', null, null);
			}
			return apiResponse(200, 'Usuario obtenido con éxito.', user, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	/**
	 * Devuelve una lista de todos los usuarios en la base de datos.
	 * @returns Promesa que resuelve con una lista de usuarios.
	 */
	async findAll(): Promise<any> {
		try {
			const data = await this.userModel.find().populate('role').exec();
			return apiResponse(200, 'Usuarios obtenidos con éxito.', data, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	/**
	 * Actualiza un usuario por su ID.
	 * @param id ID del usuario a actualizar.
	 * @param updateUserDto DTO con los datos de actualización.
	 * @returns Promesa que resuelve con el usuario actualizado o null si no se encuentra.
	 */
	async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<any> {
		try {
			const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {new: true}).populate('role');
			if (!user) {
				//throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
				return apiResponse(404, 'Usuario no encontrado', null, null);
			}
			return apiResponse(200, 'Usuario actualizado con éxito.', user, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	/**
	 * Elimina un usuario por su ID.
	 * @param id ID del usuario a eliminar.
	 * @returns Promesa que resuelve con true si el usuario fue eliminado, o false si no se encontró.
	 */
	async deleteUser(id: string): Promise<any> {
		try {
			const deletedUser = await this.userModel.findByIdAndDelete(id);
			if (!deletedUser) {
				//throw new NotFoundException(`User with ID ${id} not found`);
				return apiResponse(404, 'Usuario no encontrado', null, null);
			}
			return apiResponse(200, 'Usuario eliminado con éxito.', deletedUser, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	async createBatch(createUsersDto: CreateUserDto[]) {
		const createdUsers = [];
		const errors = [];

		for (const userDto of createUsersDto) {
			try {
				const createdUser = await this.userModel.create(userDto);
				createdUsers.push(createdUser);
			} catch (error) {
				// Aquí puedes filtrar o registrar el error según necesites
				if (error.code === 11000) {
					// 11000 es el código de error para duplicados
					errors.push({
						user: userDto,
						message: 'Usuario ya existente',
					});
				} else {
					// Manejar otros tipos de errores si es necesario
					errors.push({
						user: userDto,
						message: error.message,
					});
				}
			}
		}

		return apiResponse(
			errors.length > 0 ? 207 : 201,
			errors.length > 0 ? 'Hubieron algunos errores al crear los usuarios.' : 'Creación de usuarios exitosa.',
			createdUsers,
			errors,
		);
	}

	async updateBatch(updateUsersDto: UpdateUserDto[]): Promise<any> {
		const updatedUsers: User[] = [];
		const errors = [];

		for (const dtoUser of updateUsersDto) {
			try {
				const user = await this.userModel.findByIdAndUpdate(dtoUser.id, dtoUser, {new: true});
				if (!user) {
					errors.push({
						id: dtoUser.id,
						message: `Usuario con ID ${dtoUser.id} no encontrado`,
					});
					continue; // Si no se encuentra el usuario, continuar con el siguiente
				}
				updatedUsers.push(user);
			} catch (error) {
				errors.push({
					id: dtoUser.id,
					message: error.message,
				});
			}
		}

		return apiResponse(
			errors.length > 0 ? 207 : 200, // 207 para "Multi-Status" si hay errores, 200 si todo fue exitoso
			errors.length > 0 ? 'Algunos usuarios no pudieron ser actualizados.' : 'Actualización de usuarios exitosa.',
			updatedUsers,
			errors,
		);
	}
}
