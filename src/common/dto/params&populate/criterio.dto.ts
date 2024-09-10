import { IsOptional, IsString, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DateRange {
  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;
}

export class CriterioDTO {
  @IsOptional()
  @IsString()
  campo1?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DateRange)
  fechaCampo?: DateRange;

  // Agrega más campos según el modelo...
}
