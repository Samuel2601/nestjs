import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {RoleUser} from '../models/roleuser.schema';
import {User} from '../models/user.schema';
import {Model} from 'mongoose';
import { apiResponse } from 'src/common/helpers/apiResponse';
import { CriterioService } from 'src/common/dto/params&populate/criterioFormat.service';
import { getPopulateFields } from '../common/dto/utils';
import { NotificationsService } from 'src/socket.io/notifications.service';

@Injectable()
export class RoleService {
	constructor(
		@InjectModel('role') private roleModel: Model<RoleUser>,
		@InjectModel('user') private userModel: Model<User>,
		private params_populate: CriterioService,
		private notific:NotificationsService
	) {}

	async obtenerRole(id: string) {
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

	async obtenerRolesPorCriterio(params, userPopulateFields = []) {
		try {
			const {populate, ...filterParams} = params;
			const aux = {...filterParams};
			const filter = this.params_populate.criterioFormat(this.roleModel, aux);
			const populateFields = getPopulateFields(this.roleModel, userPopulateFields);
			let query = this.roleModel.find(filter).sort({createdAt: -1});
			populateFields.forEach((field) => {
				query = query.populate(field);
			});
			const data = await query.exec();
			return apiResponse(200, null, data.length > 0 ? data : [], null);
		} catch (error) {
			console.error(error);
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	async actualizarRole(id: string, data) {
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

			usuarios.forEach((usuario:any) => {
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

	async eliminarRole(id: string) {
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

	async registrarRolesMasivo(datos, update: string) {
		try {
			const roles = await this.roleModel.insertMany(datos, {ordered: false});
			return apiResponse(201, 'Roles creados con éxito.', roles, null);
		} catch (error) {
			console.error(error);
			if (error.name === 'BulkWriteError' && update === 'true') {
				const rolesConErrores = error.writeErrors.map((e) => datos[e.index]);
				const resp = await this.actualizarRoles(rolesConErrores);
				if (resp.status === 200) {
					return apiResponse(200, 'Roles creados y actualizados con éxito.', null, null);
				} else {
					return apiResponse(500, 'ERROR', null, resp.error);
				}
			}
			return apiResponse(500, 'ERROR', null, error);
		}
	}

	// Método auxiliar para actualizar roles
	private async actualizarRoles(rolesConErrores) {
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
}
