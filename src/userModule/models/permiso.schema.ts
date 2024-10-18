import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import { User } from './user.schema';
import { forwardRef } from '@nestjs/common';

@Schema({timestamps: true})
export class Permission extends Document {
	@Prop({required: true, lowercase: true, trim: true})
	name: string;

	@Prop({required: true, lowercase: true, trim: true})
	method: string;

	@Prop([{type: Types.ObjectId, ref: forwardRef(() => User.name)}])
	users: User[];

	@Prop({type: Boolean, default: false})
	is_default: boolean;

	// Método estático para verificar métodos protegidos
	static isProtected(method: string): boolean {
		const protectedMethods = ['get', 'post', 'put', 'delete', 'createBatch', 'updateBatch'];
		return protectedMethods.includes(method);
	}
	// Nombre del modelo que puedes reutilizar
	//static modelName = 'Permission';
}

// Índice compuesto para asegurar que la combinación de name y method sea única
export const PermissionSchema = SchemaFactory.createForClass(Permission);
PermissionSchema.index({name: 1, method: 1}, {unique: true});
