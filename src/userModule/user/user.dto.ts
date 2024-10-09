import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean, IsMongoId, MinLength } from 'class-validator';

/**
 * DTO para crear un nuevo usuario.
 */
export class CreateUserDto {
  /**
   * Nombre del usuario.
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Apellido del usuario (opcional).
   */
  @IsString()
  last_name?: string;

  /**
   * DNI del usuario (opcional).
   */
  @IsString()
  dni?: string;

  /**
   * Teléfono del usuario (opcional).
   */
  @IsString()
  telf?: string;

  /**
   * Correo electrónico del usuario.
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * Contraseña del usuario (opcional).
   */
  @IsString()
  password?: string;

  /**
   * Estado del usuario (activo o inactivo).
   */
  @IsNotEmpty()
  status: boolean;

  /**
   * Rol del usuario (referencia al ID de rol).
   */
  @IsOptional()
  @IsString()
  role: string; // Cambia el tipo según tu esquema de rol

  /**
   * ID de Google del usuario (opcional).
   */
  googleId?: string;

  /**
   * ID de Facebook del usuario (opcional).
   */
  facebookId?: string;

  /**
   * URL de la foto del usuario (opcional).
   */
  photo?: string;

  /**
   * Código de verificación del usuario (opcional).
   */
  verificationCode?: string;

}

/**
 * DTO para actualizar un usuario existente.
 */
export class UpdateUserDto {
  @IsMongoId()
  _id: string;
  /**
   * Nombre del usuario (opcional).
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * Apellido del usuario (opcional).
   */
  @IsString()
  @IsOptional()
  last_name?: string;

  /**
   * DNI del usuario (opcional).
   */
  @IsString()
  @IsOptional()
  dni?: string;

  /**
   * Teléfono del usuario (opcional).
   */
  @IsString()
  @IsOptional()
  telf?: string;

  /**
   * Correo electrónico del usuario (opcional).
   */
  @IsEmail()
  @IsOptional()
  email?: string;

  /**
   * Contraseña del usuario, con al menos 6 caracteres (opcional).
   */
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  /**
   * Indicador de si el usuario está verificado (opcional).
   */
  @IsBoolean()
  @IsOptional()
  verificado?: boolean;

  /**
   * Estado del usuario (activo o inactivo) (opcional).
   */
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  /**
   * ID del rol asociado al usuario (opcional).
   */
  @IsMongoId()
  @IsOptional()
  role?: string;

  /**
   * ID de Google del usuario (opcional).
   */
  @IsString()
  @IsOptional()
  googleId?: string;

  /**
   * ID de Facebook del usuario (opcional).
   */
  @IsString()
  @IsOptional()
  facebookId?: string;

  /**
   * URL de la foto del usuario (opcional).
   */
  @IsString()
  @IsOptional()
  photo?: string;

  /**
   * Código de verificación del usuario (opcional).
   */
  @IsString()
  @IsOptional()
  verificationCode?: string;

  /**
   * Fecha de creación del usuario (opcional).
   */
  @IsOptional()
  createdAt?: Date;

  /**
   * Contraseña temporal del usuario (opcional).
   */
  @IsString()
  @IsOptional()
  password_temp?: string;
}
