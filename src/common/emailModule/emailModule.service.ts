import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import fs from 'fs';
import handlebars from 'handlebars';


@Injectable()
export class EmailModuleService {
 private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "mail.esmeraldas.gob.ec",
      port: 465,
      secure: true,
      auth: {
        user: "aplicaciones@esmeraldas.gob.ec",
        pass: "Alcaldia2024/*",
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
        from: "aplicaciones@esmeraldas.gob.ec",
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
      fs.readFile(filePath, { encoding: "utf-8" }, (err, html) => {
        if (err) {
          return reject(err);
        }
        resolve(html);
      });
    });
  }
}
