import {Injectable} from '@nestjs/common';
import * as nodemailer from 'nodemailer'; // Usa * para importar todo el módulo de nodemailer
import * as fs from 'fs'; // Asegúrate de usar la forma correcta para importar módulos nativos de Node.js
import * as handlebars from 'handlebars';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class EmailService {
	private transporter: nodemailer.Transporter; // Usa el tipo correcto para el transporter

	constructor(private configService: ConfigService) {
		this.transporter = nodemailer.createTransport({
			host: this.configService.get<string>('EMAIL_HOST'),
			port: this.configService.get<number>('EMAIL_PORT'),
			secure: true,
			auth: {
				user: this.configService.get<string>('EMAIL_USER'),
				pass: this.configService.get<string>('EMAIL_PASS'),
			},
		});
	}

	async sendNotification(to: string, subject: string, templatePath: string, templateData: any) {
		try {
			// Lee el archivo HTML
			const html = await this.readHTMLFile(templatePath);
			// Compón el contenido del correo
			const template = handlebars.compile(html);
			const htmlToSend = template(templateData);

			const mailOptions = {
				from: this.configService.get<string>('EMAIL_USER'),
				to,
				subject,
				html: htmlToSend,
			};

			// Envía el correo
			await this.transporter.sendMail(mailOptions);
			console.log('Email sent successfully');
		} catch (error) {
			console.error('Error sending email:', error);
		}
	}

	private readHTMLFile(filePath: string): Promise<string> {
		return new Promise((resolve, reject) => {
			fs.readFile(filePath, {encoding: 'utf-8'}, (err, html) => {
				if (err) {
					return reject(err);
				}
				resolve(html);
			});
		});
	}
}
