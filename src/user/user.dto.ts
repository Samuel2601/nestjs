import {IsBoolean, IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString, MinLength} from 'class-validator';

export class CreateUserDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	last_name?: string;

	@IsString()
	dni?: string;

	@IsString()
	telf?: string;

	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	password?: string;

	@IsNotEmpty()
	status: boolean;

	@IsString()
	role: string; // Cambia el tipo según tu esquema de rol

	googleId?: string;

	facebookId?: string;

	photo?: string;

	verificationCode?: string;

	password_temp?: string;
}

export class UpdateUserDto {
	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	last_name?: string;

	@IsString()
	@IsOptional()
	dni?: string;

	@IsString()
	@IsOptional()
	telf?: string;

	@IsEmail()
	@IsOptional()
	email?: string;

	@IsString()
	@IsOptional()
	@MinLength(6) // Asegura que la contraseña tenga al menos 6 caracteres si se proporciona
	password?: string;

	@IsBoolean()
	@IsOptional()
	verificado?: boolean;

	@IsBoolean()
	@IsOptional()
	status?: boolean;

	@IsMongoId()
	@IsOptional()
	role?: string;

	@IsString()
	@IsOptional()
	googleId?: string;

	@IsString()
	@IsOptional()
	facebookId?: string;

	@IsString()
	@IsOptional()
	photo?: string;

	@IsString()
	@IsOptional()
	verificationCode?: string;

	@IsOptional()
	createdAt?: Date;

	@IsString()
	@IsOptional()
	password_temp?: string;
}