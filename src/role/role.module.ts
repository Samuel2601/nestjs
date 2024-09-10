import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleUserSchema } from 'src/models/roleuser.schema';
import { UserSchema } from 'src/models/user.schema';

@Module({
  imports: [MongooseModule.forFeature([
      { name: 'role', schema: RoleUserSchema },
      { name: 'user', schema: UserSchema },
    ])],
  providers: [
    RoleService,
  ],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}
