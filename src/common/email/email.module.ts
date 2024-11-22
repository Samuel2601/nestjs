import {Module} from '@nestjs/common';
import {EmailController} from './email.controller';
import {EmailService} from './email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true, // Para que esté disponible globalmente
		}),
	],
	providers: [EmailService],
	controllers: [EmailController],
	exports: [EmailService],
})
export class EmailModule {}
