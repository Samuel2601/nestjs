import {Controller, Post, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe} from '@nestjs/common';
import {AuthService} from './auth.service';
import {LoginDto} from './auth.dto';

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

	@Post('outlook')
	@HttpCode(HttpStatus.OK)
	async outlookLogin(@Body('code') code: string) {
		return this.authService.outlookLogin(code);
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