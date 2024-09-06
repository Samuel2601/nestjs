import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, uppercase: true, description: 'Name User Module' })
  name: string;

  @Prop({ uppercase: true, description: 'LastName User Module' })
  last_name?: string;

  @Prop({
    trim: true,
    lowercase: true,
    description: 'Identification User Module',
  })
  dni?: string;

  @Prop({ description: 'Telf User Module' })
  telf?: string;

  @Prop({
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    index: true,
    description: 'Email User Module',
  })
  email: string;

  @Prop({
    description: 'Password no require for User Module [Facebook, Google]',
  })
  password?: string;

  @Prop({ default: false })
  verificado: boolean;

  @Prop({ default: true, required: true })
  status: boolean;

  @Prop({ type: Types.ObjectId, ref: 'role', required: true })
  role: Types.ObjectId;

  @Prop({ default: null })
  googleId?: string;

  @Prop({ default: null })
  facebookId?: string;

  @Prop({ default: null })
  photo?: string;

  @Prop()
  verificationCode?: string;

  @Prop({ default: Date.now, required: true })
  createdAt: Date;

  @Prop()
  password_temp?: string;

  // Método estático para verificar métodos protegidos
  static isProtected(method: string): boolean {
    const protectedMethods = [
      'get',
      //"post",
      'put',
      'delete',
      'createBatch',
      'updateBatch',
    ];
    return protectedMethods.includes(method);
  }
}

// Crear el esquema usando SchemaFactory
export const UserSchema = SchemaFactory.createForClass(User);
