import {Body, Controller, Post} from '@nestjs/common';

import {EmailModuleService} from './emailModule.service';

@Controller('/notifications')
export class EmailModuleController {
	constructor(private readonly emailModuleService: EmailModuleService) {}

	@Post('send')
	async sendNotification(@Body() body: {to: string; subject: string; templatePath: string; templateData: any}) {
		const {to, subject, templatePath, templateData} = body;
		await this.emailModuleService.sendNotification(to, subject, templatePath, templateData);
		return {message: 'Notification sent successfully'};
	}
}
