import {Module} from '@nestjs/common';
import {UserModule} from './user/user.module';
import {RoleModule} from './role/role.module';
import {NotificationsModule} from 'src/socket.io/notifications.module';
import {CriterioModule} from 'src/common/dto/params&populate/criterioFormat.module';
import {EmailModule} from 'src/common/email/email.module';
import {UploadsModule} from 'src/common/uploads/uploads.module';
import {AuthModule} from './auth/auth.module';
import {PermisoModule} from './permiso/permiso.module';
import {MongooseModule} from '@nestjs/mongoose';
import {User, UserSchema} from './models/user.schema';
import {RoleUser, RoleUserSchema} from './models/roleuser.schema';
import {Permission, PermissionSchema} from './models/permiso.schema';
import {CacheModule} from 'src/common/cache/Cache.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{name: User.name, schema: UserSchema},
			{name: RoleUser.name, schema: RoleUserSchema},
			{name: Permission.name, schema: PermissionSchema},
		]),
		UserModule,
		RoleModule,
		PermisoModule,
		NotificationsModule,
		CriterioModule,
		EmailModule,
		UploadsModule,
		AuthModule,
		CacheModule,
	],
	providers: [],
	controllers: [],
	exports: [MongooseModule],
})
export class userAppModule {}
