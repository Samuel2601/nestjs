import {Module} from '@nestjs/common';
import {FichaModuleController} from './controllers/fichaModule.controller';
import {FichaModuleService} from './services/fichaModule.service';
import {Ficha, FichaSchema} from './models/ficha.schema';
import {MongooseModule} from '@nestjs/mongoose';
import {Actividad, ActividadSchema} from './models/actividad.schema';
import {StatusFichaService} from './services/statusficha.service';
import {StatusfichaController} from './controllers/statusficha.controller';
import {ActividadService} from './services/actividad.service';
import {Status, StatusSchema} from './models/status.schema';
import {ActividadController} from './controllers/actividad.controller';
import { CriterioModule } from 'src/common/dto/params&populate/criterioFormat.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{name: Ficha.name, schema: FichaSchema},
			{name: Actividad.name, schema: ActividadSchema},
			{name: Status.name, schema: StatusSchema},
		]),
		CriterioModule
	],
	providers: [FichaModuleService, StatusFichaService, ActividadService],
	controllers: [FichaModuleController, StatusfichaController, ActividadController],
	exports: [FichaModuleService, StatusFichaService, ActividadService],
})
export class FichaModuleModule {}
