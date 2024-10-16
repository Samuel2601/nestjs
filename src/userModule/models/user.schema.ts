import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import mongoose, {Document, Model, Types} from 'mongoose';
import {RoleUser} from './roleuser.schema';

// Subdocumento para redes sociales
export class SocialNetwork {
	// Cambié aquí para exportarlo
	@Prop({required: true})
	provider: string; // Ejemplo: 'google', 'facebook', 'github'

	@Prop({required: true})
	providerId: string; // ID del usuario en el proveedor

	@Prop({default: null})
	profileUrl?: string; // URL de perfil del usuario en esa red social
}

@Schema({timestamps: true})
export class User extends Document {
	@Prop({required: true, uppercase: true, description: 'Name User Module'})
	name: string;

	@Prop({uppercase: true, description: 'LastName User Module'})
	last_name?: string;

	@Prop({
		trim: true,
		lowercase: true,
		description: 'Identification User Module',
	})
	dni?: string;

	@Prop({description: 'Telf User Module'})
	phone?: string;

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
		description: 'Password no required for User Module [Facebook, Google]',
	})
	password?: string;

	@Prop({default: false})
	verificado: boolean;

	@Prop({default: true, required: true})
	status: boolean;

	@Prop({type: Types.ObjectId, ref: RoleUser.name})
	role: Types.ObjectId;

	@Prop({type: [SocialNetwork], default: []})
	redes: SocialNetwork[]; // Array de redes sociales

	@Prop({default: null})
	photo?: string;

	@Prop({default: null})
	verificationCode?: string;

	@Prop({default: Date.now, required: true})
	createdAt: Date;

	@Prop()
	password_temp?: string;

	// Método estático para verificar métodos protegidos
	static isProtected(method: string): boolean {
		const protectedMethods = ['get', 'put', 'delete', 'createBatch', 'updateBatch'];
		return protectedMethods.includes(method);
	}
	// Nombre del modelo que puedes reutilizar
	//static modelName = 'User';
}

// Crear el esquema usando SchemaFactory
export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save para asignar el rol predeterminado si no tiene rol
UserSchema.pre<User>('save', async function (next) {
	if (!this.role) {
		// Si el usuario no tiene rol asignado, buscar el rol predeterminado
		const RoleUserModel = this.model(RoleUser.name) as Model<RoleUser>; // Accede al modelo correcto
		console.log("ROLES ENCONTRADOS: ",await RoleUserModel.find());
		const defaultRole = await RoleUserModel.findOne({is_default: true});
		console.log('ROL de default', defaultRole);

		if (defaultRole) {
			this.role = defaultRole._id as Types.ObjectId;
		}
	}
	next();
});
