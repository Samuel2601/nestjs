import {PartialType} from '@nestjs/mapped-types';
import {IsNotEmpty, IsString, IsBoolean, IsDate, IsArray, IsOptional, IsUrl, IsMongoId} from 'class-validator';
import {Types} from 'mongoose';

export class CreateFichaDto {
	@IsNotEmpty()
	owner: Types.ObjectId;

	@IsNotEmpty()
	geolocation: {lat: number; lng: number};

	@IsNotEmpty()
	@IsString()
	title: string;

	@IsNotEmpty()
	@IsString()
	description: string;

	@IsNotEmpty()
	actividad: Types.ObjectId;

	@IsBoolean()
	@IsOptional()
	is_map_event?: boolean;

	@IsBoolean()
	@IsOptional()
	is_banner?: boolean;

	@IsString()
	@IsOptional()
	status?: string;

	@IsString()
	@IsOptional()
	observacion?: string;

	@IsNotEmpty()
	@IsDate()
	date_event: Date;

	@IsArray()
	@IsOptional()
	images?: string[];

	@IsOptional()
	@IsString()
	@IsUrl({}, {message: 'El marcador debe ser una URL válida o una imagen'})
	marcador?: string;

	@IsOptional()
	share?: number;

	@IsOptional()
	likes?: Types.ObjectId[];

	@IsOptional()
	comment?: {
		owner: Types.ObjectId;
		date: Date;
		puntaje: number;
	}[];
}

export class UpdateFichaDto extends PartialType(CreateFichaDto) {
	@IsMongoId()
	_id?: Types.ObjectId;
}

export class CreateStatusDto {
	@IsString()
	status: string;

	@IsOptional()
	is_default?: boolean;
}

export class UpdateStatusDto extends PartialType(CreateStatusDto) {
	@IsMongoId()
	_id: Types.ObjectId;
}

// DTO para crear una nueva actividad
export class CreateActividadDto {
	@IsString({message: 'El nombre es obligatorio.'})
	name: string;

	@IsOptional()
	@IsString({message: 'La imagen debe ser una cadena de texto.'})
	image?: string;
}

// DTO para actualizar una actividad existente
export class UpdateActividadDto extends CreateActividadDto {
	@IsMongoId({message: 'Invalid ID format'})
	_id: string;
}
