import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import * as session from 'express-session';
async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Habilitar CORS para permitir solicitudes de cualquier origen
	app.enableCors({
		origin: '*', // Esto permite solicitudes desde cualquier origen, puedes restringirlo a un dominio específico si lo deseas
		methods: 'GET,POST,PUT,DELETE,OPTIONS',
		allowedHeaders: 'Content-Type, Authorization',
	});

	// Configurar el middleware de sesiones
	app.use(
		session({
			secret: process.env.SECRET_SESSION, // Cambia esto por una clave secreta segura
			resave: false,
			saveUninitialized: false,
			cookie: {secure: false}, // Cambia a 'true' si usas HTTPS
		}),
	);

	await app.listen(process.env.PORT || 3000); // Escuchar en el puerto especificado en las variables de entorno o en el puerto 3000 por defecto
}
bootstrap();
