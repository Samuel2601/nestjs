import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Categoria extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop([
    {
      _id: false,
      id: Types.ObjectId,
      name: { type: String, required: true },
    },
  ])
  subcategoria: { id: Types.ObjectId; name: string }[];

  @Prop({ type: String, required: false })
  image?: string;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  users: Types.ObjectId[];
}

export const CategoriaSchema = SchemaFactory.createForClass(Categoria);
