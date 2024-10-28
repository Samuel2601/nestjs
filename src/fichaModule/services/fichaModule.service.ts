import {Injectable} from '@nestjs/common';
import {Model} from 'mongoose';
import {Ficha} from '../models/ficha.schema';
import {InjectModel} from '@nestjs/mongoose';
import {CreateFichaDto, UpdateFichaDto} from '../fichaModule.dto';
import {apiResponse} from 'src/common/helpers/apiResponse';
import {Status} from '../models/status.schema';

@Injectable()
export class FichaModuleService {
	constructor(
		@InjectModel(Ficha.name) private fichaModel: Model<Ficha>,
		@InjectModel(Status.name) private statusModel: Model<Status>,
	) {}

	async create(createFichaDto: CreateFichaDto): Promise<any> {
		try {
			// Si el estado no está en el DTO, asignar el estado predeterminado
			if (!createFichaDto.status) {
				let defaultStatus = await this.statusModel.findOne({is_default: true}).exec();

				// Ejecuta el inicializador si no hay un estado predeterminado
				if (!defaultStatus) {
					defaultStatus = await this.initializeDefaultStatus();
				}

				// Asigna el estado predeterminado al DTO
				createFichaDto.status = defaultStatus._id.toString();
			}

			const newFicha = new this.fichaModel(createFichaDto);
			await newFicha.save();
			return apiResponse(201, 'Ficha creada con éxito.', newFicha, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	// Método para inicializar el estado predeterminado en caso de que no exista
	private async initializeDefaultStatus(): Promise<Status> {
		const defaultStatus = new this.statusModel({
			name: 'Planificado',
			order: 1,
			is_default: true,
		});

		return defaultStatus.save();
	}

	async findAll(params, populateFields = []): Promise<any> {
		try {
			let query = this.fichaModel.find(params).sort({createdAt: -1});
			populateFields.forEach((field) => {
				query = query.populate(field);
			});
			const data = await query.exec();
			return apiResponse(200, 'Fichas obtenidos con éxito.', data, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	async findOne(id: string): Promise<any> {
		try {
			const ficha = await this.fichaModel.findById(id).populate('owner actividad status likes.comment.owner').exec();
			if (!ficha) {
				return apiResponse(404, 'Ficha no encontrada', null, null);
			}
			return apiResponse(200, 'Ficha obtenida con éxito', ficha, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	async update(id: string, updateFichaDto: UpdateFichaDto): Promise<any> {
		try {
			const updatedFicha = await this.fichaModel.findByIdAndUpdate(id, updateFichaDto, {new: true}).exec();
			if (!updatedFicha) {
				return apiResponse(404, 'Ficha no encontrada', null, null);
			}
			return apiResponse(200, 'Ficha actualizada con éxito', updatedFicha, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	async delete(id: string): Promise<any> {
		try {
			const result = await this.fichaModel.findByIdAndDelete(id).exec();
			if (!result) {
				return apiResponse(404, 'Ficha no encontrada', null, null);
			}
			return apiResponse(204, 'Ficha eliminada con éxito', null, null); // No content response
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}
}
