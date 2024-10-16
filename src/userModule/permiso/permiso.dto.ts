//import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty, IsBoolean, IsString, ArrayNotEmpty, IsArray, IsOptional, IsMongoId} from 'class-validator';
import {Types} from 'mongoose';

export class CreatePermissionDto {
	//@ApiProperty({ example: 'read', description: 'Nombre del permiso' })
	@IsNotEmpty()
	@IsString()
	name: string;

	//@ApiProperty({ example: 'get', description: 'Método HTTP asociado al permiso' })
	@IsNotEmpty()
	@IsString()
	method: string;

	//@ApiProperty({ type: [String], description: 'Lista de IDs de usuarios asociados', required: false })
	@IsOptional()
	@IsArray()
	@IsMongoId({each: true})
	readonly users?: Types.ObjectId[];

	//@ApiProperty({ example: false, description: 'Indica si es el permiso predeterminado', required: false })
	@IsOptional()
	@IsBoolean()
	is_default: boolean;
}

export class UpdatePermissionDto {
	@IsNotEmpty()
	@IsMongoId()
	_id: string;

	//@ApiProperty({ example: 'read', description: 'Nombre del permiso', required: false })
	@IsOptional()
	@IsString()
	name?: string;

	//@ApiProperty({ example: 'get', description: 'Método HTTP asociado al permiso', required: false })
	@IsOptional()
	@IsString()
	method?: string;

	//@ApiProperty({ type: [String], description: 'Lista de IDs de usuarios asociados', required: false })
	@IsOptional()
	@IsArray()
	@IsMongoId({each: true})
	readonly users?: Types.ObjectId[];

	//@ApiProperty({ example: false, description: 'Indica si es el permiso predeterminado', required: false })
	@IsOptional()
	@IsBoolean()
	is_default?: boolean;
}
