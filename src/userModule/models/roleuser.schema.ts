import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types, Model} from 'mongoose';
import {Permission} from './permiso.schema';

@Schema({timestamps: true})
export class RoleUser extends Document {
	@Prop({required: true, unique: true})
	name: string;

	@Prop([{type: Types.ObjectId, ref: Permission.name}])
	permisos: Permission[];

	@Prop({type: Boolean, default: false})
	is_default: boolean;

	@Prop({default: 'own'}) // 'own' o 'all'
	access_scope: string;

	// Método estático para verificar si el método está protegido
	static isProtected(method: string): boolean {
		const protectedMethods = ['get', 'post', 'put', 'delete', 'createBatch', 'updateBatch'];
		return protectedMethods.includes(method);
	}
	// Nombre del modelo que puedes reutilizar
	//static modelName = 'RoleUser';
}

export const RoleUserSchema = SchemaFactory.createForClass(RoleUser);

// Middleware para actualizar el rol por defecto
RoleUserSchema.pre<RoleUser>('save', async function (next) {
	if (this.is_default) {
		// Desmarcar el anterior rol por defecto, si existe
		// Aquí se utiliza el modelo directamente
		//const RoleUserModel = this.constructor as Model<RoleUser>;
		const RoleUserModel = this.model(RoleUser.name) as Model<RoleUser>;
		await RoleUserModel.updateMany({is_default: true}, {$set: {is_default: false}});
	}

	next();
});
