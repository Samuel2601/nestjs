import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';

@Module({
  imports: [],
  providers: [
    UploadsService,
  ],
  controllers: [],
  exports: [UploadsService],
})
export class UploadsModule {}
