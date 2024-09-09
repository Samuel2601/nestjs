import {Module} from '@nestjs/common';
import {UserController} from './user.controller';
import {UserService} from './user.service';
import {User, UserSchema} from 'src/models/user.schema';
import {MongooseModule} from '@nestjs/mongoose';
import {RoleUserSchema} from 'src/models/roleuser.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'user',
				schema: UserSchema,
			},
			{name: 'role', schema: RoleUserSchema},
		]),
	],
	providers: [UserService],
	controllers: [UserController],
	exports: [UserService],
})
export class UserModule {}
