import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';

@Schema()
export class Status extends Document {
	@Prop({required: true, unique: true, trim: true})
	name: string;

	@Prop({required: true})
	order: number; // Campo para manejar el orden del estado

	@Prop({default: false})
	is_default: boolean; // Indica si este es el estado predeterminado

	@Prop({required: true, default: 7}) // Número de días para cambiar al siguiente estado
	daysToNext: number;
}

export const StatusSchema = SchemaFactory.createForClass(Status);
