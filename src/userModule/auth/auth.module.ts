import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {MongooseModule} from '@nestjs/mongoose';
import {User, UserSchema} from '../models/user.schema';
import {JwtModule} from '@nestjs/jwt';
import {HttpModule} from '@nestjs/axios';
import {EmailModule} from 'src/common/email/email.module';
import {AuthGuard} from 'src/userModule/auth/guards/auth.guard';
import { RoleUser, RoleUserSchema } from '../models/roleuser.schema';
import { Permission, PermissionSchema } from '../models/permiso.schema';
import { CacheModule } from 'src/common/cache/Cache.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{name: User.name, schema: UserSchema},
			{name: RoleUser.name, schema: RoleUserSchema},
			{name: Permission.name, schema: PermissionSchema},
		]),
		JwtModule.register({
			secret: process.env.JWT_SECRET, // La clave secreta para firmar los tokens
			signOptions: {expiresIn: '60h'}, // Opciones de firma
		}),
		HttpModule,
		EmailModule,
		CacheModule
	],
	providers: [AuthService, AuthGuard],
	controllers: [AuthController],
	exports: [AuthService, JwtModule, AuthGuard],
})
export class AuthModule {}
