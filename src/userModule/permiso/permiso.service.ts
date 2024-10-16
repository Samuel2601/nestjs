import {Injectable, OnModuleInit} from '@nestjs/common';
import {Permission} from '../models/permiso.schema';
import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {HttpAdapterHost} from '@nestjs/core';
import {apiResponse} from 'src/common/helpers/apiResponse';
import {CreatePermissionDto, UpdatePermissionDto} from './permiso.dto';
import {User} from '../models/user.schema';
import {EmailService} from 'src/common/email/email.service';
import {NotificationsService} from 'src/socket.io/notifications.service';

@Injectable()
export class PermisoService implements OnModuleInit {
	constructor(
		@InjectModel(Permission.name) private permissModel: Model<Permission>,
		@InjectModel(User.name) private readonly userModel: Model<User>,
		private readonly httpAdapterHost: HttpAdapterHost,
		private readonly emailService: EmailService,
		private notific: NotificationsService,
	) {}

	async onModuleInit() {
		await this.initializePermissions();
	}

	async initializePermissions() {
		const permissions = await this.permissModel.find().exec();
		if (permissions.length === 0) {
			// Obtén el adaptador HTTP
			const httpAdapter = this.httpAdapterHost.httpAdapter;
			const app = httpAdapter.getInstance();

			// Accede a las rutas directamente usando app._router.stack
			const routes = app._router.stack
				.filter((layer) => layer.route) // Filtra las capas que son rutas
				.map((layer) => ({
					path: layer.route.path,
					methods: layer.route.methods,
				}));

			for (const route of routes) {
				const methods = Object.keys(route.methods);
				for (const method of methods) {
					const permission = new this.permissModel({
						name: route.path,
						method: method.toLowerCase(),
						users: [], // Aquí puedes añadir usuarios si es necesario
						is_default: false,
					});

					try {
						await permission.save();
						console.log(`Permiso guardado: ${permission.name} ${permission.method}`);
					} catch (error) {
						console.error(`Error al guardar el permiso: ${permission.name} ${permission.method}`, error);
					}
				}
			}

			console.log('Permisos inicializados.');
		} else {
			console.log('Ya existen permisos en la base de datos.');
		}
	}

	/**
	 * Devuelve una lista de todos los usuarios en la base de datos.
	 * @returns Promesa que resuelve con una lista de usuarios.
	 */
	async findAllfilter(params, populateFields = []): Promise<any> {
		try {
			let query = this.permissModel.find(params).sort({createdAt: -1});
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
			const permiss = await this.permissModel.findById(id).populate(this.permissModel.name);
			if (!permiss) {
				return apiResponse(404, 'Rol no encontrado.', null, null);
			}
			return apiResponse(200, null, permiss, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	async createRole(createRoleDto: CreatePermissionDto): Promise<any> {
		const {name, method, users} = createRoleDto;
		try {
			// Verifica si ya existe un rol con el mismo nombre
			const existingRole = await this.permissModel.findOne({name});
			if (existingRole) {
				return apiResponse(400, 'Ya existe un rol con ese nombre', null, null);
			}

			// Crea el nuevo rol con los permisos asignados
			const newpermission = new this.permissModel({
				name,
				method,
				users,
			});
			await newpermission.save();
			for (const user of users) {
				const userdata = await this.userModel.findById(user);
				this.emailService.sendNotification(userdata.email, 'Nuevo permiso otorgado', 'src/emailTemplates/newPermissUser.html', {
					userName: userdata.name + ' ' + userdata.last_name,
					permissionName: name,
					permissionMethod: method,
				});
			}

			return apiResponse(200, 'Permiso creado con éxito.', newpermission, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	async updateRole(id: string, data: UpdatePermissionDto): Promise<any> {
		try {
			const permissActual = await this.permissModel.findById(id).populate(this.userModel.name);
			if (!permissActual) {
				return apiResponse(404, 'Permiso no encontrado.', null, null);
			}

			const usersActuales = permissActual.users.map((usuario) => usuario._id.toString());

			const permissActualizado = await this.permissModel.findByIdAndUpdate(id, data, {new: true}).populate(this.userModel.name);

			if (!permissActualizado) {
				return apiResponse(404, 'Permiso no encontrado.', null, null);
			}

			const usersActualizados = permissActualizado.users.map((usuario) => usuario._id.toString());

			const usersRemovidos = usersActuales.filter((userId) => !usersActualizados.includes(userId));
			const usersAgregados = usersActualizados.filter((userId) => !usersActuales.includes(userId));

			// Obteniendo los detalles de los usuarios (si es necesario)
			//const usuariosRemovidos = await this.userModel.find({_id: {$in: usersRemovidos}});
			//const usuariosAgregados = await this.userModel.find({_id: {$in: usersAgregados}});

			usersRemovidos.forEach((usuario: any) => {
				this.notific.notifyPermissionChange(usuario._id, 'PERMISSION_REMOVED', permissActualizado._id.toString());

				this.emailService.sendNotification(usuario.email, 'Permiso Revocado', 'src/emailTemplates/removePermissUser.html', {
					userName: usuario.name + ' ' + usuario.last_name,
					permissionName: permissActualizado.name,
					permissionMethod: permissActualizado.method,
				});
			});

			usersAgregados.forEach((usuario: any) => {
				this.notific.notifyPermissionChange(usuario._id, 'PERMISSION_ADDED', permissActualizado._id.toString());

				this.emailService.sendNotification(usuario.email, 'Nuevo permiso otorgado', 'src/emailTemplates/newPermissUser.html', {
					userName: usuario.name + ' ' + usuario.last_name,
					permissionName: permissActualizado.name,
					permissionMethod: permissActualizado.method,
				});
			});

			return apiResponse(200, 'Permiso actualizado con éxito.', permissActualizado, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	async deleteRole(id: string): Promise<any> {
		try {
			const permiss = await this.permissModel.findByIdAndDelete(id);
			if (!permiss) {
				return apiResponse(404, 'Rol no encontrado.', null, null);
			}
			return apiResponse(200, 'Rol eliminado con éxito.', null, null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	async createBatch(CreatePermissDto: CreatePermissionDto[]) {
		const createdPermission: Permission[] = [];
		const errors = [];

		for (const permissDto of CreatePermissDto) {
			try {
				const permiss = await this.permissModel.create(permissDto);
				createdPermission.push(permiss);
			} catch (error) {
				// Aquí puedes filtrar o registrar el error según necesites
				if (error.code === 11000) {
					// 11000 es el código de error para duplicados
					errors.push({
						user: permissDto,
						message: 'Usuario ya existente',
					});
				} else {
					// Manejar otros tipos de errores si es necesario
					errors.push({
						user: permissDto,
						message: error.message,
					});
				}
			}
		}

		return apiResponse(
			errors.length > 0 ? 207 : 201,
			errors.length > 0 ? 'Hubieron algunos errores al crear los permisos.' : 'Creación de permisos exitosa.',
			createdPermission,
			errors,
		);
	}

	async updateBatch(updatePermissionDto: UpdatePermissionDto[]): Promise<any> {
		const updatedPermission: Permission[] = [];
		const errors = [];

		for (const dtoPermission of updatePermissionDto) {
			try {
				const permiss = await this.permissModel.findByIdAndUpdate(dtoPermission._id, dtoPermission, {new: true});
				if (!permiss) {
					errors.push({
						id: dtoPermission._id,
						message: `Permiso con ID ${dtoPermission._id} no encontrado`,
					});
					continue; // Si no se encuentra el usuario, continuar con el siguiente
				}
				updatedPermission.push(permiss);
			} catch (error) {
				errors.push({
					id: dtoPermission._id,
					message: error.message,
				});
			}
		}

		return apiResponse(
			errors.length > 0 ? 207 : 200, // 207 para "Multi-Status" si hay errores, 200 si todo fue exitoso
			errors.length > 0 ? 'Algunos permisos no pudieron ser actualizados.' : 'Actualización de permisos exitosa.',
			updatedPermission,
			errors,
		);
	}
}
