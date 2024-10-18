import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {DatabaseModule} from './database/database.module';
import {userAppModule} from './userModule/userApp.module';
import { CacheModule } from './common/cache/Cache.module';

@Module({
	imports: [DatabaseModule, userAppModule,CacheModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
