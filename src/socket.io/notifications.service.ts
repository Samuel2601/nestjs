import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  async notifyPermissionChange(userId: string, action: string, permiso: string) {
    this.notificationsGateway.notifyPermissionChange(userId, action, permiso);
  }

  async notifyRoleChange(userId: string, action: string, roleId: string) {
    this.notificationsGateway.notifyRoleChange(userId, action, roleId);
  }

  async notifyUser(userId: string, data: any,) {
     this.notificationsGateway.handleNotifyUser(userId, data);
  }
}
