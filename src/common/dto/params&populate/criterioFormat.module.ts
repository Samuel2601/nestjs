import { Module } from "@nestjs/common";
import { CriterioService } from "./criterioFormat.service";

@Module({
	providers: [CriterioService],
	exports:[CriterioService]// Asegúrate de que CriterioService está aquí
})
export class CriterioModule {}
