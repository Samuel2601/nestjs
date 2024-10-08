import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class testDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
