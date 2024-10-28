import {Injectable, NotFoundException} from '@nestjs/common';
import { Model } from 'mongoose';
import { Ficha } from './models/ficha.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateFichaDto, UpdateFichaDto } from './fichaModule.dto';

@Injectable()
export class FichaModuleService {
  constructor(@InjectModel(Ficha.name) private fichaModel: Model<Ficha>) { }
  
	async create(createFichaDto: CreateFichaDto): Promise<Ficha> {
		const newFicha = new this.fichaModel(createFichaDto);
		return newFicha.save();
	}

	async findAll(): Promise<Ficha[]> {
		return this.fichaModel.find().populate('owner actividad likes.comment.owner').exec();
	}

	async findOne(id: string): Promise<Ficha> {
		const ficha = await this.fichaModel.findById(id).populate('owner actividad likes.comment.owner').exec();
		if (!ficha) throw new NotFoundException('Ficha not found');
		return ficha;
	}

	async update(id: string, updateFichaDto: UpdateFichaDto): Promise<Ficha> {
		const updatedFicha = await this.fichaModel.findByIdAndUpdate(id, updateFichaDto, {new: true}).exec();
		if (!updatedFicha) throw new NotFoundException('Ficha not found');
		return updatedFicha;
	}

	async delete(id: string): Promise<void> {
		const result = await this.fichaModel.findByIdAndDelete(id).exec();
		if (!result) throw new NotFoundException('Ficha not found');
	}
}