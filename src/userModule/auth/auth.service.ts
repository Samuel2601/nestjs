import {Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import * as bcrypt from 'bcrypt';
import {OAuth2Client} from 'google-auth-library';
import {HttpService} from '@nestjs/axios';
import * as msal from '@azure/msal-node';
import {User} from '../models/user.schema';
import * as jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import * as querystring from 'querystring';
import * as cryptoO from 'crypto';
import {EmailService} from 'src/common/email/email.service';
import {IpGeolocationService} from './ip-geolocation.service';
import {RefreshToken} from '../models/refreshToken.schema';
interface GooglePayload {
	sub: string;
	email: string;
	email_verified: boolean;
	name: string;
	picture: string;
	given_name: string;
	family_name: string;
	iat: number;
	exp: number;
	jti: string;
}
@Injectable()
export class AuthService {
	private googleClient: OAuth2Client;
	private msalClient: msal.PublicClientApplication;

	constructor(
		@InjectModel(User.name) private userModel: Model<User>,
		@InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>,
		private jwtService: JwtService,
		private httpService: HttpService,
		private readonly emailService: EmailService,
		private readonly ipGeolocationService: IpGeolocationService,
	) {
		this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
		this.msalClient = new msal.PublicClientApplication({
			auth: {
				clientId: process.env.OUTLOOK_CLIENT_ID,
				clientSecret: process.env.OUTLOOK_CLIENT_SECRET, // Make sure to include this
				authority: `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}`,
			},
		});
	}

	async validateUser(email: string, password: string, ip: string): Promise<any> {
		// Busca el usuario en la base de datos
		const user = await this.userModel.findOne({email});

		if (!user || !user.password) {
			throw new UnauthorizedException('Credenciales incorrectas');
		}

		// Compara la contraseña ingresada con la almacenada
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (isPasswordValid) {
			const {password, ...result} = user.toObject();
			return result;
		} else {
			// Obtener la geolocalización
			const locationData = await this.ipGeolocationService.getGeolocation(ip);
			const locationMessage = locationData ? `Accediendo desde ${locationData.city}, ${locationData.country}` : 'Ubicación desconocida';

			this.emailService.sendNotification(user.email, 'Intento de acceso fallido', 'src/emailTemplates/notificSessionInten.html', {
				userName: user.name,
				last_name: user.last_name,
				ip_address: ip,
				location: locationMessage,
				attempt_time: new Date(),
				security_url: '',
			});

			throw new UnauthorizedException('Credenciales incorrectas');
		}
	}

	async login(user: any, ip: string, provider?: string) {
		console.log(user);

		// Payload para el Access Token con IP cifrada
		const accessTokenPayload = {
			email: user.email,
			sub: user._id,
			ip: ip,
		};

		// Generar Access Token
		const accessToken = this.jwtService.sign(accessTokenPayload, {expiresIn: '15m'});

		// Generar Refresh Token sin la IP
		const refreshTokenPayload = {
			sub: user._id,
		};

		// Generar el token sin la IP
		const refreshToken = this.jwtService.sign(refreshTokenPayload, {expiresIn: '7d'});

		// Guardar el Refresh Token en la base de datos
		await this.refreshTokenModel.create({
			userId: user._id,
			token: refreshToken,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días de expiración
			ipAddress: ip,
			lastUsedAt: new Date(),
		});

		// Obtener la geolocalización
		const locationData = await this.ipGeolocationService.getGeolocation(ip);
		const locationMessage = locationData ? `Accediendo desde ${locationData.city}, ${locationData.country}` : 'Ubicación desconocida';

		this.emailService.sendNotification(user.email, 'Inicio de sesión en tu cuenta', 'src/emailTemplates/sessionNotification.html', {
			name: user.name,
			last_name: user.last_name,
			provider: provider,
			ip_address: ip,
			location: locationMessage,
			attempt_time: new Date(),
			resetPasswordUrl: 'https://tu-app.com/reset-password',
		});

		return {
			access_token: accessToken,
			refresh_token: refreshToken, // Retornar el Refresh Token también
		};
	}

	async refreshToken(userId: string, refreshToken: string, ip: string) {
		const storedToken = await this.refreshTokenModel.findOne({token: refreshToken, userId});

		// Verificar si el token existe
		if (!storedToken) {
			throw new UnauthorizedException('Invalid refresh token');
		}

		// Verificar si el token está revocado
		if (storedToken.isRevoked) {
			throw new UnauthorizedException('Token revoked');
		}

		// Verificar si el token ha expirado
		if (storedToken.expiresAt < new Date()) {
			throw new UnauthorizedException('Token expired');
		}

		// Actualizar la última fecha de uso
		storedToken.lastUsedAt = new Date();
		await storedToken.save();

		// Generar un nuevo Access Token
		const newAccessTokenPayload = {
			email: userId, // O los datos que desees incluir
			sub: userId,
			ip: ip, // Cifrar la IP de nuevo si es necesario
		};
		const newAccessToken = this.jwtService.sign(newAccessTokenPayload, {expiresIn: '15m'});

		return {
			access_token: newAccessToken,
		};
	}

	async googleLogin(token: string, ip: string) {
		try {
			const ticket = await this.googleClient.verifyIdToken({
				idToken: token,
				audience: process.env.GOOGLE_CLIENT_ID,
			});
			const payload = ticket.getPayload();
			return this.handleSocialLogin('google', payload.sub, payload, ip);
		} catch (error) {
			console.error('Error during Google login:', error);
			throw new Error('Google login failed. Please try again later.');
		}
	}

	private client = jwksClient({
		jwksUri: 'https://www.googleapis.com/oauth2/v3/certs', // Endpoint donde Google publica sus claves públicas
	});

	// Función para obtener la clave pública
	private getKey(header, callback) {
		this.client.getSigningKey(header.kid, (err, key) => {
			const signingKey = key.getPublicKey();
			callback(null, signingKey);
		});
	}

	async googleOneTapLogin(credential: string, ip: string) {
		//console.log('Se recibe el credential:', credential);

		try {
			// Verificación del token usando la clave pública de Google
			const payload = await new Promise<GooglePayload>((resolve, reject) => {
				jwt.verify(credential, this.getKey.bind(this), {algorithms: ['RS256']}, (err, decoded) => {
					if (err) {
						return reject(err);
					}
					resolve(decoded as GooglePayload);
				});
			});

			if (!payload) {
				throw new Error('No se pudo verificar el token');
			}

			return this.handleSocialLogin('google', payload.sub, payload, ip);
		} catch (error) {
			console.error('Error during Google One Tap login:', error);
			throw new Error('Google One Tap login failed. Please try again later.');
		}
	}

	async googlePlusLogin(accessToken: string, ip: string) {
		try {
			const {data} = await this.httpService.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`).toPromise();
			return this.handleSocialLogin('google_plus', data.id, data, ip);
		} catch (error) {
			console.error('Error during Google Plus login:', error);
			throw new Error('Google Plus login failed. Please try again later.');
		}
	}

	async facebookLogin(accessToken: string, ip: string) {
		try {
			const {data} = await this.httpService.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`).toPromise();
			return this.handleSocialLogin('facebook', data.id, data, ip);
		} catch (error) {
			console.error('Error during Facebook login:', error);
			throw new Error('Facebook login failed. Please try again later.');
		}
	}

	private generateCodeVerifier(): string {
		return cryptoO.randomBytes(32).toString('base64url');
	}

	private async generateCodeChallenge(verifier: string): Promise<string> {
		const hash = cryptoO.createHash('sha256').update(verifier).digest();
		return Buffer.from(hash).toString('base64url');
	}

	async getOutlookAuthorizationUrl(): Promise<{url: string; codeVerifier: string; state: string}> {
		const codeVerifier = this.generateCodeVerifier();
		const codeChallenge = await this.generateCodeChallenge(codeVerifier);
		const state = cryptoO.randomBytes(16).toString('hex');

		const baseUrl = `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}/oauth2/v2.0/authorize`;

		const params = {
			client_id: process.env.OUTLOOK_CLIENT_ID,
			response_type: 'code',
			redirect_uri: process.env.OUTLOOK_REDIRECT_URI,
			scope: 'user.read offline_access',
			response_mode: 'query',
			prompt: 'consent', // Cambia esto a 'consent' si quieres que el usuario se pregunte por consentimiento
			state: state,
			code_challenge: codeChallenge,
			code_challenge_method: 'S256',
		};

		const queryString = querystring.stringify(params);
		const authUrl = `${baseUrl}?${queryString}`;

		//console.log('MANDADO: ', codeVerifier);
		return {url: authUrl, codeVerifier, state};
	}

	async outlookLogin(code: string, codeVerifier: string, state: string, ip: string) {
		const coderesquest: msal.AuthorizationCodeRequest = {
			code: code,
			scopes: ['user.read', 'offline_access'],
			redirectUri: process.env.OUTLOOK_REDIRECT_URI,
			codeVerifier: codeVerifier,
			state: state,
		};
		try {
			const response = await this.msalClient.acquireTokenByCode(coderesquest);
			//console.log('Respuesta: ', response);
			const {data} = await this.httpService
				.get('https://graph.microsoft.com/v1.0/me', {
					headers: {Authorization: `Bearer ${response.accessToken}`},
				})
				.toPromise();

			return this.handleSocialLogin('outlook', data.id, data, ip);
		} catch (error) {
			console.error('Error during Outlook login:', error);
			if (error instanceof msal.AuthError) {
				console.error('MSAL Error:', error.errorCode, error.errorMessage);
			} else {
				console.error('Unexpected Error:', error);
			}
			throw new Error('Outlook login failed. Please try again later.');
		}
	}

	async appleLogin(idToken: string, ip: string) {
		try {
			const decodedToken = this.jwtService.verify(idToken, {
				secret: process.env.APPLE_CLIENT_SECRET,
			});
			return this.handleSocialLogin('apple', decodedToken.sub, decodedToken, ip);
		} catch (error) {
			console.error('Error during Apple login:', error);
			throw new Error('Apple login failed. Please try again later.');
		}
	}

	private async handleSocialLogin(provider: string, providerId: string, userData: any, ip: string) {
		const email = userData.email || userData.mail;

		// Primero busca por el providerId y provider
		let user = await this.userModel.findOne({
			'redes.provider': provider,
			'redes.providerId': providerId,
		});

		if (!user && email) {
			// Si no existe, intenta buscar por email
			user = await this.userModel.findOne({email});
		}

		if (user) {
			// Si el usuario existe, verifica si tiene la red social asociada
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
			// Si no existe un usuario con el correo o providerId, creamos uno nuevo
			user = await this.userModel.create({
				name: userData.given_name || userData.name || userData.givenName || '',
				last_name: userData.family_name || userData.surname || '',
				email: userData.email || userData.mail,
				verificado: true,
				redes: [
					{
						provider,
						providerId,
						profileUrl: userData.picture || userData.profile_image_url,
					},
				],
			});

			// Enviar notificación por correo
			this.emailService.sendNotification(user.email, 'Nuevo usuario registrado', 'src/emailTemplates/welcome_provaider.html', {
				name: user.name,
				last_name: user.last_name,
				email: user.email,
			});
		}

		// Autenticar al usuario y devolver el token
		return this.login(user, ip, provider);
	}

	async logout(userId: string) {
		// Invalida el Refresh Token
		const result = await this.refreshTokenModel.updateOne({userId: userId, isRevoked: false}, {isRevoked: true});

		if (result.modifiedCount === 0) {
			throw new Error('No active session found or already logged out.');
		}

		return {message: 'Logout successful'};
	}
}
