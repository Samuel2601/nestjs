import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleUserSchema } from 'src/userModule/models/roleuser.schema';
import { UserSchema } from 'src/userModule/models/user.schema';
import { CriterioModule } from 'src/common/dto/params&populate/criterioFormat.module';
import { NotificationsModule } from 'src/socket.io/notifications.module';

@Module({
  imports: [MongooseModule.forFeature([
      { name: 'role', schema: RoleUserSchema },
      { name: 'user', schema: UserSchema },
    ]),CriterioModule,NotificationsModule],
  providers: [
    RoleService
  ],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}
