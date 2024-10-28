/*
https://docs.nestjs.com/providers#services
*/

import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Status} from '../models/status.schema';
import {Model, Types} from 'mongoose';
import {CreateStatusDto, UpdateStatusDto} from '../fichaModule.dto';
import {apiResponse} from 'src/common/helpers/apiResponse';
import {Ficha} from '../models/ficha.schema';

import {Cron} from '@nestjs/schedule';
@Injectable()
export class StatusFichaService {
	constructor(
		@InjectModel(Status.name) private statusModel: Model<Status>,
		@InjectModel(Ficha.name) private fichaModel: Model<Ficha>,
	) {}

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

	@Cron('0 0 * * *') // Este cron se ejecuta todos los días a la medianoche
	async handleCron() {
		const fichas = await this.fichaModel.find();

		for (const ficha of fichas) {
			await this.updateFichaStatus(ficha);
		}
	}

	async updateFichaStatus(ficha: Ficha): Promise<void> {
		const currentStatus = await this.statusModel.findById(ficha.status);

		if (!currentStatus) {
			throw new Error('Estado actual no encontrado');
		}

		// Calcular la fecha límite para el cambio de estado
		const limitDate = new Date(ficha.date_event);
		limitDate.setDate(limitDate.getDate() + currentStatus.daysToNext);

		// Verifica si ha pasado el tiempo requerido
		if (new Date() >= limitDate) {
			const nextStatus = await this.getNextStatus(currentStatus);

			if (nextStatus) {
				ficha.status = new Types.ObjectId(nextStatus._id.toString());
				await ficha.save();
			}
		}
	}

	private async getNextStatus(currentStatus: Status): Promise<Status | null> {
		return this.statusModel.findOne({order: currentStatus.order + 1}).exec();
	}
}
