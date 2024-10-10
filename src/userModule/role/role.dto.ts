import {IsNotEmpty, IsString, IsBoolean, IsOptional, IsArray, IsMongoId} from 'class-validator';
import { Types } from 'mongoose';

export class CreateRoleUserDto {
	@IsNotEmpty()
	@IsString()
	readonly name: string;

	@IsOptional()
	@IsArray()
	@IsMongoId({each: true})
	readonly permisos?: Types.ObjectId[]; // Los IDs de permisos deben ser ObjectId

	@IsOptional()
	@IsBoolean()
	readonly is_default?: boolean; // Se puede definir si es rol por defecto o no
}

export class UpdateRoleUserDto {
	@IsMongoId()
	_id: string;
	@IsOptional()
	@IsString()
	readonly name?: string;

	@IsOptional()
	@IsArray()
	@IsMongoId({each: true})
	readonly permisos?: Types.ObjectId[]; // Actualización opcional de permisos

	@IsOptional()
	@IsBoolean()
	readonly is_default?: boolean; // Actualización opcional de rol por defecto
}
