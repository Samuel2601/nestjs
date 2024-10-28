import {IpGeolocationService} from './userModule/auth/ip-geolocation.service';
import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {DatabaseModule} from './database/database.module';
import {userAppModule} from './userModule/userApp.module';
import {CacheModule} from './common/cache/Cache.module';
import { FichaModuleModule } from './fichaModule/fichaModule.module';

@Module({
	imports: [DatabaseModule, userAppModule, CacheModule, FichaModuleModule],
	controllers: [AppController],
	providers: [IpGeolocationService, AppService],
})
export class AppModule {}
