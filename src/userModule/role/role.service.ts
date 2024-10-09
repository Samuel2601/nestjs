import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {apiResponse} from 'src/common/helpers/apiResponse';
import {NotificationsService} from 'src/socket.io/notifications.service';
import {RoleUser} from 'src/userModule/models/roleuser.schema';
import {User} from 'src/userModule/models/user.schema';
import {Permission} from '../models/permiso.schema';
import {CreateRoleUserDto, UpdateRoleUserDto} from './role.dto';

@Injectable()
export class RoleService {
	constructor(
		@InjectModel(RoleUser.name) private roleModel: Model<RoleUser>,
		@InjectModel(User.name) private userModel: Model<User>,
		@InjectModel(Permission.name) private permissModel: Model<Permission>,
		private notific: NotificationsService,
	) {}

	/**
	 * Devuelve una lista de todos los usuarios en la base de datos.
	 * @returns Promesa que resuelve con una lista de usuarios.
	 */
	async findAllfilter(params, populateFields = []): Promise<any> {
		try {
			let query = this.roleModel.find(params).sort({createdAt: -1});
			populateFields.forEach((field) => {
				query = query.populate(field);
			});
			const data = await query.exec();
			return apiResponse(200, 'Roles obtenidos con éxito.', data, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	async findById(id: string): Promise<any> {
		try {
			const role = await this.roleModel.findById(id).populate('permisos');
			if (!role) {
				return apiResponse(404, 'Rol no encontrado.', null, null);
			}
			return apiResponse(200, null, role, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	async actualizarRole(id: string, data): Promise<any> {
		try {
			const rolActual = await this.roleModel.findById(id).populate('permisos');
			if (!rolActual) {
				return apiResponse(404, 'Rol no encontrado.', null, null);
			}

			const permisosActuales = rolActual.permisos.map((permiso) => permiso._id.toString());

			const rolActualizado = await this.roleModel.findByIdAndUpdate(id, data, {new: true}).populate('permisos');

			if (!rolActualizado) {
				return apiResponse(404, 'Rol no encontrado.', null, null);
			}

			const permisosActualizados = rolActualizado.permisos.map((permiso) => permiso._id.toString());

			const permisosRemovidos = permisosActuales.filter((permisoId) => !permisosActualizados.includes(permisoId));
			const permisosAgregados = permisosActualizados.filter((permisoId) => !permisosActuales.includes(permisoId));

			const usuarios = await this.userModel.find({role: id});

			usuarios.forEach((usuario: any) => {
				permisosRemovidos.forEach((permisoId) => {
					this.notific.notifyPermissionChange(usuario._id, 'PERMISSION_REMOVED', permisoId);
				});
				permisosAgregados.forEach((permisoId) => {
					this.notific.notifyPermissionChange(usuario._id, 'PERMISSION_ADDED', permisoId);
				});
			});

			return apiResponse(200, 'Rol actualizado con éxito.', rolActualizado, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	async eliminarRole(id: string): Promise<any> {
		try {
			const role = await this.roleModel.findByIdAndDelete(id);
			if (!role) {
				return apiResponse(404, 'Rol no encontrado.', null, null);
			}
			return apiResponse(200, 'Rol eliminado con éxito.', null, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	async createBatch(CreateRoleUserDto: CreateRoleUserDto[]) {
		const createdUsers = [];
		const errors = [];

		for (const userDto of CreateRoleUserDto) {
			try {
				const createdUser = await this.roleModel.create(userDto);
				createdUsers.push(createdUser);
			} catch (error) {
				// Aquí puedes filtrar o registrar el error según necesites
				if (error.code === 11000) {
					// 11000 es el código de error para duplicados
					errors.push({
						user: userDto,
						message: 'Usuario ya existente',
					});
				} else {
					// Manejar otros tipos de errores si es necesario
					errors.push({
						user: userDto,
						message: error.message,
					});
				}
			}
		}

		return apiResponse(
			errors.length > 0 ? 207 : 201,
			errors.length > 0 ? 'Hubieron algunos errores al crear los usuarios.' : 'Creación de usuarios exitosa.',
			createdUsers,
			errors,
		);
	}

	async updateBatch(updateUsersDto: UpdateRoleUserDto[]): Promise<any> {
		const updatedUsers: User[] = [];
		const errors = [];

		for (const dtoUser of updateUsersDto) {
			try {
				const user = await this.userModel.findByIdAndUpdate(dtoUser._id, dtoUser, {new: true});
				if (!user) {
					errors.push({
						id: dtoUser._id,
						message: `Usuario con ID ${dtoUser._id} no encontrado`,
					});
					continue; // Si no se encuentra el usuario, continuar con el siguiente
				}
				updatedUsers.push(user);
			} catch (error) {
				errors.push({
					id: dtoUser._id,
					message: error.message,
				});
			}
		}

		return apiResponse(
			errors.length > 0 ? 207 : 200, // 207 para "Multi-Status" si hay errores, 200 si todo fue exitoso
			errors.length > 0 ? 'Algunos usuarios no pudieron ser actualizados.' : 'Actualización de usuarios exitosa.',
			updatedUsers,
			errors,
		);
	}

	// Método auxiliar para actualizar roles
	private async actualizarRoles(rolesConErrores): Promise<any> {
		try {
			const rolesActualizados = [];
			for (const rol of rolesConErrores) {
				const resultado = await this.roleModel.updateOne({_id: rol._id}, rol);
				rolesActualizados.push(resultado);
			}
			if (rolesActualizados.length === 0) {
				return apiResponse(404, 'Ningún rol encontrado para actualizar.', null, null);
			}
			return apiResponse(200, 'Roles actualizados con éxito.', rolesActualizados, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	async getDefaultRole(): Promise<RoleUser | null> {
		try {
			const defaultRole = await this.roleModel.findOne({is_default: true});
			if (!defaultRole) {
				return null;
			}
			return defaultRole;
		} catch (error) {
			console.error(error);
			return error;
		}
	}
}
