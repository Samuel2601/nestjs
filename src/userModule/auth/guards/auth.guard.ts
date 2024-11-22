/*
https://docs.nestjs.com/guards#guards
*/

import {Injectable, CanActivate, ExecutionContext, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {CacheService} from 'src/common/cache/cache.service';
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
	) {}

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

			// Verificar la IP solo si se trata de un Access Token
			if (!payload.ip) {
				// Si no se incluye la IP, se debe negar el acceso a las funciones que requieren un Access Token
				if (request.route.path.startsWith('/auth/refresh')) {
					// Si es el controlador de refresh, permitimos el acceso porque no necesita IP
					return true;
				}
				// Para cualquier otra ruta que requiera un Access Token, lanzamos UnauthorizedException
				throw new UnauthorizedException('IP verification required for Access Token');
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

	private async hasRolePermission(role: any, path: string, method: string): Promise<boolean> {
		return role.permisos.some((permission: any) => permission.name === path && permission.method === method);
	}

	private async hasUserPermission(userId: string, path: string, method: string): Promise<boolean> {
		const userPermissions = await this.permissionModel.find({
			users: userId,
			name: path,
			method: method,
		});
		return userPermissions.length > 0;
	}

	private async checkRoutePermission(userId: string, path: string, method: string): Promise<boolean> {
		const user = await this.userModel.findById(userId);
		if (!user || !user.role) return false;

		const role = await this.getRoleWithPermissions(user.role.toString());
		if (!role) return false;

		return (await this.hasRolePermission(role, path, method)) || (await this.hasUserPermission(userId, path, method));
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
