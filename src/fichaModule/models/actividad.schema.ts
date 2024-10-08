import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Actividad extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, required: false })
  image?: string;
}

export const ActividadSchema = SchemaFactory.createForClass(Actividad);
