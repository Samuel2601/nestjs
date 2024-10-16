import {Inject, Injectable, OnModuleInit} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Permission} from './userModule/models/permiso.schema';
import {REQUEST} from '@nestjs/core';
import {Model} from 'mongoose';
import {RoleUser} from './userModule/models/roleuser.schema';

@Injectable()
export class AppService implements OnModuleInit {
	constructor(
		@InjectModel(Permission.modelName) private readonly permissionModel: Model<Permission>,
		@InjectModel(RoleUser.modelName) private readonly roleUserModel: Model<RoleUser>,
		@Inject(REQUEST) private readonly request: any, // Aquí puedes acceder a la solicitud
	) {}

	async onModuleInit() {
		await this.initializePermissions();
		await this.initializeRoles();
	}

	private async initializePermissions() {
		const permissions = await this.permissionModel.find().exec();

		if (permissions.length === 0) {
			// Accede directamente al adaptador HTTP a través de la solicitud
			const httpAdapter = this.request.getHttpAdapter();
			const routes = httpAdapter.getInstance().router.stack;
			for (const route of routes) {
				if (route.route) {
					const methods = Object.keys(route.route.methods);
					for (const method of methods) {
						const permission = new this.permissionModel({
							name: route.route.path,
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
			}

			console.log('Permisos inicializados.');
		} else {
			console.log('Ya existen permisos en la base de datos.');
		}
	}
	private async initializeRoles() {
		const existingRoles = await this.roleUserModel.find().exec();

		if (existingRoles.length === 0) {
			const adminRole = new this.roleUserModel({
				name: 'admin',
				permisos: [], // Aquí puedes añadir los permisos necesarios para el rol de admin
				is_default: true,
			});

			await adminRole.save();
			console.log('Rol de administrador creado.');
		} else {
			console.log('Ya existen roles en la base de datos.');
		}
	}
}
