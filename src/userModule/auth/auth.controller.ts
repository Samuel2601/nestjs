import {Controller, Post, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe, Get, Query, Session, UseGuards, Res, Request} from '@nestjs/common';
import {AuthService} from './auth.service';
import {LoginDto} from './auth.dto';
import {Response} from 'express';
import {ClientIP} from './decorators/ip.decorator';
import {AuthGuard} from './guards/auth.guard';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	@UsePipes(new ValidationPipe({transform: true}))
	async login(@ClientIP() ip: string, @Body() loginDto: LoginDto) {
		const user = await this.authService.validateUser(loginDto.email, loginDto.password, ip);
		if (!user) {
			return {message: 'Invalid credentials'};
		}
		return this.authService.login(user, ip, 'Correo y contraseña');
	}

	@Post('google')
	@HttpCode(HttpStatus.OK)
	async googleLogin(@ClientIP() ip: string, @Body('token') token: string) {
		return this.authService.googleLogin(token, ip);
	}

	@Post('google/one-tap')
	@HttpCode(HttpStatus.OK)
	async googleOneTapLogin(@ClientIP() ip: string, @Body('credential') credential: string) {
		return this.authService.googleOneTapLogin(credential, ip);
	}

	@Post('google/plus')
	@HttpCode(HttpStatus.OK)
	async googlePlusLogin(@ClientIP() ip: string, @Body('accessToken') accessToken: string) {
		return this.authService.googlePlusLogin(accessToken, ip);
	}

	@Post('facebook')
	@HttpCode(HttpStatus.OK)
	async facebookLogin(@ClientIP() ip: string, @Body('accessToken') accessToken: string) {
		return this.authService.facebookLogin(accessToken, ip);
	}

	@Get('outlook')
	async iniciarLoginOutlook(@Session() session: Record<string, any>, @Res() res: Response) {
		const {url, codeVerifier, state} = await this.authService.getOutlookAuthorizationUrl();

		// Almacenar codeVerifier y state en la sesión
		session.outlookCodeVerifier = codeVerifier;
		session.outlookState = state;
		//console.log(url);
		// Redirigir al usuario a la URL de autorización
		res.redirect(url); // Usa res.redirect(url) en lugar de @Redirect
	}

	@Get('outlook/callback')
	async callbackOutlook(
		@ClientIP() ip: string,
		@Query('code') code: string,
		@Query('error') error: string,
		@Query('state') state: string,
		@Session() session: Record<string, any>,
	) {
		if (error) {
			console.error('Error en el callback:', error);
			return {mensaje: 'Error durante el inicio de sesión con Outlook', error};
		}

		// Recuperar codeVerifier de la sesión
		const codeVerifier = session.outlookCodeVerifier;
		//console.log("RECIBIDO: ",codeVerifier);
		if (!codeVerifier) {
			return {mensaje: 'Sesión inválida. Por favor, intente iniciar sesión nuevamente.'};
		}

		// Verificar el parámetro state
		if (state !== session.outlookState) {
			return {mensaje: 'Estado inválido. Posible ataque CSRF.'};
		}

		try {
			const resultado = await this.authService.outlookLogin(code, codeVerifier, state, ip);
			// Limpiar codeVerifier y state de la sesión
			delete session.outlookCodeVerifier;
			delete session.outlookState;
			return resultado;
		} catch (error) {
			console.error('Error durante el inicio de sesión con Outlook:', error);
			return {mensaje: 'Error durante el inicio de sesión con Outlook', error: error.message};
		}
	}

	@Post('apple')
	@HttpCode(HttpStatus.OK)
	async appleLogin(@ClientIP() ip: string, @Body('idToken') idToken: string) {
		return this.authService.appleLogin(idToken, ip);
	}
	
	@Post('refresh')
	@UseGuards(AuthGuard)
	@UsePipes(new ValidationPipe({transform: true}))
	async refresh(@ClientIP() ip: string, @Request() req: Request) {
		// Llama al servicio para renovar el token
		const token = this.extractTokenFromHeader(req);
		const newAccessToken = await this.authService.refreshToken(req['user'].sub, token, ip);

		return newAccessToken;
	}
	private extractTokenFromHeader(request: any): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}

	@Get('logout')
	@UseGuards(AuthGuard)
	@UsePipes(new ValidationPipe({transform: true}))
	async logout(@ClientIP() ip: string, @Request() req: Request) {
		return await this.authService.logout(req['user'].sub);
	}
}
