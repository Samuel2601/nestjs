import {Controller, Post, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe, Get, Query, Session, UseGuards, Res} from '@nestjs/common';
import {AuthService} from './auth.service';
import {LoginDto} from './auth.dto';
import {Response} from 'express';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	@UsePipes(new ValidationPipe({transform: true}))
	async login(@Body() loginDto: LoginDto) {
		const user = await this.authService.validateUser(loginDto.email, loginDto.password);
		if (!user) {
			return {message: 'Invalid credentials'};
		}
		return this.authService.login(user);
	}

	@Post('google')
	@HttpCode(HttpStatus.OK)
	async googleLogin(@Body('token') token: string) {
		return this.authService.googleLogin(token);
	}

	@Post('google/one-tap')
	@HttpCode(HttpStatus.OK)
	async googleOneTapLogin(@Body('credential') credential: string) {
		return this.authService.googleOneTapLogin(credential);
	}

	@Post('google/plus')
	@HttpCode(HttpStatus.OK)
	async googlePlusLogin(@Body('accessToken') accessToken: string) {
		return this.authService.googlePlusLogin(accessToken);
	}

	@Post('facebook')
	@HttpCode(HttpStatus.OK)
	async facebookLogin(@Body('accessToken') accessToken: string) {
		return this.authService.facebookLogin(accessToken);
	}

	@Get('outlook')
	async iniciarLoginOutlook(@Session() session: Record<string, any>, @Res() res: Response) {
		const {url, codeVerifier, state} = await this.authService.getOutlookAuthorizationUrl();

		// Almacenar codeVerifier y state en la sesión
		session.outlookCodeVerifier = codeVerifier;
		session.outlookState = state;
		console.log(url);
		// Redirigir al usuario a la URL de autorización  
		res.redirect(url); // Usa res.redirect(url) en lugar de @Redirect
	}

	@Get('outlook/callback')
	async callbackOutlook(@Query('code') code: string, @Query('error') error: string, @Query('state') state: string, @Session() session: Record<string, any>) {
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
			const resultado = await this.authService.outlookLogin(code, codeVerifier,state);
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
	async appleLogin(@Body('idToken') idToken: string) {
		return this.authService.appleLogin(idToken);
	}

	@Post('logout')
	@HttpCode(HttpStatus.OK)
	async logout(@Body('userId') userId: string) {
		return this.authService.logout(userId);
	}
}
