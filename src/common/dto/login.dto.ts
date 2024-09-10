import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Formato de correo electrónico incorrecto.' })
  @IsNotEmpty({ message: 'El email no puede estar vacío.' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  @Length(5, 20, { message: 'La contraseña debe tener al menos 5 caracteres.' })
  password: string;
}
