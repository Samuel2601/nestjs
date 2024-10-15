import {Injectable} from '@nestjs/common';
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
		private jwtService: JwtService,
		private httpService: HttpService,
	) {
		this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
		this.msalClient = new msal.PublicClientApplication({
			auth: {
				clientId: process.env.OUTLOOK_CLIENT_ID,
				//clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
				authority: 'https://login.microsoftonline.com/consumers',
				//knownAuthorities: ['login.microsoftonline.com'],
			},
		});
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
		try {
			const ticket = await this.googleClient.verifyIdToken({
				idToken: token,
				audience: process.env.GOOGLE_CLIENT_ID,
			});
			const payload = ticket.getPayload();
			return this.handleSocialLogin('google', payload.sub, payload);
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

	async googleOneTapLogin(credential: string) {
		console.log('Se recibe el credential:', credential);

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

			return this.handleSocialLogin('google', payload.sub, payload);
		} catch (error) {
			console.error('Error during Google One Tap login:', error);
			throw new Error('Google One Tap login failed. Please try again later.');
		}
	}

	async googlePlusLogin(accessToken: string) {
		try {
			const {data} = await this.httpService.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`).toPromise();
			return this.handleSocialLogin('google_plus', data.id, data);
		} catch (error) {
			console.error('Error during Google Plus login:', error);
			throw new Error('Google Plus login failed. Please try again later.');
		}
	}

	async facebookLogin(accessToken: string) {
		try {
			const {data} = await this.httpService.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`).toPromise();
			return this.handleSocialLogin('facebook', data.id, data);
		} catch (error) {
			console.error('Error during Facebook login:', error);
			throw new Error('Facebook login failed. Please try again later.');
		}
	}

	// Genera un código verificador
	async generateCodeVerifier() {
		return cryptoO.randomBytes(32).toString('hex');
	}

	// Genera un código desafío
	async generateCodeChallenge(verifier: string) {
		return cryptoO.createHash('sha256').update(verifier).digest('base64url');
	}
	codes: string = '';
	async getOutlookAuthorizationUrl(): Promise<string> {
		const codeVerifier = await this.generateCodeVerifier();
		this.codes = codeVerifier;
		const codeChallenge = await this.generateCodeChallenge(codeVerifier);
		const baseUrl = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize';

		// Use a string for the scope instead of an array
		const params = {
			client_id: process.env.OUTLOOK_CLIENT_ID,
			response_type: 'code',
			redirect_uri: process.env.OUTLOOK_REDIRECT_URI,
			scope: 'user.read', // Change array to string
			response_mode: 'query',
			prompt: 'consent',
			state: 'some_random_state',
			code_challenge: codeChallenge,
			code_challenge_method: 'S256',
		};

		const queryString = querystring.stringify(params);
		const authurl = `${baseUrl}?${queryString}`;
		return authurl;
	}

	async outlookLogin(code: string) {
		try {
			const response = await this.msalClient.acquireTokenByCode({
				code: code,
				scopes: ['user.read'], // This can remain as an array
				redirectUri: process.env.OUTLOOK_REDIRECT_URI,
				codeVerifier: this.codes,
			});

			const {data} = await this.httpService
				.get('https://graph.microsoft.com/v1.0/me', {
					headers: {Authorization: `Bearer ${response.accessToken}`},
				})
				.toPromise();

			return this.handleSocialLogin('outlook', data.id, data);
		} catch (error) {
			console.error('Error during Outlook login:', error);
			if (error instanceof msal.ClientAuthError) {
				console.error('MSAL Error:', error.errorCode, error.errorMessage);
			} else {
				console.error('Unexpected Error:', error);
			}
			throw new Error('Outlook login failed. Please try again later.');
		}
	}

	async appleLogin(idToken: string) {
		try {
			const decodedToken = this.jwtService.verify(idToken, {
				secret: process.env.APPLE_CLIENT_SECRET,
			});
			return this.handleSocialLogin('apple', decodedToken.sub, decodedToken);
		} catch (error) {
			console.error('Error during Apple login:', error);
			throw new Error('Apple login failed. Please try again later.');
		}
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
