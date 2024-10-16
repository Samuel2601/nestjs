import {Module} from '@nestjs/common';
import {RoleController} from './role.controller';
import {RoleService} from './role.service';
import {MongooseModule} from '@nestjs/mongoose';
import {RoleUser, RoleUserSchema} from 'src/userModule/models/roleuser.schema';
import {User, UserSchema} from 'src/userModule/models/user.schema';
import {Permission, PermissionSchema} from '../models/permiso.schema';
import {NotificationsModule} from 'src/socket.io/notifications.module';
import {CriterioModule} from 'src/common/dto/params&populate/criterioFormat.module';
import { PermisoModule } from '../permiso/permiso.module';
@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			},
			{name: RoleUser.name, schema: RoleUserSchema},
			{name: Permission.name, schema: PermissionSchema},
		]),
		NotificationsModule,
		CriterioModule,
		PermisoModule
	],
	providers: [RoleService],
	controllers: [RoleController],
	exports: [RoleService],
})
export class RoleModule {}
