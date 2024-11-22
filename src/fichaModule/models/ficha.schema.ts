import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Number, Types} from 'mongoose';
import {User} from 'src/userModule/models/user.schema';
import {Actividad} from './actividad.schema';
import { Status } from './status.schema';

@Schema({timestamps: true})
export class Ficha extends Document {
	@Prop({type: Types.ObjectId, ref: User.name, required: true})
	owner: Types.ObjectId;

	@Prop({
		type: {lat: Number, lng: Number},
		required: true,
	})
	geolocation: {lat: number; lng: number};

	@Prop({required: true, trim: true})
	title: string;

	@Prop({required: true, trim: true})
	description: string;

	@Prop({type: Types.ObjectId, ref: Actividad.name, required: true})
	actividad: Types.ObjectId;

	@Prop({default: false})
	is_map_event: boolean;

	@Prop({default: false})
	is_banner: boolean;

	@Prop({type: Types.ObjectId, ref: Status.name, required: true}) // Referencia a Status
	status: Types.ObjectId;

	@Prop({type: String})
	observacion?: string;

	@Prop({type: Date, required: true})
	date_event: Date;

	@Prop({type: [String], default: []})
	images: string[];

	@Prop({type: String, required: false})
	marcador?: string | null;

	@Prop({type: Number, default: 0})
	share: Number;

	@Prop([{type: Types.ObjectId, ref: User.name}])
	likes: Types.ObjectId[];

	@Prop([
		{
			_id: false,
			owner: {type: Types.ObjectId, ref: User.name},
			date: {type: Date, default: Date.now},
			puntaje: {type: Number},
		},
	])
	comment: {
		owner: Types.ObjectId;
		date: Date;
		puntaje: number;
	}[];
}

export const FichaSchema = SchemaFactory.createForClass(Ficha);
