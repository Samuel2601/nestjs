import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true })
export class Subcategoria extends Document {
  @Prop({ required: true })
  name: string;
  @Prop({ type: String, required: false })
  image?: string;
}

export const SubcategoriaSchema = SchemaFactory.createForClass(Subcategoria);

@Schema({ timestamps: true })
export class Categoria extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop([{ type: Types.ObjectId, ref: Subcategoria.name }])
  subcategorias: Types.ObjectId[];

  @Prop({ type: String, required: false })
  image?: string;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  users: Types.ObjectId[];
}

export const CategoriaSchema = SchemaFactory.createForClass(Categoria);

