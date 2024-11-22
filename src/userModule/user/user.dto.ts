import { PartialType } from '@nestjs/mapped-types';
import {IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean, IsMongoId, MinLength} from 'class-validator';

/**
 * DTO para crear un nuevo usuario.
 */
export class CreateUserDto {
	/**
	 * Nombre del usuario.
	 */
	@IsString()
	@IsNotEmpty()
	name: string;

	/**
	 * Apellido del usuario (opcional).
	 */
	@IsString()
	@IsOptional()
	last_name?: string;

	/**
	 * DNI del usuario (opcional).
	 */
	@IsString()
	@IsOptional()
	dni?: string;

	/**
	 * Teléfono del usuario (opcional).
	 */
	@IsString()
	@IsOptional()
	phone?: string; // Cambiado de 'telf' a 'phone' para que coincida con el esquema

	/**
	 * Correo electrónico del usuario.
	 */
	@IsEmail()
	@IsNotEmpty()
	email: string;

	/**
	 * Contraseña del usuario (opcional).
	 */
	@IsString()
	@IsOptional()
	@MinLength(6)
	password?: string;

	/**
	 * Estado del usuario (activo o inactivo).
	 */
	@IsBoolean()
	@IsOptional()
	verificado?: boolean; // Agregado tipo booleano para la validación

	/**
	 * Estado del usuario (activo o inactivo).
	 */
	@IsBoolean()
	@IsOptional()
	status?: boolean; // Agregado tipo booleano para la validación

	/**
	 * Rol del usuario (referencia al ID de rol).
	 */
	@IsMongoId({message: 'Invalid ID format'})
	@IsOptional()
	role: string; // Mantén esto como string, ya que es una referencia a un ObjectId en tu esquema

	/**
	 * URL de la foto del usuario (opcional).
	 */
	@IsString()
	@IsOptional()
	photo?: string;

	/**
	 * Redes sociales del usuario (opcional).
	 */
	@IsOptional()
	redes?: {
		provider: string; // Ejemplo: 'google', 'facebook', 'github'
		providerId: string; // ID del usuario en el proveedor
		profileUrl?: string; // URL de perfil del usuario en esa red social
	}[];
}

/**
 * DTO para actualizar un usuario existente.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
	/*
	* Identificador del usuario.
	*/
	@IsMongoId()
	_id: string;
}
