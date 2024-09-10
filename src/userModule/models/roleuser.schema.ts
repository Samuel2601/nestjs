import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';

@Schema({timestamps: true})
export class RoleUser extends Document {
	@Prop({required: true, unique: true})
	name: string;

	@Prop([{type: Types.ObjectId, ref: 'permission'}])
	permisos: Types.ObjectId[];

	@Prop({unique: true})
	orden: number;

	// Método estático para verificar métodos protegidos
	static isProtected(method: string): boolean {
		const protectedMethods = ['get', 'post', 'put', 'delete', 'createBatch', 'updateBatch'];
		return protectedMethods.includes(method);
	}
}

export const RoleUserSchema = SchemaFactory.createForClass(RoleUser);
