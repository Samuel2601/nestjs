import {Module} from '@nestjs/common';
import {PermisoController} from './permiso.controller';
import {PermisoService} from './permiso.service';
import {MongooseModule} from '@nestjs/mongoose';
import {User, UserSchema} from '../models/user.schema';
import {Permission, PermissionSchema} from '../models/permiso.schema';
import {NotificationsModule} from 'src/socket.io/notifications.module';
import {CriterioModule} from 'src/common/dto/params&populate/criterioFormat.module';
import {EmailModule} from 'src/common/email/email.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			},
			{name: Permission.name, schema: PermissionSchema},
		]),
		NotificationsModule,
		CriterioModule,
		EmailModule,
	],
	providers: [PermisoService],
	controllers: [PermisoController],
	exports: [PermisoService],
})
export class PermisoModule {}
