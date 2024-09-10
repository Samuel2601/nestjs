import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {User} from 'src/userModule/models/user.schema';
import {CreateUserDto, UpdateUserDto} from './user.dto';
import * as bcrypt from 'bcrypt';
/**
 * Esta clase maneja las operaciones CRUD para los usuarios.
 */
@Injectable()
export class UserService {
	/**
	 * Constructor del servicio de usuarios.
	 * @param userModel Modelo inyectado de Mongoose para los usuarios.
	 */
	constructor(@InjectModel('user') private userModel: Model<User>) {}

	/**
	 * Crea un nuevo usuario en la base de datos.
	 * La contraseña se cifra utilizando bcrypt.
	 * @param data DTO que contiene los datos para crear un nuevo usuario.
	 * @returns Promesa que resuelve con el nuevo usuario creado.
	 */
	async createUser(data: CreateUserDto): Promise<User> {
		const hashedPassword = await bcrypt.hash(data.password, 10); // Hash de la contraseña
		const newUser = new this.userModel({
			...data,
			password: hashedPassword,
		});
		return newUser.save();
	}

	/**
	 * Encuentra un usuario por su ID.
	 * @param id ID del usuario a buscar.
	 * @returns Promesa que resuelve con el usuario encontrado o null si no existe.
	 */
	async findById(id: string): Promise<User | null> {
		return this.userModel.findById(id).populate('role').exec();
	}

	/**
	 * Devuelve una lista de todos los usuarios en la base de datos.
	 * @returns Promesa que resuelve con una lista de usuarios.
	 */
	async findAll(): Promise<User[]> {
		return this.userModel.find().populate('role').exec();
	}

	/**
	 * Actualiza un usuario por su ID.
	 * @param id ID del usuario a actualizar.
	 * @param updateUserDto DTO con los datos de actualización.
	 * @returns Promesa que resuelve con el usuario actualizado o null si no se encuentra.
	 */
	async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
		return this.userModel.findByIdAndUpdate(id, updateUserDto, {new: true}).exec();
	}

	/**
	 * Elimina un usuario por su ID.
	 * @param id ID del usuario a eliminar.
	 * @returns Promesa que resuelve con true si el usuario fue eliminado, o false si no se encontró.
	 */
	async deleteUser(id: string): Promise<boolean> {
		const result = await this.userModel.findByIdAndDelete(id).exec();
		return result !== null;
	}
}
