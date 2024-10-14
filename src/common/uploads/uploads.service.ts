import {Injectable} from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Injectable()
export class UploadsService {
	static configureMulter(maxSize: number, path_destination?: string) {
		return {
			storage: diskStorage({
				destination: './uploads/'+path_destination, // Directorio donde se guardarán los archivos
				filename: (req, file, cb) => {
					const randomName = Array(32)
						.fill(null)
						.map(() => Math.round(Math.random() * 16).toString(16))
						.join('');
					cb(null, `${randomName}${extname(file.originalname)}`);
				},
			}),
			limits: {fileSize: maxSize}, // Límite de tamaño
			fileFilter: (req, file, cb) => {
				if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
					return cb(new Error('Solo se permiten imágenes'), false);
				}
				cb(null, true);
			},
		};
	}
}
