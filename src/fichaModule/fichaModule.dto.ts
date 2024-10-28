import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsBoolean, IsDate, IsArray, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateFichaDto {
  @IsNotEmpty()
  owner: Types.ObjectId;

  @IsNotEmpty()
  geolocation: { lat: number; lng: number };

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

  @IsString()
  @IsOptional()
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
  @IsOptional()
  _id?: Types.ObjectId;
}