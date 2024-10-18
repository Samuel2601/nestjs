import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {UserService} from './user.service';
import {UserController} from './user.controller';

import {User, UserSchema} from 'src/userModule/models/user.schema';
import {RoleUser, RoleUserSchema} from 'src/userModule/models/roleuser.schema';
import {Permission, PermissionSchema} from '../models/permiso.schema';
import {RoleModule} from '../role/role.module';
import {NotificationsModule} from 'src/socket.io/notifications.module';
import {CriterioModule} from 'src/common/dto/params&populate/criterioFormat.module';
import { EmailModule } from 'src/common/email/email.module';
import { AuthModule } from '../auth/auth.module';

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
		RoleModule,
		NotificationsModule,
		CriterioModule,
		EmailModule,
		AuthModule
	],
	providers: [UserService],
	controllers: [UserController],
	exports: [UserService],
})
export class UserModule {}
