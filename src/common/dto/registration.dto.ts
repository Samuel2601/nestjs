import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RegistrationDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  name: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El apellido no puede estar vacío.' })
  last_name: string;

  @IsEmail({}, { message: 'Formato de correo electrónico incorrecto.' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @Length(5, 20, { message: 'La contraseña debe tener al menos 5 caracteres.' })
  password: string;

  @IsString({ message: 'Las contraseñas no coinciden.' })
  passwordConfirmation: string;

  @Matches(/^\d{10}$/, { message: 'El número de teléfono debe tener 10 dígitos.' })
  telf: string;

  @Matches(/^\d{10}$/, { message: 'El DNI debe tener 10 dígitos.' })
  dni?: string;
}
