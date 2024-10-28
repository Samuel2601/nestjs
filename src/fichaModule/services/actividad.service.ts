/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Actividad } from '../models/actividad.schema';
import { Model } from 'mongoose';
import { apiResponse } from 'src/common/helpers/apiResponse';
import { CreateActividadDto, UpdateActividadDto } from '../fichaModule.dto';


@Injectable()
export class ActividadService {
    constructor(@InjectModel(Actividad.name) private actividadModel: Model<Actividad>) {}

	async findAll(): Promise<any> {
		try {
			const actividades = await this.actividadModel.find().sort({createdAt: -1}).exec();
			return apiResponse(200, 'Actividades obtenidas con éxito.', actividades, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR al obtener las actividades.', null, error);
		}
	}

	async findOne(id: string): Promise<any> {
		try {
			const actividad = await this.actividadModel.findById(id).exec();
			if (!actividad) {
				return apiResponse(404, 'Actividad no encontrada', null, null);
			}
			return apiResponse(200, 'Actividad obtenida con éxito', actividad, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR al obtener la actividad.', null, error);
		}
	}

	async create(createActividadDto: CreateActividadDto): Promise<any> {
		try {
			const newActividad = new this.actividadModel(createActividadDto);
			const savedActividad = await newActividad.save();
			return apiResponse(201, 'Actividad creada con éxito.', savedActividad, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR al crear la actividad.', null, error);
		}
	}

	async update(id: string, updateActividadDto: UpdateActividadDto): Promise<any> {
		try {
			const updatedActividad = await this.actividadModel.findByIdAndUpdate(id, updateActividadDto, {new: true}).exec();
			if (!updatedActividad) {
				return apiResponse(404, 'Actividad no encontrada', null, null);
			}
			return apiResponse(200, 'Actividad actualizada con éxito', updatedActividad, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR al actualizar la actividad.', null, error);
		}
	}

	async delete(id: string): Promise<any> {
		try {
			const result = await this.actividadModel.findByIdAndDelete(id).exec();
			if (!result) {
				return apiResponse(404, 'Actividad no encontrada', null, null);
			}
			return apiResponse(204, 'Actividad eliminada con éxito', null, null); // No content response
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR al eliminar la actividad.', null, error);
		}
	}
}
