import {Module} from '@nestjs/common';
import {FichaModuleController} from './controllers/fichaModule.controller';
import {FichaModuleService} from './services/fichaModule.service';
import {Ficha, FichaSchema} from './models/ficha.schema';
import {MongooseModule} from '@nestjs/mongoose';
import {Actividad, ActividadSchema} from './models/actividad.schema';
import {StatusFichaService} from './services/statusficha.service';
import {StatusfichaController} from './controllers/statusficha.controller';
import {ActividadService} from './services/actividad.service';
import {Status, StatusSchema} from './models/status.schema';
import {ActividadController} from './controllers/actividad.controller';
import {CriterioModule} from 'src/common/dto/params&populate/criterioFormat.module';
import {AuthModule} from 'src/userModule/auth/auth.module';
import {User, UserSchema} from 'src/userModule/models/user.schema';
import {RoleUser, RoleUserSchema} from 'src/userModule/models/roleuser.schema';
import {Permission, PermissionSchema} from 'src/userModule/models/permiso.schema';
import { NotificationsModule } from 'src/socket.io/notifications.module';
import { EmailModule } from 'src/common/email/email.module';
import { UploadsModule } from 'src/common/uploads/uploads.module';
import { CacheModule } from 'src/common/cache/cache.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{name: Ficha.name, schema: FichaSchema},
			{name: Actividad.name, schema: ActividadSchema},
			{name: Status.name, schema: StatusSchema},
			{name: User.name, schema: UserSchema},
			{name: RoleUser.name, schema: RoleUserSchema},
			{name: Permission.name, schema: PermissionSchema},
		]),
		AuthModule,
		NotificationsModule,
		CriterioModule,
		EmailModule,
		UploadsModule,
		CacheModule
	],
	providers: [FichaModuleService, StatusFichaService, ActividadService],
	controllers: [FichaModuleController, StatusfichaController, ActividadController],
	exports: [FichaModuleService, StatusFichaService, ActividadService],
})
export class FichaModuleModule {}
