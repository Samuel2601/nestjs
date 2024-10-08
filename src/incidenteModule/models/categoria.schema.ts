import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Categoria extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop([{ type: Types.ObjectId, ref: 'Subcategoria' }])
  subcategorias: Types.ObjectId[];

  @Prop({ type: String, required: false })
  image?: string;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  users: Types.ObjectId[];
}

@Schema({ timestamps: true })
export class Subcategoria extends Document {
  @Prop({ required: true })
  name: string;
}

export const CategoriaSchema = SchemaFactory.createForClass(Categoria);

