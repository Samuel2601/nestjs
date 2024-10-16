import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {DatabaseModule} from './database/database.module';
import {userAppModule} from './userModule/userApp.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './userModule/models/user.schema';
import { RoleUser, RoleUserSchema } from './userModule/models/roleuser.schema';
import { Permission, PermissionSchema } from './userModule/models/permiso.schema';

@Module({
	imports: [
		DatabaseModule,
		userAppModule,
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			},
			{name: RoleUser.name, schema: RoleUserSchema},
			{name: Permission.name, schema: PermissionSchema},
		]),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
