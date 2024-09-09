// src/database/database.module.ts
import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ConfigModule, ConfigService} from '@nestjs/config';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true, // Para que el módulo de configuración esté disponible en todo el proyecto
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get<string>('MONGODB_URI'),
			}),
			inject: [ConfigService],
		}),
	],
})
export class DatabaseModule {}
