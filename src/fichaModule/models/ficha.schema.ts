import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Ficha extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({
    type: { lat: Number, lng: Number },
    required: true,
  })
  geolocation: { lat: number; lng: number };

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Actividad', required: true })
  actividad: Types.ObjectId;

  @Prop({ default: false })
  is_map_event: boolean;

  @Prop({ default: false })
  is_banner: boolean;

  @Prop({
    type: String,
    default: 'Planificado',
    enum: ['Planificado', 'En proceso', 'Finalizado', 'Suspendido', 'Cancelado'],
  })
  status: string;

  @Prop({ type: String })
  observacion?: string;

  @Prop({ type: Date, required: true })
  date_event: Date;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: String })
  marcador?: string;

  @Prop({ type: Boolean, default: false })
  share: boolean;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  likes: Types.ObjectId[];

  @Prop([
    {
      _id: false,
      owner: { type: Types.ObjectId, ref: 'User' },
      date: { type: Date, default: Date.now },
      puntaje: { type: Number },
    },
  ])
  comment: {
    owner: Types.ObjectId;
    date: Date;
    puntaje: number;
  }[];
}

export const FichaSchema = SchemaFactory.createForClass(Ficha);
