import { IsMongoId } from "class-validator";

export class FindUserByIdDto {
  @IsMongoId({ message: 'Invalid ID format' })
  id: string;
}