import { Module } from '@nestjs/common';
import { FichaModuleController } from './fichaModule.controller';
import { FichaModuleService } from './fichaModule.service';
import { Ficha, FichaSchema } from './models/ficha.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: Ficha.name, schema: FichaSchema }])],
  providers: [
    FichaModuleService,
  ],
  controllers: [FichaModuleController],
  exports: [FichaModuleService],
})
export class FichaModuleModule {}
