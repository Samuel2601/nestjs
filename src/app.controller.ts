import {Controller, Get} from '@nestjs/common';
import {AppService} from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get('init')
	async init(): Promise<any> {
		return await this.appService.onModuleInit(); 
	}
}
