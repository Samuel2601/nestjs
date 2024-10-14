import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import * as bcrypt from 'bcrypt';
import {OAuth2Client} from 'google-auth-library';
import {HttpService} from '@nestjs/axios';
import * as msal from '@azure/msal-node';
import {User} from '../models/user.schema';

@Injectable()
export class AuthService {
	private googleClient: OAuth2Client;
	private msalConfig: msal.Configuration;

	constructor(
		@InjectModel(User.name) private userModel: Model<User>,
		private jwtService: JwtService,
		private httpService: HttpService,
	) {
		this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
		this.msalConfig = {
			auth: {
				clientId: process.env.OUTLOOK_CLIENT_ID,
				authority: 'https://login.microsoftonline.com/common',
			},
		};
	}

	async validateUser(email: string, password: string): Promise<any> {
		const user = await this.userModel.findOne({email});
		if (user && (await bcrypt.compare(password, user.password))) {
			const {password, ...result} = user.toObject();
			return result;
		}
		return null;
	}

  async login(user: any) {
    console.log(user);
		const payload = {email: user.email, sub: user._id};
		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async googleLogin(token: string) {
		const ticket = await this.googleClient.verifyIdToken({
			idToken: token,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();
		return this.handleSocialLogin('google', payload.sub, payload);
	}

	async googleOneTapLogin(credential: string) {
		const payload = this.jwtService.verify(credential, {
			secret: process.env.GOOGLE_CLIENT_SECRET, // Verifica el token con la clave secreta
		});
		return this.handleSocialLogin('google', payload.sub, payload);
	}

	async googlePlusLogin(accessToken: string) {
		const {data} = await this.httpService.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`).toPromise();
		return this.handleSocialLogin('google_plus', data.id, data);
	}

	async facebookLogin(accessToken: string) {
		const {data} = await this.httpService.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`).toPromise();
		return this.handleSocialLogin('facebook', data.id, data);
	}

	async outlookLogin(code: string) {
		const cca = new msal.ConfidentialClientApplication(this.msalConfig);
		const response = await cca.acquireTokenByCode({
			code,
			scopes: ['user.read'],
			redirectUri: process.env.OUTLOOK_REDIRECT_URI,
		});

		const {data} = await this.httpService
			.get('https://graph.microsoft.com/v1.0/me', {
				headers: {Authorization: `Bearer ${response.accessToken}`},
			})
			.toPromise();

		return this.handleSocialLogin('outlook', data.id, data);
	}

	async appleLogin(idToken: string) {
		const decodedToken = this.jwtService.verify(idToken, {
			secret: process.env.APPLE_CLIENT_SECRET, // Verifica el token con la clave secreta
		});
		return this.handleSocialLogin('apple', decodedToken.sub, decodedToken);
	}

	private async handleSocialLogin(provider: string, providerId: string, userData: any) {
		// Primero busca por email
		let user = await this.userModel.findOne({email: userData.email});

		if (user) {
			// Si el usuario existe, verifica si ya tiene la red social asociada
			const socialNetwork = user.redes.find((network) => network.provider === provider && network.providerId === providerId);

			if (!socialNetwork) {
				// Si no tiene la red social asociada, la añadimos
				user.redes.push({
					provider,
					providerId,
					profileUrl: userData.picture || userData.profile_image_url,
				});

				await user.save(); // Guardar los cambios en el usuario
			}
		} else {
			// Si no existe un usuario con el correo, creamos uno nuevo
			user = await this.userModel.create({
				name: userData.given_name || userData.name || '',
				last_name: userData.family_name || '',
				email: userData.email,
				verificado: true,
				redes: [
					{
						provider,
						providerId,
						profileUrl: userData.picture || userData.profile_image_url,
					},
				],
			});
		}

		// Autenticar al usuario y devolver el token
		return this.login(user);
	}

	async logout(userId: string) {
		// Para logout, simplemente necesitas eliminar el token del lado del cliente
		// No hay acción necesaria en el servidor, a menos que estés usando sesiones
		return {message: 'Logout successful'};
	}
}
