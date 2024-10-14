import {Module} from '@nestjs/common';
import {UserModule} from './user/user.module';
import {RoleModule} from './role/role.module';
import {NotificationsModule} from 'src/socket.io/notifications.module';
import {CriterioModule} from 'src/common/dto/params&populate/criterioFormat.module';
import {EmailModuleModule} from 'src/common/emailModule/emailModule.module';
import { UploadsModule } from 'src/common/uploads/uploads.module';
import { AuthModule } from './auth/auth.module';

@Module({
	imports: [UserModule, RoleModule, NotificationsModule, CriterioModule, EmailModuleModule, UploadsModule, AuthModule],
	providers: [],
	controllers: [],
	exports: [],
})
export class userAppModule {}
