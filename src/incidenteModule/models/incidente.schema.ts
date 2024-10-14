import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/userModule/models/user.schema';
import { Subcategoria } from './categoria.schema';

@Schema({ timestamps: true })
export class Incidente extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  owner: Types.ObjectId;

  @Prop({
    type: { lat: Number, lng: Number },
    required: true,
  })
  geolocation: { lat: number; lng: number };

  @Prop({
    type: String,
    default: 'Pendiente',
    enum: ['Pendiente', 'En proceso', 'Finalizado'],
  })
  status: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: Subcategoria.name, required: true })
  subcategoria: Types.ObjectId;

  @Prop([
    {
      _id: false,
      owner_resp: { type: Types.ObjectId, ref: User.name },
      description_resp: { type: String },
      observacion: { type: String },
      images: [String],
    },
  ])
  respuesta: {
    owner_resp: Types.ObjectId;
    description_resp: string;
    observacion: string;
    images: string[];
  }[];
}

export const IncidenteSchema = SchemaFactory.createForClass(Incidente);