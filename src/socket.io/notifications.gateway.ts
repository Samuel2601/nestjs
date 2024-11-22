import {SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';

@WebSocketGateway({
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
	path: '/new/socket.io', // Define el path como lo tienes en tu código
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	private userSockets: {[key: string]: Socket[]} = {};

	handleConnection(client: Socket) {
		console.log('a user connected:', client.id);
		client.emit('welcome', 'Welcome to the server!');
	}

	handleDisconnect(client: Socket) {
		console.log('User disconnected:', client.id);
		// Aquí puedes manejar la desconexión y eliminar el socket si está asociado a un userId

		for (const userId in this.userSockets) {
			this.userSockets[userId] = this.userSockets[userId].filter((socket) => socket.id !== client.id);

			if (this.userSockets[userId].length === 0) {
				delete this.userSockets[userId];
			}
		}
	}

	@SubscribeMessage('set-user-id')
	handleSetUserId(client: Socket, userId: string) {
		console.log(`User ${userId} connected with socket ${client.id}`);

		// Si el userId ya tiene sockets asociados, añadimos el nuevo socket
		if (this.userSockets[userId]) {
			this.userSockets[userId].push(client);
		} else {
			// Si no, creamos un nuevo array para este userId con el socket actual
			this.userSockets[userId] = [client];
		}
	}

	@SubscribeMessage('notify-user')
	handleNotifyUser(userId: string, data: any) {
		const userSockets = this.userSockets[userId];
		if (userSockets && userSockets.length > 0) {
			userSockets.forEach((socket) => {
				socket.emit('notification', data);
			});
		} else {
			console.log(`User ${userId} not connected.`);
		}
	}
	
	// Funciones de notificación para cambios de permisos y roles
	notifyPermissionChange(userId: string, action: string, permiso: string) {
		const userSockets = this.userSockets[userId];
		if (userSockets && userSockets.length > 0) {
			userSockets.forEach((socket) => {
				socket.emit('permissions-updated', {action, permiso});
				console.log('Se notificó a usuario', userId, 'del cambio de permiso:', permiso, 'para:', action);
			});
		} else {
			console.log(`User ${userId} not connected.`);
		}
	}

	notifyRoleChange(userId: string, action: string, roleId: string) {
		const userSockets = this.userSockets[userId];
		if (userSockets && userSockets.length > 0) {
			userSockets.forEach((socket) => {
				socket.emit('role-updated', {action, roleId});
				console.log('Se notificó a usuario', userId, 'del cambio de rol:', roleId, 'para:', action);
			});
		} else {
			console.log(`User ${userId} not connected.`);
		}
	}
}
