import { IsNotEmpty, Matches, IsString } from 'class-validator';

export class WhatsAppDto {
  @IsString({ message: 'El destinatario debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El destinatario no puede estar vacío.' })
  destinatario: string;

  @Matches(/^msg-\d+$/, { message: "El formato de customUid debe ser 'msg-NUMERO'." })
  customUid: string;

  @IsString({ message: 'El mensaje debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío.' })
  mensaje: string;
}
