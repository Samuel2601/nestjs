import {Module} from '@nestjs/common';
import {UserModule} from './user/user.module';
import {RoleModule} from './role/role.module';
import {NotificationsModule} from 'src/socket.io/notifications.module';
import {CriterioModule} from 'src/common/dto/params&populate/criterioFormat.module';

@Module({
	imports: [UserModule, RoleModule, NotificationsModule, CriterioModule],
	providers: [],
	controllers: [],
	exports: [],
})
export class userAppModule {}
