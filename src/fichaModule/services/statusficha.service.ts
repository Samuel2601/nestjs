/*
https://docs.nestjs.com/providers#services
*/

import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Status} from '../models/status.schema';
import {Model} from 'mongoose';
import {CreateStatusDto, UpdateStatusDto} from '../fichaModule.dto';
import {apiResponse} from 'src/common/helpers/apiResponse';

@Injectable()
export class StatusFichaService {
	constructor(@InjectModel(Status.name) private statusModel: Model<Status>) {}

	async findAll(): Promise<any> {
		try {
			// Ordena los estados por el campo 'order' en orden ascendente
			const statuses = await this.statusModel.find().sort({order: 1}).exec();
			return apiResponse(200, 'Statuses obtenidos con éxito.', statuses, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR al obtener los estados.', null, error);
		}
	}

	async findOne(id: string): Promise<any> {
		try {
			const status = await this.statusModel.findById(id).exec();
			if (!status) {
				return apiResponse(404, 'Status no encontrado', null, null);
			}
			return apiResponse(200, 'Status obtenido con éxito', status, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR al obtener el estado.', null, error);
		}
	}

	async create(createStatusDto: CreateStatusDto): Promise<any> {
		try {
			const newStatus = new this.statusModel(createStatusDto);
			const savedStatus = await newStatus.save();
			return apiResponse(201, 'Status creado con éxito.', savedStatus, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR al crear el estado.', null, error);
		}
	}

	async update(id: string, updateStatusDto: UpdateStatusDto): Promise<any> {
		try {
			const updatedStatus = await this.statusModel.findByIdAndUpdate(id, updateStatusDto, {new: true}).exec();
			if (!updatedStatus) {
				return apiResponse(404, 'Status no encontrado', null, null);
			}
			return apiResponse(200, 'Status actualizado con éxito', updatedStatus, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR al actualizar el estado.', null, error);
		}
	}

	async delete(id: string): Promise<any> {
		try {
			const result = await this.statusModel.findByIdAndDelete(id).exec();
			if (!result) {
				return apiResponse(404, 'Status no encontrado', null, null);
			}
			return apiResponse(204, 'Status eliminado con éxito', null, null); // No content response
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR al eliminar el estado.', null, error);
		}
	}
}
