/*
https://docs.nestjs.com/openapi/decorators#decorators
*/
// decorators/ip.decorator.ts
import {createParamDecorator, ExecutionContext} from '@nestjs/common';

export const ClientIP = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	const ip = request.headers['x-forwarded-for'] || request.headers['x-real-ip'] || request.connection.remoteAddress || request.socket.remoteAddress;

	if (typeof ip === 'string' && ip.includes(',')) {
		return ip.split(',')[0].trim();
	}

	return Array.isArray(ip) ? ip[0] : ip?.toString() || 'Unknown IP';
});
