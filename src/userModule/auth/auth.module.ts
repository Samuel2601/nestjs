import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {MongooseModule} from '@nestjs/mongoose';
import {User, UserSchema} from '../models/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			},
		]),
		JwtModule.register({
			secret: process.env.JWT_SECRET, // La clave secreta para firmar los tokens
			signOptions: {expiresIn: '60s'}, // Opciones de firma
		}),
		HttpModule
	],
	providers: [AuthService],
	controllers: [AuthController],
	exports: [AuthService],
})
export class AuthModule {}
