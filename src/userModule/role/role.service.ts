import {Injectable, OnModuleInit} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {apiResponse} from 'src/common/helpers/apiResponse';
import {NotificationsService} from 'src/socket.io/notifications.service';
import {RoleUser} from 'src/userModule/models/roleuser.schema';
import {User} from 'src/userModule/models/user.schema';
import {Permission} from '../models/permiso.schema';
import {CreateRoleUserDto, UpdateRoleUserDto} from './role.dto';
import {PermisoService} from '../permiso/permiso.service';

@Injectable()
export class RoleService implements OnModuleInit {
	constructor(
		@InjectModel(RoleUser.name) private roleModel: Model<RoleUser>,
		@InjectModel(User.name) private userModel: Model<User>,
		@InjectModel(Permission.name) private permissModel: Model<Permission>,
		private notific: NotificationsService,
		private permisoService: PermisoService,
	) {}

	async onModuleInit() {
		await this.initializeRoles();
	}

	private async initializeRoles() {
		const existingRoles = await this.roleModel.find().exec();
		const existingPermissions = await this.permissModel.find().exec();

		// Verificar si no hay permisos y crearlos si es necesario
		if (existingPermissions.length === 0) {
			await this.permisoService.initializePermissions();
		}

		// Verificar si no hay roles y crearlos si es necesario
		if (existingRoles.length === 0) {
			// Crear un array de IDs de permisos usando map
			const permisos = existingPermissions.map((element: any) => element._id);

			// Crear y guardar el rol de administrador
			const adminRole = new this.roleModel({
				name: 'admin',
				permisos: permisos, // Añadir los permisos aquí
				is_default: true,
			});

			await adminRole.save();
			console.log('Rol de administrador creado.');
		} else {
			console.log('Ya existen roles en la base de datos.');
		}
	}

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
			const role = await this.roleModel.findById(id).populate(this.permissModel.name);
			if (!role) {
				return apiResponse(404, 'Rol no encontrado.', null, null);
			}
			return apiResponse(200, null, role, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	async createRole(createRoleDto: CreateRoleUserDto): Promise<any> {
		const {name, permisos} = createRoleDto;

		// Verifica si ya existe un rol con el mismo nombre
		const existingRole = await this.roleModel.findOne({name});
		if (existingRole) {
			return apiResponse(400, 'Ya existe un rol con ese nombre', null, null);
		}

		let assignedPermissions: Types.ObjectId[];

		if (permisos && permisos.length > 0) {
			// Si se proporcionan permisos, se asignan esos permisos
			assignedPermissions = permisos;
		} else {
			// Si no se proporcionan permisos, busca los permisos predeterminados (is_default: true)
			const defaultPermissions: Permission[] = await this.permissModel.find({is_default: true});

			/*if (!defaultPermissions || defaultPermissions.length === 0) {
				return apiResponse(400, 'No se encontraron permisos predeterminados', null, null);
			}*/

			// Extrae los IDs de los permisos predeterminados
			assignedPermissions = defaultPermissions.map((defaultPermission: Permission) => defaultPermission._id as Types.ObjectId);
		}

		// Crea el nuevo rol con los permisos asignados
		const newRole = new this.roleModel({
			name,
			permisos: assignedPermissions,
		});

		return newRole.save();
	}

	async updateRole(id: string, data: UpdateRoleUserDto): Promise<any> {
		try {
			const rolActual = await this.roleModel.findById(id).populate(this.permissModel.name);
			if (!rolActual) {
				return apiResponse(404, 'Rol no encontrado.', null, null);
			}

			const permisosActuales = rolActual.permisos.map((permiso) => permiso._id.toString());

			const rolActualizado = await this.roleModel.findByIdAndUpdate(id, data, {new: true}).populate(this.permissModel.name);

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

	async deleteRole(id: string): Promise<any> {
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
