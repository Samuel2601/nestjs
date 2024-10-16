import {Injectable, OnModuleInit} from '@nestjs/common';
import {Permission} from '../models/permiso.schema';
import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {HttpAdapterHost} from '@nestjs/core';

@Injectable()
export class PermisoService implements OnModuleInit {
	constructor(
		@InjectModel(Permission.name) private permissModel: Model<Permission>,
		private readonly httpAdapterHost: HttpAdapterHost,
	) {}

	async onModuleInit() {
		await this.initializePermissions();
	}

	private async initializePermissions() {
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
}
