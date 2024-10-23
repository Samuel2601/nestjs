/*
https://docs.nestjs.com/guards#guards
*/

import {Injectable, CanActivate, ExecutionContext, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {InjectModel} from '@nestjs/mongoose';
import {createDecipheriv, scryptSync} from 'crypto';
import {Model} from 'mongoose';
import {CacheService} from 'src/common/cache/cache.service';
import {NotificationsService} from 'src/socket.io/notifications.service';
import {Permission} from 'src/userModule/models/permiso.schema';
import {RoleUser} from 'src/userModule/models/roleuser.schema';
import {User} from 'src/userModule/models/user.schema';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		@InjectModel(User.name) private userModel: Model<User>,
		@InjectModel(RoleUser.name) private roleUserModel: Model<RoleUser>,
		@InjectModel(Permission.name) private permissionModel: Model<Permission>,
		private readonly cacheService: CacheService,
		private notificationsGateway: NotificationsService,
	) {}

	private decryptIP(encryptedIP: string): string {
		const algorithm = 'aes-256-cbc';
		const [ivHex, encrypted] = encryptedIP.split(':');
		const iv = Buffer.from(ivHex, 'hex');
		const key = scryptSync('your_secret_key', 'salt', 32); // Usa la misma clave

		const decipher = createDecipheriv(algorithm, key, iv);
		const decryptedIP = Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()]);
		return decryptedIP.toString();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);
		if (!token) {
			throw new UnauthorizedException();
		}
		try {
			const payload = await this.jwtService.verifyAsync(token);
			if (!payload.sub) {
				throw new UnauthorizedException();
			}
			request['user'] = payload;

			// Obtener la IP del cliente
			const clientIp = request.headers['x-forwarded-for'] || request.headers['x-real-ip'] || request.connection.remoteAddress || request.socket.remoteAddress;

			// Descifrar la IP del payload
			const decryptedIp = this.decryptIP(payload.ip);
			if (decryptedIp !== clientIp) {
				// Aquí puedes enviar una notificación o tomar acción si las IPs no coinciden
				await this.notificationsGateway.notifyUser(payload.sub,	{message: 'Warning: Your login attempt comes from a different IP address.'});
				// También puedes lanzar un UnauthorizedException si lo deseas
				throw new UnauthorizedException('IP mismatch');
			}

			// Verificar los permisos de acceso
			const hasPermission = await this.checkRoutePermission(payload.sub, request.route.path, request.method.toLowerCase());
			if (!hasPermission) {
				throw new UnauthorizedException('You do not have permission to access this resource');
			}
		} catch {
			throw new UnauthorizedException();
		}
		return true;
	}

	private extractTokenFromHeader(request: any): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}

	private async checkRoutePermission(userId: string, path: string, method: string): Promise<boolean> {
		try {
			// Obtener el usuario y hacer populate del rol
			const user = await this.userModel.findById(userId);

			if (!user || !user.role) {
				return false;
			}

			// Obtener el rol y hacer populate de los permisos
			const role = await this.getRoleWithPermissions(user.role.toString());
			if (!role) {
				return false;
			}

			// Verificar si el rol tiene el permiso requerido
			const hasPermission = role.permisos.some((permission: any) => permission.name === path && permission.method === method);

			if (hasPermission) {
				return true;
			}

			// Si el rol no tiene el permiso, verificar los permisos específicos del usuario
			const userPermissions = await this.permissionModel.find({
				users: userId,
				name: path,
				method: method,
			});

			return userPermissions.length > 0;
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	// Método para obtener los permisos
	private async getRoleWithPermissions(roleId: string): Promise<any> {
		// Primero, busca en la caché
		const cachedRole = this.cacheService.get(roleId);
		if (cachedRole) {
			console.log('Cache hit for role:', roleId);
			return cachedRole;
		}

		// Si no está en la caché, busca en la base de datos y haz populate
		const role = await this.roleUserModel.findById(roleId).populate({
			path: 'permisos',
			model: 'Permission',
		});

		if (role) {
			// Almacena en la caché
			this.cacheService.set(roleId, role);
		}

		return role;
	}
}
