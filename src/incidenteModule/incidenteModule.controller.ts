import {
  Body,
  Query,
  Controller,
  Delete,
  Request,
  Get,
  Param,
  Post,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as Dto from './incidenteModule.dto';

@Controller('/')
export class IncidenteModuleController {
  @Get('test')
  async get(@Query() params: Dto.testDto) {
    return params;
  }

  @Post('test')
  async post(@Body() params: Dto.testDto) {
    return params;
  }

}
