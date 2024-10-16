import {Body, Controller, Post} from '@nestjs/common';

import {EmailService} from './email.service';

@Controller('/notifications')
export class EmailController {
	constructor(private readonly emailService: EmailService) {}

	@Post('send')
	async sendNotification(@Body() body: {to: string; subject: string; templatePath: string; templateData: any}) {
		const {to, subject, templatePath, templateData} = body;
		await this.emailService.sendNotification(to, subject, templatePath, templateData);
		return {message: 'Notification sent successfully'};
	}
}
